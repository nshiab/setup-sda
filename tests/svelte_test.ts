import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDir, createTempDir, runCLI } from "./helpers.ts";

const runtimes = ["node", "deno", "bun"] as const;

for (const runtime of runtimes) {
  Deno.test(`Flag --svelte: ${runtime}`, async () => {
    const tmpDir = createTempDir(`svelte_${runtime}`);
    try {
      const result = runCLI(runtime, ["--test", "--svelte"], tmpDir);
      assertEquals(result.exitCode, 0);
      assertEquals(existsSync(join(tmpDir, "src", "routes", "+page.svelte")), true);
      assertEquals(existsSync(join(tmpDir, "vite.config.ts")), true);
      assertEquals(existsSync(join(tmpDir, "tsconfig.json")), true);
    } finally {
      cleanupTempDir(tmpDir);
    }
  });

  Deno.test(`Flag --svelte --example: ${runtime}`, async () => {
    const tmpDir = createTempDir(`svelte_example_${runtime}`);
    try {
      const result = runCLI(runtime, ["--test", "--svelte", "--example"], tmpDir);
      assertEquals(result.exitCode, 0);
      assertEquals(existsSync(join(tmpDir, "sda", "helpers", "crunchData.ts")), true);
      assertEquals(existsSync(join(tmpDir, "sda", "data", "temp.csv")), true);
    } finally {
      cleanupTempDir(tmpDir);
    }
  });

  Deno.test(`Flag --svelte --pages: ${runtime}`, async () => {
    const tmpDir = createTempDir(`svelte_pages_${runtime}`);
    try {
      const result = runCLI(runtime, ["--test", "--svelte", "--pages"], tmpDir);
      assertEquals(result.exitCode, 0);
      assertEquals(existsSync(join(tmpDir, "src", "routes", "+layout.ts")), true);
      const layoutTs = readFileSync(join(tmpDir, "src", "routes", "+layout.ts"), "utf8");
      assertStringIncludes(layoutTs, "export const prerender = true;");
    } finally {
      cleanupTempDir(tmpDir);
    }
  });
}
