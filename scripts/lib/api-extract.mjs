/**
 * Extracts the public API of Volt components — selectors, inputs, outputs, models, host-directive
 * I/O, CVA variants and barrel exports — from the Angular source, with the TypeScript compiler
 * API (already a dependency of the repository; no ts-morph).
 *
 * Supported, per decorated class (`@Component` / `@Directive`), each one in a file on its own:
 *
 *   input(), input<T>(default, opts), input.required<T>(opts)        alias, transform, required
 *   model(), model.required()                                         + the generated `<name>Change`
 *   output<T>(opts)                                                   alias
 *   @Input() / @Input('alias') / @Input({ alias, required, transform }), @Output()
 *   hostDirectives: [Dir, { directive: Dir, inputs: ['a', 'b: c'], outputs: [...] }]
 *                    types resolved from the directive's own source (a Volt directive) or its
 *                    published declaration file (ng-primitives)
 *   class X extends Base                                              Base's I/O, if Base is in reach
 *   variants.ts: every `cva(base, { variants, defaultVariants })`
 *   index.ts: which classes the component's barrel exports
 *
 * Anything the extractor cannot read is a diagnostic, never a silent omission: generators fail on
 * `severity: 'error'`. Used by scripts/generate-api-reference.mjs (docs data), generate-api-freeze.mjs
 * (the v0.9 freeze) and generate-mcp-content.mjs (the MCP technical facts), so all three agree.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

export function listComponentDirs(root) {
  return readdirSync(root)
    .filter(name => statSync(join(root, name)).isDirectory())
    .sort();
}

function listSourceFiles(dir) {
  return readdirSync(dir)
    .filter(
      f => f.endsWith('.ts') && !f.endsWith('.spec.ts') && f !== 'index.ts' && f !== 'variants.ts'
    )
    .sort();
}

const parse = (fileName, text) =>
  ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

/** Source text with whitespace runs collapsed, the way it reads in a table. */
const text = node => node.getText().replace(/\s+/g, ' ').trim();

/** A transform by name (`booleanAttribute`, `numberAttribute as never`), or `inline` for a lambda. */
function transformName(node) {
  if (!node) return undefined;
  let inner = node;
  while (ts.isAsExpression(inner) || ts.isParenthesizedExpression(inner)) inner = inner.expression;
  return ts.isIdentifier(inner) || ts.isPropertyAccessExpression(inner) ? text(inner) : 'inline';
}

function decoratorsOf(node) {
  return (ts.canHaveDecorators(node) ? ts.getDecorators(node) : undefined) ?? [];
}

function decoratorCall(node, names) {
  for (const decorator of decoratorsOf(node)) {
    const expr = decorator.expression;
    if (ts.isCallExpression(expr) && ts.isIdentifier(expr.expression)) {
      if (names.includes(expr.expression.text)) return expr;
    }
  }
  return null;
}

function propertyName(node) {
  if (!node) return null;
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    return node.text;
  return null;
}

/** `{ a: x, b: y }` → Map of name → initializer node. */
function objectProps(node) {
  const props = new Map();
  if (!node || !ts.isObjectLiteralExpression(node)) return props;
  for (const prop of node.properties) {
    if (ts.isPropertyAssignment(prop)) props.set(propertyName(prop.name), prop.initializer);
    else if (ts.isShorthandPropertyAssignment(prop)) props.set(prop.name.text, prop.name);
  }
  return props;
}

function stringValue(node) {
  if (node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)))
    return node.text;
  return null;
}

function booleanValue(node) {
  if (!node) return null;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  return null;
}

function inferTypeFromLiteral(node) {
  if (!node) return 'unknown';
  if (node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword)
    return 'boolean';
  if (ts.isNumericLiteral(node)) return 'number';
  if (ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(node.operand)) return 'number';
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return 'string';
  if (ts.isTemplateExpression(node)) return 'string';
  if (ts.isArrayLiteralExpression(node)) return 'array';
  if (ts.isObjectLiteralExpression(node)) return 'object';
  if (node.kind === ts.SyntaxKind.NullKeyword) return 'null';
  return 'unknown';
}

/**
 * `input`, `input.required`, `model`, `model.required`, `output`, or null. Anything else that is
 * spelt like one of them (a renamed import, a wrapper) is reported by the caller.
 */
