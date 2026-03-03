export const viteConfigTs = `import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
});
`;

export const tsconfigJson = `{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
  }
  // Path aliases are handled by https://svelte.dev/docs/kit/configuration#alias
  // except $lib which is handled by https://svelte.dev/docs/kit/configuration#files
  //
  // If you want to overwrite includes/excludes, make sure to copy over the relevant includes/excludes
  // from the referenced tsconfig.json - TypeScript does not merge them in
}
`;

export function getSvelteConfigJs(pages: boolean) {
  if (pages) {
    return `import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import process from "node:process";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    paths: {
      base: process.argv.includes("dev") ? "" : process.env.BASE_PATH,
    },
  },
};

export default config;`;
  } else {
    return `import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
  },
};

export default config;`;
  }
}

export const deployYml = `name: Deploy to GitHub Pages

on:
  push:
    branches: "main"

jobs:
  build_site:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install Deno
        uses: denoland/setup-deno@v2
        with:
          deno-version: v2.x

      - name: Install dependencies
        run: deno install

      - name: build
        env:
          BASE_PATH: "/\${{ github.event.repository.name }}"
        run: deno task build

      - name: Upload Artifacts
        uses: actions/upload-pages-artifact@v3
        with:
          path: "build/"

  deploy:
    needs: build_site
    runs-on: ubuntu-latest

    permissions:
      pages: write
      id-token: write

    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
`;

export const svelteGitignore = `node_modules

# Output
.output
.vercel
/.svelte-kit
/build

# OS
.DS_Store
Thumbs.db

# Env
.env
.env.*
!.env.example
!.env.test

# Vite
vite.config.js.timestamp-*
vite.config.ts.timestamp-*

# Added by setup-sda
.tmp
.sda-cache
.journalism-cache
sda/data`;

export const baseGitignore = `# Added by setup-sda
node_modules
.tmp
.sda-cache
.journalism-cache
sda/data
.env
.DS_Store`;

export function getMainTs(example: boolean, svelte: boolean) {
  if (svelte) {
    if (example) {
      return `import { SimpleDB } from "@nshiab/simple-data-analysis";
import crunchData from "./helpers/crunchData.ts";

const sdb = new SimpleDB({ logDuration: true });

await crunchData(sdb);

await sdb.done();`;
    } else {
      return `import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();

// Do your magic here...

await sdb.done();`;
    }
  } else {
    // Non-svelte example
    if (example) {
      return `import { SimpleDB } from "@nshiab/simple-data-analysis";
import crunchData from "./helpers/crunchData.ts";

const sdb = new SimpleDB({ logDuration: true});

await crunchData(sdb);

await sdb.done();

`;
    } else {
      return `import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();

// Do your magic here!

await sdb.done();
`;
    }
  }
}

export function getCrunchDataTs(svelte: boolean) {
  if (svelte) {
    return `import type { SimpleDB } from "@nshiab/simple-data-analysis";

export default async function crunchData(sdb: SimpleDB) {

  // The mean temperature per decade.
  const temp = sdb.newTable("temp");
  await temp.loadData("sda/data/temp.csv");
  await temp.logTable();

  // We compute a linear regression for each city.
  const tempRegressions = await temp.linearRegressions({
    x: "decade",
    y: "meanTemp",
    categories: "city",
    decimals: 4,
    outputTable: "tempRegressions",
  });
  await tempRegressions.logTable();

  // We write the results to src/data
  await tempRegressions.writeData("src/data/temp-regressions.json");
  // Or to static
  await temp.writeData("static/temp.json");
}`;
  } else {
    return `import type { SimpleDB } from "@nshiab/simple-data-analysis";

export default async function crunchData(sdb: SimpleDB) {
  
  // The mean temperature per decade.
  const temp = sdb.newTable("temp");
  await temp.loadData("sda/data/temp.csv");

  // We log the table.
  await temp.logTable();

  // We log line charts.
  await temp.logLineChart("decade", "meanTemp", {
    smallMultiples: "city",
    fixedScales: true,
    formatY: (d) => \\\`\\\${d}°C\\\`,
  });

  // We compute a linear regression for each city.
  const tempRegressions = await temp.linearRegressions({
    x: "decade",
    y: "meanTemp",
    categories: "city",
    decimals: 4,
    outputTable: "tempRegressions",
  });
  await tempRegressions.logTable();

  // We write the results to src/output.
  await tempRegressions.writeData("sda/output/temp-regressions.json");
}
`;
  }
}

export const baseTsconfigJson = `{
  "compilerOptions": {
    "module": "NodeNext",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "verbatimModuleSyntax": null
  },
  "include": ["**/*"],
  "exclude": ["node_modules"]
}
`;
