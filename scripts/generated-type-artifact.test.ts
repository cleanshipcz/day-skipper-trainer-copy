import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { writeGeneratedTypeArtifact } from "./generated-type-artifact.mjs";

const directories: string[] = [];

afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe("generated Supabase type artifact", () => {
  it("creates its private parent directory and preserves generated text exactly", () => {
    const directory = mkdtempSync(join(tmpdir(), "supabase-types-artifact-"));
    directories.push(directory);
    const path = join(directory, "nested", "types.ts");
    const generated = "export type Generated = { value: string }\\n";

    writeGeneratedTypeArtifact(path, generated);

    expect(readFileSync(path, "utf8")).toBe(generated);
    expect(statSync(path).mode & 0o777).toBe(0o600);
  });
});
