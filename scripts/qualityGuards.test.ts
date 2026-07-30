import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { extractQualityNpmCommands } from "./ci-quality-commands-core.mjs";
import { discoverProductionModules } from "./coverage-scope-core.mjs";

const migrationGuard = resolve(process.cwd(), "scripts/check-migrations.mjs");
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

describe("quality guard regressions", () => {
  it("keeps the README quality command list aligned with CI", () => {
    const workflow = readFileSync(resolve(process.cwd(), ".github/workflows/ci.yml"), "utf8");
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8");
    const documentedBlock = readme.match(
      /<!-- ci-quality-commands:start -->\s*```sh\n([\s\S]*?)\n```\s*<!-- ci-quality-commands:end -->/,
    );

    expect(documentedBlock, "README quality command markers are missing").not.toBeNull();

    const ciCommands = extractQualityNpmCommands(workflow);
    const documentedCommands = documentedBlock![1]
      .split("\n")
      .map((command) => command.trim())
      .filter(Boolean);

    expect(documentedCommands).toEqual(ciCommands);
  });

  it("extracts multiline npm commands only from the quality job", () => {
    const workflow = `jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - run: |
          npm run lint
          npm run guard:coverage-scope && \\
            npm run test:coverage -- --maxWorkers=1
      - run: >
          npm run test --
          --run --maxWorkers=1
  unrelated:
    steps:
      - run: npm run should-not-be-documented
`;

    expect(extractQualityNpmCommands(workflow)).toEqual([
      "npm run lint",
      "npm run guard:coverage-scope && npm run test:coverage -- --maxWorkers=1",
      "npm run test -- --run --maxWorkers=1",
    ]);
  });

  it("rejects unsupported relevant npm command forms instead of ignoring them", () => {
    const workflow = `jobs:
  quality:
    steps:
      - run: NODE_ENV=test npm run test -- --run
`;

    expect(() => extractQualityNpmCommands(workflow)).toThrow(
      "Unsupported executable command in CI quality job",
    );
  });

  it("allows the known install step but rejects undocumented executable gates", () => {
    const supported = `jobs:
  quality:
    steps:
      - run: npm ci
      - run: npm run lint
`;
    const unsupported = `jobs:
  quality:
    steps:
      - run: npm ci
      - run: npx eslint .
`;

    expect(extractQualityNpmCommands(supported)).toEqual(["npm run lint"]);
    expect(() => extractQualityNpmCommands(unsupported)).toThrow(
      "Unsupported executable command in CI quality job: npx eslint .",
    );
  });

  it("discovers nested production modules while excluding nested tests", async () => {
    const root = mkdtempSync(resolve(tmpdir(), "coverage-scope-"));
    mkdirSync(resolve(root, "protected/nested"), { recursive: true });
    writeFileSync(resolve(root, "protected/root.ts"), "");
    writeFileSync(resolve(root, "protected/nested/feature.tsx"), "");
    writeFileSync(resolve(root, "protected/nested/feature.test.ts"), "");

    expect((await discoverProductionModules("protected", root)).sort()).toEqual([
      "protected/nested/feature.tsx",
      "protected/root.ts",
    ]);
  });

  it("rejects edits to base migrations even when the working manifest is updated", () => {
    const root = mkdtempSync(resolve(tmpdir(), "migration-guard-"));
    const directory = resolve(root, "supabase/migrations");
    mkdirSync(directory, { recursive: true });
    const file = "20260102030405_initial.sql";
    const original = "select 1;\n";
    writeFileSync(resolve(directory, file), original);
    writeFileSync(resolve(directory, "manifest.json"), JSON.stringify({ [file]: hash(original) }));
    execFileSync("git", ["init", "-q"], { cwd: root });
    execFileSync("git", ["config", "user.email", "test@example.invalid"], { cwd: root });
    execFileSync("git", ["config", "user.name", "Test"], { cwd: root });
    execFileSync("git", ["add", "."], { cwd: root });
    execFileSync("git", ["commit", "-qm", "baseline"], { cwd: root });
    const base = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();

    const edited = "select 2;\n";
    writeFileSync(resolve(directory, file), edited);
    writeFileSync(resolve(directory, "manifest.json"), JSON.stringify({ [file]: hash(edited) }));
    const result = spawnSync(process.execPath, [migrationGuard], {
      cwd: root,
      env: { ...process.env, MIGRATION_BASE_SHA: base },
      encoding: "utf8",
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("was edited");
  });
});
