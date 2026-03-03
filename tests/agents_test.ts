import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDir, createTempDir, runCLI } from "./helpers.ts";

const runtimes = ["node", "deno", "bun"] as const;

for (const runtime of runtimes) {
  Deno.test(`Flag --claude: ${runtime}`, async () => {
    const tmpDir = createTempDir(`claude_${runtime}`);
    try {
      const result = runCLI(runtime, ["--test", "--claude"], tmpDir);
      assertEquals(result.exitCode, 0);
      assertEquals(existsSync(join(tmpDir, "CLAUDE.md")), true);
      assertEquals(existsSync(join(tmpDir, "docs", "journalism.md")), true);
      assertEquals(existsSync(join(tmpDir, "docs", "simple-data-analysis.md")), true);
    } finally {
      cleanupTempDir(tmpDir);
    }
  });

  Deno.test(`Flag --gemini: ${runtime}`, async () => {
    const tmpDir = createTempDir(`gemini_${runtime}`);
    try {
      const result = runCLI(runtime, ["--test", "--gemini"], tmpDir);
      assertEquals(result.exitCode, 0);
      assertEquals(existsSync(join(tmpDir, "GEMINI.md")), true);
    } finally {
      cleanupTempDir(tmpDir);
    }
  });

  Deno.test(`Flag --copilot: ${runtime}`, async () => {
    const tmpDir = createTempDir(`copilot_${runtime}`);
    try {
      const result = runCLI(runtime, ["--test", "--copilot"], tmpDir);
      assertEquals(result.exitCode, 0);
      assertEquals(existsSync(join(tmpDir, ".github", "copilot-instructions.md")), true);
    } finally {
      cleanupTempDir(tmpDir);
    }
  });

  Deno.test(`Flag --agent: ${runtime}`, async () => {
    const tmpDir = createTempDir(`agent_${runtime}`);
    try {
      const result = runCLI(runtime, ["--test", "--agent"], tmpDir);
      assertEquals(result.exitCode, 0);
      assertEquals(existsSync(join(tmpDir, "AGENTS.md")), true);
    } finally {
      cleanupTempDir(tmpDir);
    }
  });

  Deno.test(`Combined agents: ${runtime}`, async () => {
    const tmpDir = createTempDir(`combined_agents_${runtime}`);
    try {
      const result = runCLI(runtime, ["--test", "--claude", "--gemini", "--copilot"], tmpDir);
      assertEquals(result.exitCode, 0);
      assertEquals(existsSync(join(tmpDir, "CLAUDE.md")), true);
      assertEquals(existsSync(join(tmpDir, "GEMINI.md")), true);
      assertEquals(existsSync(join(tmpDir, ".github", "copilot-instructions.md")), true);
    } finally {
      cleanupTempDir(tmpDir);
    }
  });
}
