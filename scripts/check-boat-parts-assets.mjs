import { existsSync, readdirSync } from "node:fs";
import { basename, resolve } from "node:path";

const retiredAssets = ["boatparts.gif", "sailboat-explained.png", "sailboat.png"];
const sourceDirectories = ["src", "public"];

const walk = (directory) => {
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
};

const checkedFiles = [...sourceDirectories, "dist"].flatMap((directory) => walk(resolve(directory)));
const isRetiredAsset = (file) => {
  const name = basename(file);
  return retiredAssets.some((retiredAsset) => {
    const extensionIndex = retiredAsset.lastIndexOf(".");
    const stem = retiredAsset.slice(0, extensionIndex);
    const extension = retiredAsset.slice(extensionIndex);
    return name === retiredAsset || (name.startsWith(`${stem}-`) && name.endsWith(extension));
  });
};

const violations = checkedFiles.filter(isRetiredAsset);

if (violations.length > 0) {
  console.error("Retired Boat Parts raster assets must not be restored or emitted:");
  for (const file of violations) console.error(`- ${file}`);
  process.exit(1);
}

console.log("Boat Parts asset lifecycle guard passed.");
