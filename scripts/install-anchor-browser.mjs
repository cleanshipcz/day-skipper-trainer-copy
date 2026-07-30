import { spawn } from "node:child_process";
import { once } from "node:events";
import { appendFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const packageVersion = "2.10.10";
const chromeVersion = "127.0.6533.88";
const installRoot = join(process.env.RUNNER_TEMP || tmpdir(), "day-skipper-anchor-chrome");
const child = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  [
    "--yes",
    `@puppeteer/browsers@${packageVersion}`,
    "install",
    `chrome@${chromeVersion}`,
    "--path",
    installRoot,
  ],
  { stdio: ["ignore", "pipe", "inherit"] },
);

let output = "";
child.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  output += text;
  process.stdout.write(text);
});
const [code] = await once(child, "exit");
if (code !== 0) throw new Error(`Pinned Chromium install exited with code ${code}.`);

const executable = [...output.matchAll(/^chrome@\S+\s+(.+)$/gm)].at(-1)?.[1]?.trim();
if (!executable || !existsSync(executable)) {
  throw new Error(`Could not resolve the installed Chromium executable from: ${output.trim()}`);
}
if (!process.env.GITHUB_ENV) {
  console.log(`Set CHROMIUM_PATH=${executable} before running test:anchor-browser.`);
} else {
  appendFileSync(process.env.GITHUB_ENV, `CHROMIUM_PATH=${executable}\n`, "utf8");
}
