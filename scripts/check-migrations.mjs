import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const directory = resolve("supabase/migrations");
const files = (await readdir(directory)).filter((file) => file.endsWith(".sql")).sort();
const errors = [];
const timestamps = new Set();

for (const file of files) {
  const match = /^(\d{14})_[a-z0-9_-]+\.sql$/.exec(file);
  if (!match) {
    errors.push(`${file}: expected YYYYMMDDHHMMSS_description.sql`);
    continue;
  }
  if (timestamps.has(match[1])) errors.push(`${file}: duplicate migration timestamp ${match[1]}`);
  timestamps.add(match[1]);

  const sql = await readFile(resolve(directory, file), "utf8");
  if (!sql.trim()) errors.push(`${file}: migration is empty`);
}

if (errors.length > 0) {
  console.error(`Migration guard failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Migration guard passed (${files.length} migrations checked).`);
}
