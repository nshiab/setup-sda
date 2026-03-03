import process from "node:process";
import { getRuntime, createExecSync } from "./lib/utils.ts";
import { setupAgents } from "./actions/agents.ts";
import { setupSvelte } from "./actions/svelte.ts";
import { setupBase } from "./actions/base.ts";

async function main() {
  const args = process.argv.slice(2);
  const isTest = args.includes("--test");
  const runtime = getRuntime();
  const execSync = createExecSync(isTest);

  console.log("\nStarting sda setup...");
  console.log("\n1 - Checking runtime and options...");
  
  console.log(`    => Your navigator userAgent is: ${navigator.userAgent}`);

  const flags = ["--test", "--git", "--scrape", "--pages", "--env", "--claude", "--gemini", "--copilot", "--agent", "--svelte", "--example"];
  flags.forEach(flag => {
    if (args.includes(flag)) {
      console.log(`    => You passed the option ${flag}`);
    }
  });

  if (args.includes("--pages") && !args.includes("--svelte")) {
    console.log(`    => You passed the option --pages, but it only works with --svelte`);
  }

  // Phase 1: Agents & Documentation
  await setupAgents(args);

  // Phase 2: Project structure & Libraries
  if (args.includes("--svelte")) {
    await setupSvelte(args, runtime, execSync);
  } else {
    await setupBase(args, runtime, execSync);
  }

  if (args.includes("--pages") && args.includes("--svelte")) {
    console.log("PS: Don't forget to enable GitHub Pages in your repository settings.\n");
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
