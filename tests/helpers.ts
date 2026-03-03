import { execSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export function runCLI(
  runtime: "node" | "deno" | "bun",
  args: string[],
  cwd: string,
): RunResult {
  const scriptPath = join(Deno.cwd(), "setup-sda.mjs");
  let command = "";

  if (runtime === "node") {
    command = `node ${scriptPath} ${args.join(" ")}`;
  } else if (runtime === "deno") {
    command = `deno run -A ${scriptPath} ${args.join(" ")}`;
  } else if (runtime === "bun") {
    command = `bun run ${scriptPath} ${args.join(" ")}`;
  }

  try {
    const stdout = execSync(command, { cwd, encoding: "utf8" });
    return { stdout, stderr: "", exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: error.stdout || "",
      stderr: error.stderr || "",
      exitCode: error.status || 1,
    };
  }
}

export function createTempDir(name: string): string {
  const tmpDir = join(Deno.cwd(), "tests", "tmp", name);
  rmSync(tmpDir, { recursive: true, force: true });
  mkdirSync(tmpDir, { recursive: true });
  return tmpDir;
}

export function cleanupTempDir(dir: string) {
  rmSync(dir, { recursive: true, force: true });
}
