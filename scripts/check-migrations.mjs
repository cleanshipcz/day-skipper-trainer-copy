import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const directory = resolve("supabase/migrations");
const files = (await readdir(directory)).filter((file) => file.endsWith(".sql")).sort();
const manifest = JSON.parse(await readFile(resolve(directory, "manifest.json"), "utf8"));
const errors = [];
const timestamps = new Set();

if (files.length === 0) errors.push("migration directory contains no SQL migrations");

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
  const [, year, month, day, hour, minute, second] =
    /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(match[1]) ?? [];
  const instant = new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute, +second));
  const roundTrip = [
    instant.getUTCFullYear(),
    String(instant.getUTCMonth() + 1).padStart(2, "0"),
    String(instant.getUTCDate()).padStart(2, "0"),
    String(instant.getUTCHours()).padStart(2, "0"),
    String(instant.getUTCMinutes()).padStart(2, "0"),
    String(instant.getUTCSeconds()).padStart(2, "0"),
  ].join("");
  if (roundTrip !== match[1]) errors.push(`${file}: timestamp is not a valid UTC date/time`);

  const digest = createHash("sha256").update(sql).digest("hex");
  if (!(file in manifest)) errors.push(`${file}: missing immutable manifest baseline`);
  else if (manifest[file] !== digest) errors.push(`${file}: differs from immutable manifest baseline`);
}

for (const file of Object.keys(manifest)) {
  if (!files.includes(file)) errors.push(`${file}: applied migration from manifest was deleted`);
}

if (errors.length > 0) {
  console.error(`Migration guard failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Migration guard passed (${files.length} migrations checked).`);
}
