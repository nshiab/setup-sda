import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDir, createTempDir, runCLI } from "./helpers.ts";

const runtimes = ["node", "deno", "bun"] as const;

for (const runtime of runtimes) {
  Deno.test(`Kitchen Sink: ${runtime}`, async () => {
    const tmpDir = createTempDir(`kitchen_sink_${runtime}`);
    try {
      const result = runCLI(runtime, ["--test", "--scrape", "--svelte", "--example", "--pages", "--git", "--env", "--claude"], tmpDir);
      assertEquals(result.exitCode, 0);
      
      // Check various parts
      assertEquals(existsSync(join(tmpDir, "sda", "main.ts")), true);
      assertEquals(existsSync(join(tmpDir, "src", "routes", "+page.svelte")), true);
      assertEquals(existsSync(join(tmpDir, ".env")), true);
      assertEquals(existsSync(join(tmpDir, ".gitignore")), true);
      assertEquals(existsSync(join(tmpDir, "CLAUDE.md")), true);
      assertEquals(existsSync(join(tmpDir, "sda", "data", "temp.csv")), true);
      
      // Verify skip log for both svelte and scrape
      assertStringIncludes(result.stdout, "Skipping: ");
      if (runtime === "node") {
        assertStringIncludes(result.stdout, "@sveltejs/kit");
        assertStringIncludes(result.stdout, "cheerio");
      }
    } finally {
      cleanupTempDir(tmpDir);
    }
  });
}
