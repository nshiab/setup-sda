import { execSync as nodeExecSync } from "node:child_process";
import process from "node:process";

export type Runtime = "bun" | "deno" | "nodejs";

export function getRuntime(): Runtime {
  const userAgent = (globalThis.navigator?.userAgent || "node").toLocaleLowerCase();
  if (userAgent.includes("bun")) return "bun";
  if (userAgent.includes("deno")) return "deno";
  return "nodejs";
}

export function createExecSync(isTest: boolean) {
  return (command: string, options: any = { stdio: "ignore" }) => {
    if (isTest && (
      command.includes("npm ") || 
      command.includes("npx ") || 
      command.includes("bun ") || 
      command.includes("bunx ") || 
      command.includes("deno install")
    )) {
      console.log(`      => Skipping: ${command}`);
    } else {
      nodeExecSync(command, options);
    }
  };
}
