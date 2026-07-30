const MAX_LINE_LENGTH = 240;
const CONTEXT_LINES = 4;
const MAX_CHANGED_LINES = 24;
const MAX_COMPLETE_BYTES = 64 * 1024;

const redact = (line) =>
  line
    .replace(/(postgres(?:ql)?:\/\/)[^\s"']+/gi, "$1[REDACTED]")
    .replace(/\b(?:eyJ[a-zA-Z0-9_-]{20,}|sb_[a-zA-Z0-9_-]{20,})\b/g, "[REDACTED]")
    .slice(0, MAX_LINE_LENGTH);

const numbered = (prefix, lines, start) =>
  lines.map((line, index) => `${prefix} ${String(start + index + 1).padStart(4)} | ${redact(line)}`);

export function formatTypeMismatch(generated, checkedIn) {
  const expected = generated.split("\n");
  const actual = checkedIn.split("\n");
  let first = 0;
  while (first < expected.length && first < actual.length && expected[first] === actual[first]) first += 1;

  let expectedEnd = expected.length - 1;
  let actualEnd = actual.length - 1;
  while (
    expectedEnd >= first &&
    actualEnd >= first &&
    expected[expectedEnd] === actual[actualEnd]
  ) {
    expectedEnd -= 1;
    actualEnd -= 1;
  }

  const start = Math.max(0, first - CONTEXT_LINES);
  const expectedStop = Math.min(expected.length, expectedEnd + CONTEXT_LINES + 2, start + MAX_CHANGED_LINES);
  const actualStop = Math.min(actual.length, actualEnd + CONTEXT_LINES + 2, start + MAX_CHANGED_LINES);
  const complete = [
    "Complete generated types (expected):",
    ...numbered("+", expected, 0),
    "Checked-in types (actual):",
    ...numbered("-", actual.slice(start, actualStop), start),
  ].join("\n");
  if (Buffer.byteLength(complete, "utf8") <= MAX_COMPLETE_BYTES) return complete;

  const bounded = [
    "Generated types (expected, first mismatch window):",
    ...numbered("+", expected.slice(start, expectedStop), start),
    "Checked-in types (actual):",
    ...numbered("-", actual.slice(start, actualStop), start),
    "... complete diagnostic exceeded 64 KiB; output limited to the first mismatch window.",
  ].join("\n");

  // Each side is limited to 24 redacted lines of at most 240 characters, so
  // this fallback remains below the same byte ceiling even for multibyte text.
  return bounded;
}
