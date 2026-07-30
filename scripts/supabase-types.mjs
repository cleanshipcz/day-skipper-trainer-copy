import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const TYPES_PATH = resolve("src/integrations/supabase/types.ts");
const cli = resolve("node_modules/.bin/supabase");
const check = process.argv.includes("--check");

const normalize = (value) => `${value.replace(/\r\n/g, "\n").trimEnd()}\n`;

try {
  execFileSync(cli, ["db", "reset", "--local"], { stdio: "inherit" });
  const generated = normalize(
    execFileSync(cli, ["gen", "types", "typescript", "--local"], {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
      stdio: ["ignore", "pipe", "inherit"],
    }),
  );

  if (check) {
    const checkedIn = normalize(readFileSync(TYPES_PATH, "utf8"));
    if (generated !== checkedIn) {
      console.error(
        "Supabase types are stale. Regenerate them with `npm run supabase:types`, then commit src/integrations/supabase/types.ts.",
      );
      process.exitCode = 1;
    } else {
      console.log("Checked-in Supabase types match the local migration schema.");
    }
  } else {
    writeFileSync(TYPES_PATH, generated);
    console.log("Regenerated src/integrations/supabase/types.ts from the local migration schema.");
  }
} catch (error) {
  const retryCommand = check ? "npm run guard:supabase-types" : "npm run supabase:types";
  console.error(
    `Supabase type generation failed. Review the CLI diagnostic above, ensure the local Docker-backed Supabase stack is available, then retry \`${retryCommand}\`.`,
  );
  process.exitCode = error.status || 1;
}