function signalKind(call) {
  const callee = call.expression;
  if (ts.isIdentifier(callee) && ['input', 'model', 'output'].includes(callee.text)) {
    return { kind: callee.text, required: false };
  }
  if (
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    ['input', 'model'].includes(callee.expression.text) &&
    callee.name.text === 'required'
  ) {
    return { kind: callee.expression.text, required: true };
  }
  return null;
}

function isPublic(member) {
  const mods = ts.canHaveModifiers(member) ? (ts.getModifiers(member) ?? []) : [];
  return !mods.some(
    m => m.kind === ts.SyntaxKind.PrivateKeyword || m.kind === ts.SyntaxKind.ProtectedKeyword
  );
}

/** Imports of a file: local name → { from, imported }. */
function importsOf(sourceFile) {
  const map = new Map();
  for (const stmt of sourceFile.statements) {
    if (!ts.isImportDeclaration(stmt) || !stmt.importClause) continue;
    const from = stmt.moduleSpecifier.text;
    const bindings = stmt.importClause.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
      for (const el of bindings.elements) {
        map.set(el.name.text, { from, imported: (el.propertyName ?? el.name).text });
      }
    }
  }
  return map;
}

// ---------------------------------------------------------------------------------------------
// External directive declarations (ng-primitives): types of the inputs a host directive exposes
// ---------------------------------------------------------------------------------------------

const declarationCache = new Map();

