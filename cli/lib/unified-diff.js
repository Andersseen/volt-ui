// A small, deterministic line diff (Myers' O(ND) algorithm) that prints the unified format read by
// `git apply`, `patch` and code review tools. `volt diff` uses it so the CLI needs neither a runtime
// dependency nor Git. Inputs are compared after normalising CRLF to LF, like the rest of the CLI.

const NO_NEWLINE = '\\ No newline at end of file';
const MISSING_NEWLINE_MARK = '\u0000no-newline';

/** Splits text into lines; the last line carries a marker when the file has no final newline. */
function toLines(text) {
  if (text === null || text === undefined || text === '') return [];
  const normalized = text.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  else lines[lines.length - 1] += MISSING_NEWLINE_MARK;
  return lines;
}

/** Shortest edit script between `a` and `b` as a list of ['=', '-', '+', line] operations. */
function editScript(a, b) {
  const n = a.length;
  const m = b.length;
  const max = n + m;
  const offset = max + 1;
  const v = new Int32Array(2 * max + 3);
  const trace = [];
  let done = false;
  for (let d = 0; d <= max && !done; d++) {
    trace.push(v.slice());
    for (let k = -d; k <= d; k += 2) {
      let x;
      if (k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1])) x = v[offset + k + 1];
      else x = v[offset + k - 1] + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      v[offset + k] = x;
      if (x >= n && y >= m) {
        done = true;
        break;
      }
    }
  }

  const ops = [];
  let x = n;
  let y = m;
  for (let d = trace.length - 1; d >= 0; d--) {
    const vd = trace[d];
    const k = x - y;
    let prevK;
    if (k === -d || (k !== d && vd[offset + k - 1] < vd[offset + k + 1])) prevK = k + 1;
    else prevK = k - 1;
    const prevX = vd[offset + prevK];
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) {
      ops.push(['=', a[x - 1]]);
      x--;
      y--;
    }
    if (d > 0) {
      if (x === prevX) ops.push(['+', b[y - 1]]);
      else ops.push(['-', a[x - 1]]);
    }
    x = prevX;
    y = prevY;
  }
  return ops.reverse();
}

function renderLine(prefix, line) {
  if (line.endsWith(MISSING_NEWLINE_MARK)) {
    return `${prefix}${line.slice(0, -MISSING_NEWLINE_MARK.length)}\n${NO_NEWLINE}`;
  }
  return `${prefix}${line}`;
}

function range(start, count) {
  // Unified diff convention: an empty range starts one line before where it would be inserted.
  if (count === 0) return `${start - 1 < 0 ? 0 : start - 1},0`;
  return count === 1 ? `${start}` : `${start},${count}`;
}

/**
 * The unified diff turning `before` into `after`, or '' when they are equal.
 * `before`/`after` may be null for a missing file; labels go in the ---/+++ header lines.
 */
function unifiedDiff(before, after, { fromLabel, toLabel, context = 3 } = {}) {
  const a = toLines(before);
  const b = toLines(after);
  const ops = editScript(a, b);
  if (ops.every(op => op[0] === '=')) return '';

  // Positions (1-based) in each file for every operation.
  let ai = 1;
  let bi = 1;
  const positioned = ops.map(([kind, line]) => {
    const entry = { kind, line, a: ai, b: bi };
    if (kind !== '+') ai++;
    if (kind !== '-') bi++;
    return entry;
  });

  // Group changes that are within 2*context unchanged lines of each other into one hunk.
  const hunks = [];
  let current = null;
  positioned.forEach((entry, index) => {
    if (entry.kind === '=') return;
    const start = Math.max(0, index - context);
    if (current && start <= current.end + 1) {
      current.end = Math.min(positioned.length - 1, index + context);
    } else {
      if (current) hunks.push(current);
      current = { start, end: Math.min(positioned.length - 1, index + context) };
    }
  });
  if (current) hunks.push(current);

  const out = [`--- ${fromLabel || 'a'}`, `+++ ${toLabel || 'b'}`];
  for (const hunk of hunks) {
    const slice = positioned.slice(hunk.start, hunk.end + 1);
    const aCount = slice.filter(e => e.kind !== '+').length;
    const bCount = slice.filter(e => e.kind !== '-').length;
    const aStart = slice.find(e => e.kind !== '+')?.a ?? slice[0].a;
    const bStart = slice.find(e => e.kind !== '-')?.b ?? slice[0].b;
    out.push(`@@ -${range(aStart, aCount)} +${range(bStart, bCount)} @@`);
    for (const entry of slice) {
      const prefix = entry.kind === '=' ? ' ' : entry.kind;
      out.push(renderLine(prefix, entry.line));
    }
  }
  return `${out.join('\n')}\n`;
}

/** Added and removed line counts, for summaries. */
function diffStats(before, after) {
  const ops = editScript(toLines(before), toLines(after));
  return {
    added: ops.filter(op => op[0] === '+').length,
    removed: ops.filter(op => op[0] === '-').length,
  };
}

module.exports = { unifiedDiff, diffStats };
