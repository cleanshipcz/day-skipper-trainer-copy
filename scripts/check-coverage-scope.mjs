import scope from "./coverage-scope.json" with { type: "json" };
import { discoverProductionModules } from "./coverage-scope-core.mjs";

const discovered = [];
for (const directory of scope.directories) {
  discovered.push(...await discoverProductionModules(directory));
}

const included = new Set(scope.files);
const missing = discovered.filter((file) => !included.has(file));
const stale = scope.files.filter((file) =>
  file.startsWith("src/features/") && !discovered.includes(file));

if (missing.length || stale.length) {
  console.error([
    "Coverage scope guard failed.",
    ...missing.map((file) => `- uncovered architecture module: ${file}`),
    ...stale.map((file) => `- stale coverage entry: ${file}`),
  ].join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Coverage scope guard passed (${scope.files.length} modules enforced per-file).`);
}