function declarationFileFor(specifier, fromDir) {
  const parts = specifier.split('/');
  const pkg = specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
  const subpath = '.' + specifier.slice(pkg.length);
  for (const base of [fromDir, REPO_ROOT]) {
    let dir = resolve(base);
    for (;;) {
      const pkgJson = join(dir, 'node_modules', pkg, 'package.json');
      if (existsSync(pkgJson)) {
        const meta = JSON.parse(readFileSync(pkgJson, 'utf8'));
        const entry = meta.exports?.[subpath];
        const types = typeof entry === 'object' ? (entry.types ?? entry.typings) : null;
        if (types) return join(dirname(pkgJson), types);
        if (subpath === '.' && (meta.types || meta.typings))
          return join(dirname(pkgJson), meta.types || meta.typings);
        return null;
      }
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  return null;
}

const SIGNAL_TYPE =
  /^(?:\w+\.)?(InputSignalWithTransform|InputSignal|ModelSignal|OutputEmitterRef|OutputRef|EventEmitter)<(.*)>$/s;

function splitTypeArgs(str) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '=' && str[i + 1] === '>') {
      current += '=>';
      i++;
      continue;
    }
    if ('<([{'.includes(ch)) depth++;
    if ('>)]}'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/** Public input/output names → types, read from a compiled directive's `.d.ts`. */
function externalDirectiveIO(className, file) {
  const key = `${file}#${className}`;
  if (declarationCache.has(key)) return declarationCache.get(key);
  let result = null;
  if (file && existsSync(file)) {
    const sf = parse(file, readFileSync(file, 'utf8'));
    const cls = sf.statements.find(
      s => ts.isClassDeclaration(s) && s.name && s.name.text === className
    );
    if (cls) {
      const members = new Map();
      for (const m of cls.members) {
        if (ts.isPropertyDeclaration(m) && m.type && propertyName(m.name)) {
          members.set(propertyName(m.name), m.type.getText().replace(/\s+/g, ' '));
        }
      }
      const inputs = new Map();
      const outputs = new Map();
      const dir = cls.members.find(
        m => ts.isPropertyDeclaration(m) && /^ɵ(dir|cmp)$/.test(propertyName(m.name) ?? '')
      );
      const args =
        dir && dir.type && ts.isTypeReferenceNode(dir.type) ? dir.type.typeArguments : null;
      const signalType = prop => {
        const t = members.get(prop);
        const m = t && t.match(SIGNAL_TYPE);
        return m ? splitTypeArgs(m[2])[0] : (t ?? 'unknown');
      };
      if (args && args[3] && ts.isTypeLiteralNode(args[3])) {
        for (const member of args[3].members) {
          const prop = propertyName(member.name);
          const lit = member.type && ts.isTypeLiteralNode(member.type) ? member.type : null;
          const alias = lit?.members
            .find(x => propertyName(x.name) === 'alias')
            ?.type?.getText()
            .replace(/^["']|["']$/g, '');
          inputs.set(alias ?? prop, signalType(prop));
        }
      }
      if (args && args[4] && ts.isTypeLiteralNode(args[4])) {
        for (const member of args[4].members) {
          const prop = propertyName(member.name);
          const alias = member.type?.getText().replace(/^["']|["']$/g, '');
          outputs.set(alias ?? prop, signalType(prop));
        }
      }
      result = { inputs, outputs };
    }
  }
  declarationCache.set(key, result);
  return result;
}

// ---------------------------------------------------------------------------------------------
// Volt source
// ---------------------------------------------------------------------------------------------

const sourceCache = new Map();

function loadSource(file) {
  if (!sourceCache.has(file)) sourceCache.set(file, parse(file, readFileSync(file, 'utf8')));
  return sourceCache.get(file);
}

function resolveLocalModule(fromFile, specifier) {
  const base = resolve(dirname(fromFile), specifier);
  for (const candidate of [`${base}.ts`, join(base, 'index.ts')]) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

/** Finds a class declaration by name in a file, following `export … from` re-exports. */
function findClass(file, name, seen = new Set()) {
  if (!file || seen.has(file)) return null;
  seen.add(file);
  const sf = loadSource(file);
  for (const stmt of sf.statements) {
    if (ts.isClassDeclaration(stmt) && stmt.name?.text === name) return { file, node: stmt };
  }
  for (const stmt of sf.statements) {
    if (!ts.isExportDeclaration(stmt) || !stmt.moduleSpecifier) continue;
    const spec = stmt.moduleSpecifier.text;
    if (!spec.startsWith('.')) continue;
    const named = stmt.exportClause && ts.isNamedExports(stmt.exportClause);
    if (named) {
      const el = stmt.exportClause.elements.find(e => e.name.text === name);
      if (!el) continue;
      const found = findClass(
        resolveLocalModule(file, spec),
        (el.propertyName ?? el.name).text,
        seen
      );
      if (found) return found;
    } else {
      const found = findClass(resolveLocalModule(file, spec), name, seen);
      if (found) return found;
    }
  }
  const imported = importsOf(sf).get(name);
  if (imported && imported.from.startsWith('.')) {
    return findClass(resolveLocalModule(file, imported.from), imported.imported, seen);
  }
  return null;
}

function where(node) {
  const sf = node.getSourceFile();
  const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
  return `${sf.fileName.replace(`${REPO_ROOT}/`, '')}:${line + 1}`;
}

/** Signal and decorator I/O declared on the class body itself. */
function ownIO(cls, diagnostics) {
  const inputs = [];
  const outputs = [];
  for (const member of cls.members) {
    const name = propertyName(member.name);
    // Decorator-based I/O (`@Input() x`), on properties and setters alike.
    const inputDecorator = decoratorCall(member, ['Input']);
    const outputDecorator = decoratorCall(member, ['Output']);
    if (inputDecorator) {
      const arg = inputDecorator.arguments[0];
      const opts = objectProps(arg);
      const alias = stringValue(arg) ?? stringValue(opts.get('alias'));
      const type =
        (ts.isPropertyDeclaration(member) || ts.isSetAccessorDeclaration(member)) &&
        (member.type ?? member.parameters?.[0]?.type);
      inputs.push({
        name: alias ?? name,
        type: type ? text(type) : inferTypeFromLiteral(member.initializer),
        required: booleanValue(opts.get('required')) === true,
        default: member.initializer ? text(member.initializer) : undefined,
        transform: transformName(opts.get('transform')),
        source: 'decorator',
      });
      continue;
    }
    if (outputDecorator) {
      const alias = stringValue(outputDecorator.arguments[0]);
      const init = member.initializer;
      const generic =
        init && ts.isNewExpression(init) && init.typeArguments?.[0]
          ? text(init.typeArguments[0])
          : 'void';
      outputs.push({ name: alias ?? name, type: generic, source: 'decorator' });
      continue;
    }
    if (!ts.isPropertyDeclaration(member) || !member.initializer) continue;
    const init = member.initializer;
    if (!ts.isCallExpression(init)) continue;
    const signal = signalKind(init);
    if (!signal) {
      const callee = text(init.expression);
      if (/^(?:input|model|output)\w*(?:\.\w+)?$/.test(callee)) {
        diagnostics.push({
          severity: 'error',
          where: where(member),
          message: `"${name} = ${callee}(…)" is not a form the API extractor understands (input/input.required/model/model.required/output)`,
        });
      }
      continue;
    }
    if (!isPublic(member) && signal.kind !== 'output') {
      diagnostics.push({
        severity: 'warning',
        where: where(member),
        message: `${name} is a non-public ${signal.kind}(); Angular binds it, but it is documented as-is`,
      });
    }
    const [first, second] = init.arguments;
    // `input.required(opts)` / `output(opts)` take options first; `input(default, opts)` second.
    const optionsNode = signal.required || signal.kind === 'output' ? first : second;
    const defaultNode = signal.required || signal.kind === 'output' ? undefined : first;
    const opts = objectProps(optionsNode);
    const alias = stringValue(opts.get('alias'));
    const publicName = alias ?? name;
    const generic = init.typeArguments?.[0] ? text(init.typeArguments[0]) : null;
    const type = generic ?? (signal.kind === 'output' ? 'void' : inferTypeFromLiteral(defaultNode));
    if (signal.kind === 'output') {
      outputs.push({ name: publicName, type, source: 'signal' });
    } else {
      inputs.push({
        name: publicName,
        type,
        required: signal.required,
        default: defaultNode ? text(defaultNode) : undefined,
        transform: transformName(opts.get('transform')),
        ...(signal.kind === 'model' ? { model: true } : {}),
        source: 'signal',
      });
      if (signal.kind === 'model') {
        outputs.push({ name: `${publicName}Change`, type, model: true, source: 'signal' });
      }
    }
  }
  return { inputs, outputs };
}

/** Public I/O of a directive referenced from a file: Volt source, or a published `.d.ts`. */
function directiveIO(file, name, diagnostics, depth = 0) {
  const sf = loadSource(file);
  const imported = importsOf(sf).get(name);
  if (!imported || imported.from.startsWith('.')) {
    const found = imported
      ? findClass(resolveLocalModule(file, imported.from), imported.imported)
      : findClass(file, name);
    if (!found) return null;
    const io = classIO(found.node, diagnostics, depth + 1);
    return {
      inputs: new Map(io.inputs.map(i => [i.name, i.type])),
      outputs: new Map(io.outputs.map(o => [o.name, o.type])),
    };
  }
  return externalDirectiveIO(imported.imported, declarationFileFor(imported.from, dirname(file)));
}

function hostDirectiveIO(decoratorProps, sf, diagnostics) {
  const inputs = [];
  const outputs = [];
  const list = decoratorProps.get('hostDirectives');
  if (!list) return { inputs, outputs };
  if (!ts.isArrayLiteralExpression(list)) {
    diagnostics.push({
      severity: 'error',
      where: where(list),
      message: 'hostDirectives is not an array literal; its inputs/outputs cannot be documented',
    });
    return { inputs, outputs };
  }
  for (const entry of list.elements) {
    // A bare directive exposes none of its inputs/outputs to the template.
    if (ts.isIdentifier(entry)) continue;
    if (!ts.isObjectLiteralExpression(entry)) {
      diagnostics.push({
        severity: 'error',
        where: where(entry),
        message: `hostDirectives entry "${text(entry)}" is not understood`,
      });
      continue;
    }
    const props = objectProps(entry);
    const directive = props.get('directive');
    const dirName = directive && ts.isIdentifier(directive) ? directive.text : null;
    const io = dirName ? directiveIO(sf.fileName, dirName, diagnostics) : null;
    for (const [key, target] of [
      ['inputs', inputs],
      ['outputs', outputs],
    ]) {
      const arr = props.get(key);
      if (!arr) continue;
      if (!ts.isArrayLiteralExpression(arr)) {
        diagnostics.push({
          severity: 'error',
          where: where(arr),
          message: `hostDirectives ${key} of ${dirName} is not an array literal`,
        });
        continue;
      }
      for (const el of arr.elements) {
        const raw = stringValue(el);
        if (raw === null) {
          diagnostics.push({
            severity: 'error',
            where: where(el),
            message: `hostDirectives ${key} entry "${text(el)}" is not a string literal`,
          });
          continue;
        }
        const [internal, alias] = raw.split(':').map(s => s.trim());
        const map = io ? io[key] : null;
        let type = map?.get(internal);
        if (!type) {
          diagnostics.push({
            severity: 'info',
            where: where(el),
            message: `type of ${dirName}.${internal} could not be resolved; documented as unknown`,
          });
          type = 'unknown';
        }
        target.push({
          name: alias || internal,
          type,
          source: 'hostDirective',
          hostDirective: dirName,
          ...(alias ? { alias: internal } : {}),
        });
      }
    }
  }
  return { inputs, outputs };
}

function dedupeByName(entries) {
  const seen = new Map();
  for (const e of entries) if (!seen.has(e.name)) seen.set(e.name, e);
  return [...seen.values()];
}

/** I/O of a class: its own, its base class's (when in reach), and its host directives'. */
function classIO(cls, diagnostics, depth = 0) {
  const sf = cls.getSourceFile();
  const own = ownIO(cls, diagnostics);
  const inherited = { inputs: [], outputs: [] };
  const heritage = cls.heritageClauses?.find(h => h.token === ts.SyntaxKind.ExtendsKeyword);
  if (heritage && depth < 5) {
    const base = heritage.types[0].expression;
    const baseName = ts.isIdentifier(base) ? base.text : text(base);
    const found = ts.isIdentifier(base) ? findClass(sf.fileName, baseName) : null;
    if (found) {
      const io = classIO(found.node, diagnostics, depth + 1);
      inherited.inputs.push(...io.inputs);
      inherited.outputs.push(...io.outputs);
    } else {
      diagnostics.push({
        severity: 'error',
        where: where(cls),
        message: `${cls.name?.text} extends ${baseName}, which is outside the library source; its inherited inputs/outputs cannot be documented`,
      });
    }
  }
  const call = decoratorCall(cls, ['Component', 'Directive']);
  const host = call
    ? hostDirectiveIO(objectProps(call.arguments[0]), sf, diagnostics)
    : { inputs: [], outputs: [] };
  return {
    inputs: dedupeByName([...own.inputs, ...inherited.inputs, ...host.inputs]),
    outputs: dedupeByName([...own.outputs, ...inherited.outputs, ...host.outputs]),
  };
}

/** Top-level exported declarations of a file: name → kind (class, function, const, type). */
function declaredExports(sf) {
  const kinds = new Map();
  for (const stmt of sf.statements) {
    const exported =
      ts.canHaveModifiers(stmt) &&
      (ts.getModifiers(stmt) ?? []).some(m => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) continue;
    if (ts.isClassDeclaration(stmt) && stmt.name) kinds.set(stmt.name.text, 'class');
    else if (ts.isFunctionDeclaration(stmt) && stmt.name) kinds.set(stmt.name.text, 'function');
    else if (ts.isVariableStatement(stmt))
      stmt.declarationList.declarations.forEach(
        d => ts.isIdentifier(d.name) && kinds.set(d.name.text, 'const')
      );
    else if (
      ts.isInterfaceDeclaration(stmt) ||
      ts.isTypeAliasDeclaration(stmt) ||
      ts.isEnumDeclaration(stmt)
    )
      kinds.set(stmt.name.text, ts.isEnumDeclaration(stmt) ? 'const' : 'type');
  }
  return kinds;
}

/** Names a barrel (`index.ts`) exports with their kind, following re-exports into the files. */
function barrelExports(indexFile) {
  const names = new Map();
  if (!existsSync(indexFile)) return names;
  const visit = (file, only = null, seen = new Set()) => {
    if (!file || seen.has(file)) return;
    seen.add(file);
    const sf = loadSource(file);
    for (const [name, kind] of declaredExports(sf)) {
      if (!only || only.has(name)) names.set(only?.get(name) ?? name, kind);
    }
    for (const stmt of sf.statements) {
      if (!ts.isExportDeclaration(stmt) || !stmt.moduleSpecifier) continue;
      const target = resolveLocalModule(file, stmt.moduleSpecifier.text);
      if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
        const map = new Map(
          stmt.exportClause.elements.map(e => [(e.propertyName ?? e.name).text, e.name.text])
        );
        const typeOnly = stmt.isTypeOnly;
        if (!target) map.forEach(alias => names.set(alias, typeOnly ? 'type' : 'unknown'));
        else {
          visit(target, map, new Set(seen));
          for (const [, alias] of map)
            if (!names.has(alias)) names.set(alias, typeOnly ? 'type' : 'unknown');
        }
      } else visit(target, only, seen);
    }
  };
  visit(indexFile);
  return names;
}

function extractVariantSets(file) {
  if (!existsSync(file)) return [];
  const sf = loadSource(file);
  const sets = [];
  const visit = node => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'cva'
    ) {
      const config = objectProps(node.arguments[1]);
      const variantsNode = config.get('variants');
      const variants = {};
      for (const [group, body] of objectProps(variantsNode)) {
        variants[group] = [...objectProps(body).keys()];
      }
      const defaults = {};
      for (const [group, value] of objectProps(config.get('defaultVariants'))) {
        const v =
          stringValue(value) ?? (booleanValue(value) !== null ? String(booleanValue(value)) : null);
        if (v !== null) defaults[group] = v;
      }
      let decl = node.parent;
      while (decl && !ts.isVariableDeclaration(decl)) decl = decl.parent;
      sets.push({
        name: decl && ts.isIdentifier(decl.name) ? decl.name.text : null,
        variants,
        defaults,
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return sets;
}

/**
 * Extracts one component directory. Returns `directives` (decorated classes that declare inputs or
 * outputs, in file then source order), `variants` (the first `cva()` in variants.ts, as the docs
 * reference has always shown), every `variantSets` entry, the barrel's `exports` and the
 * `diagnostics` found on the way.
 */
export function extractComponentDir(dirPath) {
  const diagnostics = [];
  const directives = [];
  const declared = [];
  const exportKinds = barrelExports(join(dirPath, 'index.ts'));
  const exports = new Set(exportKinds.keys());
  for (const file of listSourceFiles(dirPath)) {
    const sf = loadSource(join(dirPath, file));
    for (const stmt of sf.statements) {
      if (!ts.isClassDeclaration(stmt) || !stmt.name) continue;
      const call = decoratorCall(stmt, ['Component', 'Directive']);
      if (!call) continue;
      const props = objectProps(call.arguments[0]);
      const selectorNode = props.get('selector');
      const selector = stringValue(selectorNode);
      if (selectorNode && selector === null) {
        diagnostics.push({
          severity: 'error',
          where: where(selectorNode),
          message: `${stmt.name.text}'s selector is not a string literal`,
        });
      }
      const io = classIO(stmt, diagnostics);
      const exportAs = stringValue(props.get('exportAs'));
      const entry = {
        className: stmt.name.text,
        selector,
        ...(exportAs ? { exportAs } : {}),
        exported: exports.has(stmt.name.text),
        inputs: io.inputs,
        outputs: io.outputs,
      };
      declared.push(entry);
      if (selector && !entry.exported && existsSync(join(dirPath, 'index.ts'))) {
        diagnostics.push({
          severity: 'warning',
          where: where(stmt),
          message: `${stmt.name.text} (${selector}) is not exported by ${dirPath.split('/').pop()}/index.ts`,
        });
      }
      if (io.inputs.length > 0 || io.outputs.length > 0) directives.push(entry);
    }
  }
  const variantSets = extractVariantSets(join(dirPath, 'variants.ts'));
  return {
    directives,
    declared,
    variants: variantSets[0]
      ? { variants: variantSets[0].variants, defaults: variantSets[0].defaults }
      : null,
    variantSets,
    exports: [...exports].sort(),
    exportKinds: Object.fromEntries([...exportKinds].sort(([a], [b]) => a.localeCompare(b))),
    diagnostics,
  };
}

/** Backwards-compatible shape used by the generators: `{ directives, variants }`. */
export function processComponentDir(dirPath) {
  return extractComponentDir(dirPath);
}

/** Throws one readable error listing every `error` diagnostic of the given extractions. */
export function assertNoErrors(results) {
  const errors = results.flatMap(r => r.diagnostics.filter(d => d.severity === 'error'));
  if (errors.length === 0) return;
  throw new Error(
    `API extraction cannot document the source faithfully:\n${errors.map(d => `  - ${d.where}: ${d.message}`).join('\n')}\n` +
      'Change the source to a supported form or extend scripts/lib/api-extract.mjs (with a fixture in scripts/lib/api-extract.spec.ts).'
  );
}

export function toUpperSnake(kebab) {
  return kebab.replace(/-/g, '_').toUpperCase();
}

/** For tests: forget parsed files (fixtures are rewritten between cases). */
export function clearCache() {
  sourceCache.clear();
  declarationCache.clear();
}
