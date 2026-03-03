import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Buffer } from "node:buffer";
import { styleCss, highlightThemeCss } from "../templates/css.ts";
import {
  getPageSvelte,
  getLayoutSvelte,
  tableSvelte,
  selectSvelte,
  radioSvelte,
  CodeHighlightSvelte,
  highlightSvelte,
  chartSvelte,
  pageTs,
  layoutTs,
  getLibIndexTs,
  getTempChangeTs,
  appDTs,
  appHtml
} from "../templates/svelte.ts";
import {
  viteConfigTs,
  tsconfigJson,
  getSvelteConfigJs,
  deployYml,
  svelteGitignore,
  getMainTs,
  getCrunchDataTs
} from "../templates/configs.ts";
import { Runtime } from "../lib/utils.ts";

export async function setupSvelte(args: string[], runtime: Runtime, execSync: any) {
  if (!args.includes("--svelte")) return;

  const example = args.includes("--example");
  
  console.log("\n2 - Creating relevant files...");

  if (runtime === "nodejs") {
    if (existsSync("package.json")) {
      const current = JSON.parse(readFileSync("package.json", "utf-8"));
      current.scripts = { ...current.scripts, 
        dev: "vite dev",
        build: "vite build",
        preview: "vite preview",
        check: "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
        "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
        sda: "node " + (args.includes("--env") ? "--env-file=.env " : "") + "--experimental-strip-types --no-warnings --watch sda/main.ts",
        clean: "rm -rf .sda-cache && rm -rf .journalism-cache && rm -rf .tmp"
      };
      writeFileSync("package.json", JSON.stringify(current, null, 2));
    } else {
      const pkg = {
        type: "module",
        scripts: {
          dev: "vite dev",
          build: "vite build",
          preview: "vite preview",
          check: "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
          "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
          sda: "node " + (args.includes("--env") ? "--env-file=.env " : "") + "--experimental-strip-types --no-warnings --watch sda/main.ts",
          clean: "rm -rf .sda-cache && rm -rf .journalism-cache && rm -rf .tmp"
        }
      };
      writeFileSync("package.json", JSON.stringify(pkg, null, 2));
    }
    if (!existsSync("tsconfig.json")) writeFileSync("tsconfig.json", tsconfigJson);
    if (!existsSync("vite.config.ts")) writeFileSync("vite.config.ts", viteConfigTs);
    if (!existsSync("svelte.config.js")) writeFileSync("svelte.config.js", getSvelteConfigJs(args.includes("--pages")));
  } else if (runtime === "bun") {
    if (existsSync("package.json")) {
      const current = JSON.parse(readFileSync("package.json", "utf-8"));
      current.scripts = { ...current.scripts, 
        dev: "vite dev",
        build: "vite build",
        preview: "vite preview",
        check: "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
        "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
        sda: "bun --watch sda/main.ts",
        clean: "rm -rf .sda-cache && rm -rf .journalism-cache && rm -rf .tmp"
      };
      writeFileSync("package.json", JSON.stringify(current, null, 2));
    } else {
      const pkg = {
        type: "module",
        scripts: {
          dev: "vite dev",
          build: "vite build",
          preview: "vite preview",
          check: "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
          "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
          sda: "bun --watch sda/main.ts",
          clean: "rm -rf .sda-cache && rm -rf .journalism-cache && rm -rf .tmp"
        }
      };
      writeFileSync("package.json", JSON.stringify(pkg, null, 2));
    }
    if (!existsSync("tsconfig.json")) writeFileSync("tsconfig.json", tsconfigJson);
    if (!existsSync("vite.config.ts")) writeFileSync("vite.config.ts", viteConfigTs);
    if (!existsSync("svelte.config.js")) writeFileSync("svelte.config.js", getSvelteConfigJs(args.includes("--pages")));
  } else if (runtime === "deno") {
    const denoJson: any = {
      tasks: {
        "dev": "vite dev",
        "build": "vite build",
        "preview": "vite preview",
        "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
        "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
        sda: "deno run " + (args.includes("--env") ? "--env-file " : "") + "--node-modules-dir=auto -A --watch --check sda/main.ts",
        clean: "rm -rf .sda-cache && rm -rf .journalism-cache && rm -rf .tmp",
      },
      nodeModulesDir: "auto",
      "unstable": ["sloppy-imports", "fmt-component"],
      "lint": { "rules": { "exclude": ["no-sloppy-imports"] } },
      "imports": { "$lib": "./src/lib/index.ts", "$lib/": "./src/lib/" },
      "compilerOptions": {
        "rootDirs": [".", "./.svelte-kit/types"],
        "verbatimModuleSyntax": true,
        "lib": ["esnext", "DOM", "DOM.Iterable", "deno.ns"],
        "types": ["./.svelte-kit/ambient.d.ts", "./.svelte-kit/non-ambient.d.ts"],
      },
    };
    if (existsSync("deno.json")) {
      const current = JSON.parse(readFileSync("deno.json", "utf-8"));
      current.tasks = { ...current.tasks, ...denoJson.tasks };
      writeFileSync("deno.json", JSON.stringify(current, null, 2));
    } else {
      writeFileSync("deno.json", JSON.stringify(denoJson, null, 2));
    }
    if (!existsSync("tsconfig.json")) writeFileSync("tsconfig.json", tsconfigJson);
    if (!existsSync("vite.config.ts")) writeFileSync("vite.config.ts", viteConfigTs);
    if (!existsSync("svelte.config.js")) writeFileSync("svelte.config.js", getSvelteConfigJs(args.includes("--pages")));
  }

  if (existsSync(".gitignore")) {
    const current = readFileSync(".gitignore", "utf-8");
    writeFileSync(".gitignore", current + "\n\n# Added by setup-sda\n" + svelteGitignore);
  } else {
    writeFileSync(".gitignore", svelteGitignore);
  }

  if (!existsSync(".svelte-kit")) mkdirSync(".svelte-kit", { recursive: true });
  writeFileSync(".svelte-kit/ambient.d.ts", "");
  writeFileSync(".svelte-kit/non-ambient.d.ts", "");

  if (!existsSync("static")) mkdirSync("static", { recursive: true });
  writeFileSync("static/style.css", styleCss);
  writeFileSync("static/highlight-theme.css", highlightThemeCss);

  try {
    const res = await fetch("https://svelte.dev/favicon.png");
    const arrayBuffer = await res.arrayBuffer();
    writeFileSync("static/favicon.png", Buffer.from(arrayBuffer));
  } catch (e) { console.error("    => static/favicon.png could not be created."); }

  if (example) writeFileSync("static/temp.json", JSON.stringify([]));

  if (!existsSync("src")) mkdirSync("src", { recursive: true });
  writeFileSync("src/app.html", appHtml);
  writeFileSync("src/app.d.ts", appDTs);

  if (!existsSync("src/routes")) mkdirSync("src/routes", { recursive: true });
  writeFileSync("src/routes/+page.svelte", getPageSvelte(example));
  if (example) writeFileSync("src/routes/+page.ts", pageTs);
  writeFileSync("src/routes/+layout.ts", layoutTs);
  writeFileSync("src/routes/+layout.svelte", getLayoutSvelte(example, args.includes("--pages")));

  if (!existsSync("src/lib")) mkdirSync("src/lib", { recursive: true });
  writeFileSync("src/lib/index.ts", getLibIndexTs(example));

  if (!existsSync("src/helpers")) mkdirSync("src/helpers", { recursive: true });
  if (example) writeFileSync("src/helpers/getTempChange.ts", getTempChangeTs);

  if (!existsSync("src/components")) mkdirSync("src/components", { recursive: true });
  writeFileSync("src/components/Table.svelte", tableSvelte);
  writeFileSync("src/components/Select.svelte", selectSvelte);
  writeFileSync("src/components/Radio.svelte", radioSvelte);
  writeFileSync("src/components/CodeHighlight.svelte", CodeHighlightSvelte);
  writeFileSync("src/components/Highlight.svelte", highlightSvelte);
  if (example) writeFileSync("src/components/Chart.svelte", chartSvelte);

  if (!existsSync("src/data")) mkdirSync("src/data", { recursive: true });

  if (!existsSync("sda")) mkdirSync("sda", { recursive: true });
  writeFileSync("sda/main.ts", getMainTs(example, true));
  if (!existsSync("sda/helpers")) mkdirSync("sda/helpers", { recursive: true });
  if (example) writeFileSync("sda/helpers/crunchData.ts", getCrunchDataTs(true));
  if (!existsSync("sda/data")) mkdirSync("sda/data", { recursive: true });
  if (example) writeFileSync("sda/data/temp.csv", "city,decade,meanTemp\nToronto,1840.0,7.1");
  if (!existsSync("sda/output")) mkdirSync("sda/output", { recursive: true });

  if (args.includes("--pages")) {
    if (!existsSync(".github")) mkdirSync(".github", { recursive: true });
    if (!existsSync(".github/workflows")) mkdirSync(".github/workflows", { recursive: true });
    writeFileSync(".github/workflows/deploy.yml", deployYml);
  }

  if (args.includes("--env") && !existsSync(".env")) writeFileSync(".env", "");

  const installCmds: any = {
    nodejs: [
      "npm i @sveltejs/adapter-auto @sveltejs/adapter-static @sveltejs/kit @sveltejs/vite-plugin-svelte svelte svelte-check typescript vite highlight.js @observablehq/plot --save-dev",
      "npx jsr add @nshiab/simple-data-analysis @nshiab/journalism",
    ],
    bun: [
      "bun add @sveltejs/adapter-auto @sveltejs/adapter-static @sveltejs/kit @sveltejs/vite-plugin-svelte svelte svelte-check typescript vite highlight.js @observablehq/plot --dev",
      "bunx jsr add @nshiab/simple-data-analysis @nshiab/journalism",
    ],
    deno: [
      "deno install --node-modules-dir=auto --dev --allow-scripts=npm:@sveltejs/kit npm:@sveltejs/adapter-auto npm:@sveltejs/adapter-static npm:@sveltejs/kit npm:@sveltejs/vite-plugin-svelte npm:svelte npm:svelte-check npm:typescript npm:vite npm:highlight.js npm:@observablehq/plot jsr:@nshiab/simple-data-analysis jsr:@nshiab/journalism",
    ]
  };

  if (args.includes("--scrape")) {
    installCmds.nodejs.push("npm i cheerio playwright-chromium");
    installCmds.nodejs.push("npx jsr add @std/fs");
    installCmds.bun.push("bun add cheerio playwright-chromium");
    installCmds.bun.push("bunx jsr add @std/fs");
    installCmds.deno.push("deno install --node-modules-dir=auto npm:cheerio npm:playwright-chromium jsr:@std/fs");
  }

  console.log("\n3 - Installing libraries with " + (runtime === "nodejs" ? "NPM" : runtime === "bun" ? "Bun" : "Deno") + "...");
  installCmds[runtime].forEach((cmd: string) => execSync(cmd));
}
