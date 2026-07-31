import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export function writeGeneratedTypeArtifact(path, generated) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, generated, { encoding: "utf8", mode: 0o600 });
}
