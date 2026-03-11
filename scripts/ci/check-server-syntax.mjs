import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const serverRoot = join(repoRoot, "server");

function walkJsFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const abs = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) {
        continue;
      }
      files.push(...walkJsFiles(abs));
      continue;
    }

    if (entry.isFile() && abs.endsWith(".js")) {
      files.push(abs);
    }
  }

  return files;
}

function main() {
  let files;
  try {
    const stats = statSync(serverRoot);
    if (!stats.isDirectory()) {
      throw new Error("server directory is not a directory");
    }
    files = walkJsFiles(serverRoot);
  } catch (error) {
    console.error(`[ci:server:check] Unable to inspect server sources: ${error.message}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error("[ci:server:check] No server .js files found.");
    process.exit(1);
  }

  let failed = false;
  for (const file of files.sort()) {
    const rel = relative(repoRoot, file).replaceAll("\\", "/");
    const check = spawnSync(process.execPath, ["--check", file], {
      stdio: "inherit",
    });

    if (check.status !== 0) {
      console.error(`[ci:server:check] Syntax check failed: ${rel}`);
      failed = true;
    } else {
      console.log(`[ci:server:check] OK: ${rel}`);
    }
  }

  if (failed) {
    process.exit(1);
  }

  console.log(`[ci:server:check] Completed ${files.length} file checks successfully.`);
}

main();
