const leadingSpaces = (line) => line.match(/^ */)[0].length;

const findIndentedSection = (lines, key, parentIndent, start = 0) => {
  const marker = `${" ".repeat(parentIndent)}${key}:`;
  const index = lines.findIndex((line, candidate) => candidate >= start && line === marker);
  if (index === -1) throw new Error(`Missing YAML section: ${key}`);

  let end = lines.length;
  for (let candidate = index + 1; candidate < lines.length; candidate += 1) {
    const line = lines[candidate];
    if (line.trim() && leadingSpaces(line) <= parentIndent) {
      end = candidate;
      break;
    }
  }
  return { start: index + 1, end };
};

const joinContinuations = (lines) => {
  const commands = [];
  let pending = "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    pending = pending ? `${pending} ${trimmed}` : trimmed;
    if (pending.endsWith("\\")) {
      pending = pending.slice(0, -1).trimEnd();
      continue;
    }
    commands.push(pending);
    pending = "";
  }
  if (pending) throw new Error(`Unsupported unterminated shell continuation: ${pending}`);
  return commands;
};

const relevantNpmCommands = (commands) =>
  commands.flatMap((command) => {
    if (!command.includes("npm run")) return [];
    if (!command.startsWith("npm run ")) {
      throw new Error(`Unsupported npm run command form in CI quality job: ${command}`);
    }
    if (command.includes("${{")) {
      throw new Error(`Unsupported interpolated npm run command in CI quality job: ${command}`);
    }
    return [command];
  });

export const extractQualityNpmCommands = (workflow) => {
  const lines = workflow.replace(/\r\n/g, "\n").split("\n");
  const jobs = findIndentedSection(lines, "jobs", 0);
  const quality = findIndentedSection(lines, "quality", 2, jobs.start);
  quality.end = Math.min(quality.end, jobs.end);

  const commands = [];
  for (let index = quality.start; index < quality.end; index += 1) {
    const match = lines[index].match(/^(\s*)(?:-\s+)?run:\s*(.*?)\s*$/);
    if (!match) continue;

    const runIndent = match[1].length;
    const value = match[2];
    if (!value) {
      throw new Error("Unsupported empty run body in CI quality job");
    }
    if (!/^[|>][-+]?\d*$/.test(value)) {
      commands.push(...relevantNpmCommands([value]));
      continue;
    }

    const body = [];
    while (index + 1 < quality.end) {
      const next = lines[index + 1];
      if (next.trim() && leadingSpaces(next) <= runIndent) break;
      index += 1;
      body.push(next);
    }
    const normalized = body.map((line) => line.slice(Math.min(line.length, runIndent + 2)));
    const shellCommands = value.startsWith(">")
      ? [normalized.map((line) => line.trim()).filter(Boolean).join(" ")]
      : joinContinuations(normalized);
    commands.push(...relevantNpmCommands(shellCommands));
  }

  if (commands.length === 0) {
    throw new Error("CI quality job contains no supported npm run commands");
  }
  return commands;
};
