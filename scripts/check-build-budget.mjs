import { readdirSync, statSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { evaluateBuildBudget } from "./build-budget-core.mjs";

const configPath = resolve(process.cwd(), "scripts", "performance-budget.json");
const { maxEntryChunkBytes, minHeadroomBytes = 0 } = JSON.parse(readFileSync(configPath, "utf8"));

const assetsDir = resolve(process.cwd(), "dist", "assets");
const entryChunks = readdirSync(assetsDir)
  .filter((file) => /^index-.*\.js$/.test(file))
  .map((file) => ({ file, size: statSync(resolve(assetsDir, file)).size }));

const evaluation = evaluateBuildBudget(entryChunks, { maxEntryChunkBytes, minHeadroomBytes });

if (!evaluation.ok) {
  if (evaluation.reason === "missing-entry-chunk") {
    console.error("No entry chunk found at dist/assets/index-*.js. Run npm run build first.");
    process.exit(1);
  }

  if (evaluation.reason === "over-max") {
    console.error(
      `Build budget failed: ${evaluation.entryChunk.file} is ${evaluation.entryChunk.size} bytes (max ${maxEntryChunkBytes} bytes).`
    );
    process.exit(1);
  }

  console.error(
    `Build budget failed: ${evaluation.entryChunk.file} is ${evaluation.entryChunk.size} bytes with headroom ${maxEntryChunkBytes - evaluation.entryChunk.size} bytes (min ${minHeadroomBytes} bytes).`
  );
  process.exit(1);
}

console.log(
  `Build budget OK: ${evaluation.entryChunk.file} is ${evaluation.entryChunk.size} bytes (max ${maxEntryChunkBytes} bytes, headroom ${maxEntryChunkBytes - evaluation.entryChunk.size} bytes >= min ${minHeadroomBytes} bytes).`
);
