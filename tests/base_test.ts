import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDir, createTempDir, runCLI } from "./helpers.ts";

const runtimes = ["node", "deno", "bun"] as const;

for (const runtime of runtimes) {
  Deno.test(`Base setup: ${runtime}`, () => {
    const tmpDir = createTempDir(`base_${runtime}`);
    try {
      const result = runCLI(runtime, ["--test"], tmpDir);
      assertEquals(result.exitCode, 0);

      // Verify basic files are created
      assertEquals(existsSync(join(tmpDir, "sda")), true);
      assertEquals(existsSync(join(tmpDir, "sda", "main.ts")), true);
      assertEquals(existsSync(join(tmpDir, "sda", "data")), true);
      assertEquals(existsSync(join(tmpDir, "sda", "output")), true);
      assertEquals(existsSync(join(tmpDir, "sda", "helpers")), true);
      assertEquals(existsSync(join(tmpDir, "README.md")), true);

      const readme = readFileSync(join(tmpDir, "README.md"), "utf8");
      assertStringIncludes(readme, "setup-sda");

      if (runtime === "deno") {
        assertEquals(existsSync(join(tmpDir, "deno.json")), true);
      } else {
        assertEquals(existsSync(join(tmpDir, "package.json")), true);
      }
    } finally {
      cleanupTempDir(tmpDir);
    }
  });

  Deno.test(`Flag --git: ${runtime}`, () => {
    const tmpDir = createTempDir(`git_${runtime}`);
    try {
      const result = runCLI(runtime, ["--test", "--git"], tmpDir);
      assertEquals(result.exitCode, 0);
      assertEquals(existsSync(join(tmpDir, ".gitignore")), true);
      const gitignore = readFileSync(join(tmpDir, ".gitignore"), "utf8");
      assertStringIncludes(gitignore, "sda/data");
    } finally {
      cleanupTempDir(tmpDir);
    }
  });

  Deno.test(`Flag --env: ${runtime}`, () => {
    const tmpDir = createTempDir(`env_${runtime}`);
    try {
      const result = runCLI(runtime, ["--test", "--env"], tmpDir);
      assertEquals(result.exitCode, 0);
      assertEquals(existsSync(join(tmpDir, ".env")), true);
    } finally {
      cleanupTempDir(tmpDir);
    }
  });

  Deno.test(`Flag --scrape: ${runtime}`, () => {
    const tmpDir = createTempDir(`scrape_${runtime}`);
    try {
      const result = runCLI(runtime, ["--test", "--scrape"], tmpDir);
      assertEquals(result.exitCode, 0);
      // Verify skip log for scraping libraries
      assertStringIncludes(result.stdout, "Skipping: ");
      assertStringIncludes(result.stdout, "cheerio");
    } finally {
      cleanupTempDir(tmpDir);
    }
  });
}
