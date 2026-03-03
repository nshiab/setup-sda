import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Runtime } from "../lib/utils.ts";
import { baseGitignore, baseTsconfigJson, getMainTs, getCrunchDataTs } from "../templates/configs.ts";

export async function setupBase(args: string[], runtime: Runtime, execSync: any) {
  if (args.includes("--svelte")) return;

  const example = args.includes("--example");
  
  const readme = "This repository has been created with [setup-sda](https://github.com/nshiab/setup-sda/).\n\nIt's using [simple-data-analysis](https://github.com/nshiab/simple-data-analysis) and [journalism](https://github.com/nshiab/journalism).\n\nHere's the recommended workflow:\n\n- Put your raw data in the `sda/data` folder. Note that this folder is gitignored.\n- Use the `sda/main.ts` file to clean and process your raw data. Write the results to the `sda/output` folder.\n\nWhen working on your project, use the following command:\n\n- `" + (runtime === "deno" ? "deno task" : "npm run") + " sda` will watch your `sda/main.ts` and its dependencies. Everytime you'll save some changes, the data will be reprocessed.\n";

  console.log("\n2 - Creating relevant files...");

  if (runtime === "nodejs" || runtime === "bun") {
    const pkg = { type: "module", scripts: { 
      sda: "node " + (args.includes("--env") ? "--env-file=.env " : "") + "--experimental-strip-types --no-warnings --watch sda/main.ts",
      clean: "rm -rf .sda-cache && rm -rf .journalism-cache && rm -rf .tmp"
    }};
    if (runtime === "bun") pkg.scripts.sda = "bun --watch sda/main.ts";
    writeFileSync("package.json", JSON.stringify(pkg, null, 2));
    writeFileSync("tsconfig.json", baseTsconfigJson);
  } else {
    const deno = { tasks: { 
      sda: "deno run " + (args.includes("--env") ? "--env-file " : "") + "--node-modules-dir=auto -A --watch --check sda/main.ts",
      clean: "rm -rf .sda-cache && rm -rf .journalism-cache && rm -rf .tmp"
    }, nodeModulesDir: "auto" };
    writeFileSync("deno.json", JSON.stringify(deno, null, 2));
  }

  if (existsSync(".gitignore")) {
    const current = readFileSync(".gitignore", "utf-8");
    writeFileSync(".gitignore", current + "\n" + baseGitignore);
  } else {
    writeFileSync(".gitignore", baseGitignore);
  }

  if (!existsSync("sda")) mkdirSync("sda", { recursive: true });
  writeFileSync("sda/main.ts", getMainTs(example, false));
  if (!existsSync("sda/helpers")) mkdirSync("sda/helpers", { recursive: true });
  if (example) writeFileSync("sda/helpers/crunchData.ts", getCrunchDataTs(false));
  if (!existsSync("sda/data")) mkdirSync("sda/data", { recursive: true });
  if (example) writeFileSync("sda/data/temp.csv", "city,decade,meanTemp\nToronto,1840.0,7.1");
  if (!existsSync("sda/output")) mkdirSync("sda/output", { recursive: true });

  if (!existsSync("README.md")) writeFileSync("README.md", readme);

  if (args.includes("--env") && !existsSync(".env")) writeFileSync(".env", "");

  const installCmds: any = {
    nodejs: [
      "npx jsr add @nshiab/simple-data-analysis @nshiab/journalism",
      "npm i @observablehq/plot",
    ],
    bun: [
      "bunx jsr add @nshiab/simple-data-analysis @nshiab/journalism",
      "bun add @observablehq/plot",
    ],
    deno: [
      "deno install --node-modules-dir=auto jsr:@nshiab/simple-data-analysis jsr:@nshiab/journalism npm:@observablehq/plot",
    ]
  };

  if (args.includes("--scrape")) {
    installCmds.nodejs.push("npm i cheerio playwright-chromium");
    installCmds.nodejs.push("npx jsr add @std/fs");
    installCmds.bun.push("bun add cheerio playwright-chromium");
    installCmds.bun.push("bunx jsr add @std/fs");
    installCmds.deno.push("deno install --node-modules-dir=auto npm:cheerio npm:playwright-chromium jsr:@std/fs");
  }

  console.log("\n3 - Installing libraries...");
  installCmds[runtime].forEach((cmd: string) => execSync(cmd));

  if (args.includes("--git")) {
    console.log("\n4 - Initializing Git repository...");
    execSync("git init && git add -A && git commit -m 'Setup done'");
  }

  console.log("\nSetup is done!\n");
}
