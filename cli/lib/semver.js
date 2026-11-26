// The subset of node-semver range matching the CLI needs to compare an installed version with the
// ranges packages/volt/package.json declares (`^0.131.4`, `^21.2.0 || ^22.0.0`, `~22.1.0`, exact
// versions, `>=`/`<` comparators, `x` wildcards). The CLI ships with no dependencies, so this is a
// small local implementation instead of the `semver` package. Prerelease versions only satisfy a
// range that names a prerelease of the same major.minor.patch, as in node-semver.

function parse(version) {
  const m = String(version)
    .trim()
    .replace(/^v/, '')
    .match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/);
  if (!m) return null;
  return { major: +m[1], minor: +m[2], patch: +m[3], pre: m[4] ? m[4].split('.') : [] };
}

function comparePre(a, b) {
  if (!a.length && !b.length) return 0;
  if (!a.length) return 1;
  if (!b.length) return -1;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] === undefined) return -1;
    if (b[i] === undefined) return 1;
    const na = /^\d+$/.test(a[i]);
    const nb = /^\d+$/.test(b[i]);
    if (na && nb && +a[i] !== +b[i]) return +a[i] < +b[i] ? -1 : 1;
    if (na !== nb) return na ? -1 : 1;
    if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  }
  return 0;
}

function compare(a, b) {
  for (const key of ['major', 'minor', 'patch']) {
    if (a[key] !== b[key]) return a[key] < b[key] ? -1 : 1;
  }
  return comparePre(a.pre, b.pre);
}

/** `1`, `1.2`, `1.x`, `1.2.*` → a partial with null for the wildcard parts. */
function partial(text) {
  const m = text
    .trim()
    .replace(/^v/, '')
    .match(/^(\d+|[xX*])(?:\.(\d+|[xX*]))?(?:\.(\d+|[xX*]))?(?:-([0-9A-Za-z.-]+))?$/);
  if (!m) return null;
  const num = v => (v === undefined || /^[xX*]$/.test(v) ? null : +v);
  return { major: num(m[1]), minor: num(m[2]), patch: num(m[3]), pre: m[4] ? m[4].split('.') : [] };
}

const v = (major, minor, patch, pre = []) => ({ major, minor, patch, pre });

/** One space-separated comparator set → [[op, version], ...]. */
function comparators(set) {
  const out = [];
  const tokens = set
    .trim()
    .replace(/(>=|<=|>|<|=|\^|~)\s+/g, '$1')
    .split(/\s+/)
    .filter(Boolean);
  for (let i = 0; i < tokens.length; i++) {
    // Hyphen range: `1.2.3 - 2.3.4`
    if (tokens[i + 1] === '-' && tokens[i + 2]) {
      const lo = partial(tokens[i]);
      const hi = partial(tokens[i + 2]);
      if (!lo || !hi) return null;
      out.push(['>=', v(lo.major ?? 0, lo.minor ?? 0, lo.patch ?? 0, lo.pre)]);
      if (hi.minor === null) out.push(['<', v(hi.major + 1, 0, 0)]);
      else if (hi.patch === null) out.push(['<', v(hi.major, hi.minor + 1, 0)]);
      else out.push(['<=', v(hi.major, hi.minor, hi.patch, hi.pre)]);
      i += 2;
      continue;
    }
    const m = tokens[i].match(/^(>=|<=|>|<|=|\^|~)?(.*)$/);
    const op = m[1] || '';
    const p = partial(m[2]);
    if (!p) return null;
    if (p.major === null) continue; // `*` / `x`: anything
    if (op === '^') {
      const lo = v(p.major, p.minor ?? 0, p.patch ?? 0, p.pre);
      let hi;
      if (p.major > 0 || p.minor === null) hi = v(p.major + 1, 0, 0);
      else if (p.minor > 0 || p.patch === null) hi = v(0, p.minor + 1, 0);
      else hi = v(0, 0, p.patch + 1);
      out.push(['>=', lo], ['<', hi]);
    } else if (op === '~') {
      const lo = v(p.major, p.minor ?? 0, p.patch ?? 0, p.pre);
      const hi = p.minor === null ? v(p.major + 1, 0, 0) : v(p.major, p.minor + 1, 0);
      out.push(['>=', lo], ['<', hi]);
    } else if (op === '' || op === '=') {
      if (p.minor === null) out.push(['>=', v(p.major, 0, 0)], ['<', v(p.major + 1, 0, 0)]);
      else if (p.patch === null)
        out.push(['>=', v(p.major, p.minor, 0)], ['<', v(p.major, p.minor + 1, 0)]);
      else out.push(['=', v(p.major, p.minor, p.patch, p.pre)]);
    } else {
      out.push([op, v(p.major, p.minor ?? 0, p.patch ?? 0, p.pre)]);
    }
  }
  return out;
}

function test(op, version, bound) {
  const c = compare(version, bound);
  switch (op) {
    case '>=':
      return c >= 0;
    case '<=':
      return c <= 0;
    case '>':
      return c > 0;
    case '<':
      return c < 0;
    default:
      return c === 0;
  }
}

/** Whether `version` (an exact version) satisfies `range`. Unparseable input → false. */
function satisfies(version, range) {
  const ver = parse(version);
  if (!ver || typeof range !== 'string') return false;
  return range.split('||').some(set => {
    const list = comparators(set);
    if (!list) return false;
    if (!list.every(([op, bound]) => test(op, ver, bound))) return false;
    if (ver.pre.length === 0) return true;
    // A prerelease only matches a comparator that names a prerelease of the same version tuple.
    return list.some(
      ([, bound]) =>
        bound.pre.length > 0 &&
        bound.major === ver.major &&
        bound.minor === ver.minor &&
        bound.patch === ver.patch
    );
  });
}

/** Whether a string is a range this module can evaluate (dist-tags, URLs and `workspace:` are not). */
function validRange(range) {
  if (typeof range !== 'string' || !range.trim()) return false;
  return range.split('||').every(set => comparators(set) !== null);
}

module.exports = { parse, compare, satisfies, validRange };
