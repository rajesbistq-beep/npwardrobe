import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const result = spawnSync(
  process.execPath,
  [
    resolve(root, "node_modules/supabase/dist/supabase.js"),
    "gen",
    "types",
    "typescript",
    "--local",
    "--schema",
    "public",
  ],
  { cwd: root, encoding: "utf8" },
);

if (result.stderr) process.stderr.write(result.stderr);
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
if (!result.stdout.trimStart().startsWith("export type Json")) {
  throw new Error("Supabase type generation returned no TypeScript schema output.");
}

const output = resolve(root, "types/database.types.ts");
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, result.stdout, "utf8");
process.stdout.write(`Generated ${output}\n`);
