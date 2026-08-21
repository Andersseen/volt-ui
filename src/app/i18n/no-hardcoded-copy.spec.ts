import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The site has exactly one place to put a sentence, and this is what keeps it that way.
 *
 * Every string a visitor reads lives in `en.json` and is reached through `t()`. Without a
 * check, that decays one template at a time: someone adds a heading inline because it is
 * faster, nobody notices until a Spanish reader hits an English word, and the project is
 * back to two conventions — which is the state this replaced.
 *
 * Two kinds of text are deliberately NOT translated, and the rule for telling them apart
 * is structural rather than a judgement call:
 *
 *  - **Product source** — `src/app/blocks/` and `src/app/layouts/` are read with Vite's
 *    `?raw` and shown as code to copy. A `t()` call in there would break the moment it
 *    landed in a consumer's project, which has no `Translations`.
 *  - **Specimens** — the live demo projected into `<app-code-panel>`, and the miniatures
 *    in `component-preview` / `block-thumbnail`. That content is an exhibit of the code
 *    shown beside it; translating "Apple" while the snippet under it still says `Apple`
 *    reads as a bug rather than as a translation.
 *
 * Everything else is the site talking, and the site talks in three languages.
 */

const ROOT = join(process.cwd(), 'src/app');

/**
 * Files whose templates are a specimen from top to bottom.
 *
 * Everywhere else a specimen is recognised structurally — it sits inside the
 * `<app-code-panel>` that shows the code beside it — and needs no entry here. These four
 * render an exhibit with no panel around it, so the structure cannot say so.
 */
const EXEMPT = [
  // Copied wholesale into a consumer's project by the CLI; a `t()` here would break there.
  'blocks/',
  'layouts/',
  // Miniature live renders of every component and block, for the catalog and gallery cards.
  'components/component-preview.ts',
  'components/block-thumbnail.ts',
  // The theme studio's preview canvas: a sample dashboard drawn in the theme being edited.
  'components/theme-studio/theme-studio-preview.ts',
  // Carries `SidebarDemo`, a full sample application shell, alongside its own docs.
  'pages/(gallery)/docs/layouts/sidebar.page.ts',
  // Its demo is a bare bordered box rather than a code panel, so nothing marks it as one.
  'pages/(components-docs)/docs/components/popover.component.html',
];

/**
 * Names that are the same word in every language.
 *
 * A translator handed "Volt UI" has nothing to do with it, and a dictionary entry whose
 * three values are identical is a key nobody can ever act on.
 */
const PROPER_NOUNS = new Set([
  'Volt UI',
  'Volt Inc.',
  'TypeScript',
  'Volt',
  'Ember',
  'Sage',
  'Dusk',
  'Glacier',
]);

function templateSources(): { file: string; markup: string }[] {
  const out: { file: string; markup: string }[] = [];

  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);

      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }

      const file = relative(ROOT, full);
      if (file.includes('.spec.') || EXEMPT.some(prefix => file.startsWith(prefix))) {
        continue;
      }

      const source = readFileSync(full, 'utf8');

      if (entry.endsWith('.html')) {
        out.push({ file, markup: source });
      } else if (entry.endsWith('.ts')) {
        for (const markup of inlineTemplates(source)) {
          out.push({ file, markup });
        }
      }
    }
  };

  walk(ROOT);

  return out;
}

/** The backtick body of every `template:` in a file, escapes and all. */
function inlineTemplates(source: string): string[] {
  const templates: string[] = [];

  for (const match of source.matchAll(/template:\s*`/g)) {
    let index = match.index + match[0].length;
    const body: string[] = [];

    while (index < source.length) {
      const char = source[index];

      if (char === '\\') {
        body.push(source.slice(index, index + 2));
        index += 2;
        continue;
      }

      if (char === '`') {
        break;
      }

      body.push(char);
      index += 1;
    }

    templates.push(body.join(''));
  }

  return templates;
}

/** The span of `<tag …>` … `</tag>` starting at `from`, self-closing tags included. */
function elementRegion(markup: string, from: number, tag: string): [number, number] {
  const openTagEnd = markup.indexOf('>', from);
  if (openTagEnd === -1) {
    return [from, markup.length];
  }

  if (markup[openTagEnd - 1] === '/') {
    return [from, openTagEnd + 1];
  }

  // Only this tag's own edges move the depth. Counting every `/>` would end the region at
  // the first self-closing icon inside it, which is how a whole demo leaks back into scope.
  const edges = new RegExp(`<${tag}(?=[\\s>])|</${tag}\\s*>`, 'g');
  edges.lastIndex = from;
  let depth = 0;

  for (let edge = edges.exec(markup); edge; edge = edges.exec(markup)) {
    depth += edge[0].startsWith('</') ? -1 : 1;

    if (depth === 0) {
      return [from, edge.index + edge[0].length];
    }
  }

  return [from, markup.length];
}

/** Blanks every region whose text is not the site talking, so what is left is prose. */
function withoutExemptRegions(markup: string): string {
  // A `<code>` or `<pre>` body is an identifier or a sample, never a sentence.
  let out = markup
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<pre\b[\s\S]*?<\/pre\s*>/g, ' ')
    .replace(/<code\b[\s\S]*?<\/code\s*>/g, ' ');

  for (const [pattern, tag] of [
    [/<app-code-panel(?=[\s>])/, 'app-code-panel'],
    [/<(\w[\w-]*)\b[^>]*\bfont-mono\b[^>]*>/, null],
  ] as const) {
    for (;;) {
      const found = out.match(pattern);
      if (found?.index === undefined) {
        break;
      }

      const [start, end] = elementRegion(out, found.index, tag ?? found[1]);
      out = `${out.slice(0, start)} ${out.slice(end)}`;
    }
  }

  return out;
}

/** Words a reader would see: element text and the attributes that carry copy. */
function literalCopy(markup: string): string[] {
  const scope = withoutExemptRegions(markup);
  const found: string[] = [];

  for (const match of scope.matchAll(/>([^<>]*)</g)) {
    const text = match[1].replace(/\s+/g, ' ').trim();

    if (text && !text.includes('{{') && !text.startsWith('@') && !text.startsWith('}')) {
      // Two letters in a row is a word; `1.0.0`, `—` and `$48k` are not.
      if (/[A-Za-z]{2}/.test(text) && !PROPER_NOUNS.has(text)) {
        found.push(text);
      }
    }
  }

  for (const match of scope.matchAll(
    /(?<![[\w])(title|description|placeholder|aria-label|alt|label)="([^"]*)"/g
  )) {
    // A static attribute holding an interpolation is already translated.
    if (/[A-Za-z]{2}/.test(match[2]) && !match[2].includes('{{')) {
      found.push(`${match[1]}="${match[2]}"`);
    }
  }

  return found;
}

describe('site copy', () => {
  it('lives in the dictionaries, never inline in a template', () => {
    const offenders = templateSources()
      .map(({ file, markup }) => ({ file, copy: literalCopy(markup) }))
      .filter(entry => entry.copy.length > 0);

    // Named rather than counted: the failure has to say which sentence to move.
    expect(offenders).toEqual([]);
  });
});
