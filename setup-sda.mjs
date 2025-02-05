#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import process from "node:process";

console.log("\nStarting sda setup...");

console.log("\n1 - Checking runtime and options...");

let runtime;
console.log(`    => Your navigator userAgent is: ${navigator.userAgent}`);
const userAgent = navigator.userAgent.toLocaleLowerCase();
if (userAgent.includes("bun")) {
  runtime = "bun";
} else if (userAgent.includes("deno")) {
  runtime = "deno";
} else if (userAgent.includes("node")) {
  runtime = "nodejs";
} else {
  throw new Error("Unknown runtime.");
}

const args = process.argv.slice(2);

if (args.includes("--git")) {
  console.log(`    => You passed the option --git`);
}

if (args.includes("--framework")) {
  console.log(`    => You passed the option --framework`);

  const readme =
    `This repository has been created with [setup-sda](https://github.com/nshiab/setup-sda/).

It's using [simple-data-analysis](https://github.com/nshiab/simple-data-analysis), [journalism](https://github.com/nshiab/journalism) and [Framework](https://github.com/observablehq/framework) with [Plot](https://github.com/observablehq/plot).

Here's the recommended workflow:

- Put your raw data in the \`sda/data\` folder. Note that this folder is gitignored.
- Use the \`sda/main.ts\` file to clean and process your raw data. Write the results to the \`src/data\` folder.
- Import your processed data from the \`src/data\` folder into the \`src/index.md\` and use it for your content.

When working on your project, you can use the following commands:

- \`npm run sda\` will watch your \`sda/main.ts\` and its dependencies. Everytime you'll save some changes, the data will be reprocessed.
- \`npm run dev\` will start a local server and watch all \`src/*.md\` files and their dependencies. Everytime you'll save some changes or the data is reprocessed, the content will be updated.

By opening two terminals each running one of the above commands, you'll be able to work on your project with a live preview of your content and data.
`;

  const packageJson = {
    type: "module",
    scripts: {
      clean:
        "rimraf src/.observablehq/cache && rimraf .sda-cache && rimraf .temp",
      build: "observable build",
      dev: "observable preview",
      deploy: "observable deploy",
      observable: "observable",
      sda: "node --experimental-strip-types --no-warnings --watch sda/main.ts",
    },
  };

  const denoJson = {
    tasks: {
      clean:
        "rimraf src/.observablehq/cache && rimraf .sda-cache && rimraf .temp",
      build: "observable build",
      dev: "observable preview",
      deploy: "observable deploy",
      observable: "observable",
      sda: "deno run --node-modules-dir=auto -A --watch --check sda/main.ts",
    },
    nodeModulesDir: "auto",
  };

  const observableConfigJS = `
  // See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "My new project",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  // pages: [
  //   {
  //     name: "Examples",
  //     pages: [
  //       {name: "Dashboard", path: "/example-dashboard"},
  //       {name: "Report", path: "/example-report"}
  //     ]
  //   }
  // ],

  // Content to add to the head of the page, e.g. for a favicon:
  // head: '<link rel="icon" href="observable.png" type="image/png" sizes="32x32">',

  // The path to the source root.
  root: "src",

  // Some additional configuration options and their defaults:
  theme: "light", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // sidebar: true, // whether to show the sidebar
  toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // cleanUrls: true, // drop .html from URLs
};
  `;

  const data = `city,decade,meanTemp
Toronto,1840.0,7.1
Toronto,1850.0,6.4
Toronto,1860.0,6.9
Toronto,1870.0,6.8
Montreal,1880.0,5.3
Toronto,1880.0,6.6
Montreal,1890.0,6.0
Toronto,1890.0,7.6
Montreal,1900.0,5.8
Toronto,1900.0,7.7
Montreal,1910.0,6.1
Toronto,1910.0,8.1
Montreal,1920.0,6.2
Toronto,1920.0,8.0
Montreal,1930.0,6.8
Toronto,1930.0,8.6
Montreal,1940.0,6.9
Toronto,1940.0,8.7
Montreal,1950.0,7.4
Toronto,1950.0,9.2
Montreal,1960.0,7.4
Toronto,1960.0,8.8
Montreal,1970.0,7.3
Toronto,1970.0,9.0
Montreal,1980.0,7.7
Toronto,1980.0,9.0
Toronto,1990.0,9.6
Montreal,2000.0,7.6
Toronto,2000.0,9.7
Montreal,2010.0,8.0
Toronto,2010.0,9.9
`;

  const tempJSON = `[
	{"city":"Toronto","decade":1840.0,"meanTemp":7.1},
	{"city":"Toronto","decade":1850.0,"meanTemp":6.4},
	{"city":"Toronto","decade":1860.0,"meanTemp":6.9},
	{"city":"Toronto","decade":1870.0,"meanTemp":6.8},
	{"city":"Montreal","decade":1880.0,"meanTemp":5.3},
	{"city":"Toronto","decade":1880.0,"meanTemp":6.6},
	{"city":"Montreal","decade":1890.0,"meanTemp":6.0},
	{"city":"Toronto","decade":1890.0,"meanTemp":7.6},
	{"city":"Montreal","decade":1900.0,"meanTemp":5.8},
	{"city":"Toronto","decade":1900.0,"meanTemp":7.7},
	{"city":"Montreal","decade":1910.0,"meanTemp":6.1},
	{"city":"Toronto","decade":1910.0,"meanTemp":8.1},
	{"city":"Montreal","decade":1920.0,"meanTemp":6.2},
	{"city":"Toronto","decade":1920.0,"meanTemp":8.0},
	{"city":"Montreal","decade":1930.0,"meanTemp":6.8},
	{"city":"Toronto","decade":1930.0,"meanTemp":8.6},
	{"city":"Montreal","decade":1940.0,"meanTemp":6.9},
	{"city":"Toronto","decade":1940.0,"meanTemp":8.7},
	{"city":"Montreal","decade":1950.0,"meanTemp":7.4},
	{"city":"Toronto","decade":1950.0,"meanTemp":9.2},
	{"city":"Montreal","decade":1960.0,"meanTemp":7.4},
	{"city":"Toronto","decade":1960.0,"meanTemp":8.8},
	{"city":"Montreal","decade":1970.0,"meanTemp":7.3},
	{"city":"Toronto","decade":1970.0,"meanTemp":9.0},
	{"city":"Montreal","decade":1980.0,"meanTemp":7.7},
	{"city":"Toronto","decade":1980.0,"meanTemp":9.0},
	{"city":"Toronto","decade":1990.0,"meanTemp":9.6},
	{"city":"Montreal","decade":2000.0,"meanTemp":7.6},
	{"city":"Toronto","decade":2000.0,"meanTemp":9.7},
	{"city":"Montreal","decade":2010.0,"meanTemp":8.0},
	{"city":"Toronto","decade":2010.0,"meanTemp":9.9}
]`;

  const tempRegressionsJSON = `[
	{"city":"Montreal","x":"decade","y":"meanTemp","slope":0.0196,"yIntercept":-31.3115,"r2":0.921},
	{"city":"Toronto","x":"decade","y":"meanTemp","slope":0.0203,"yIntercept":-30.7911,"r2":0.9261}
]`;

  const mainTs = `import { SimpleDB } from "@nshiab/simple-data-analysis";
import crunchData from "./helpers/crunchData.ts";

const sdb = new SimpleDB({ logDuration: true });

await crunchData(sdb);

await sdb.done();

`;

  const crunchDataTs =
    `import type { SimpleDB } from "@nshiab/simple-data-analysis";

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

  // We write the results to src/output.
  await temp.writeData("src/data/temp.json");
  await tempRegressions.writeData("src/data/temp-regressions.json");
}
`;

  const indexMd = `\`\`\`ts
// To import .ts files, you need to use the .js extension
import getTempChange from "./helpers/getTempChange.js";
import createChart from "./components/createChart.js";

const temp = FileAttachment("data/temp.json").json();
const tempRegressions = FileAttachment("data/temp-regressions.json").json();
\`\`\`

# My new project

This is the home page of your new project.

The content below is just an example.

## Climate change

\`\`\`ts
const cities = tempRegressions.map((d) => d.city);
const city = view(Inputs.select(cities, { label: "Pick a city" }));
\`\`\`

On average, the temperature in <b>\${city}</b> has increased by \${getTempChange(
    city,
    tempRegressions
  )} per decade.

\`\`\`ts
// Width is directly available and reactive. The chart will be redrawn when the width changes.
display(createChart(city, temp, tempRegressions, width));
\`\`\`

Here's all the data.

\`\`\`ts
const cityTemp = temp.filter((d) => d.city === city);
display(Inputs.table(cityTemp));
\`\`\`

## Methodology

This project uses a simple linear regression to estimate the temperature change in each city. The data comes from the Adjusted and Homogenized Canadian Climate Data (AHCCD) dataset.

To compute the regressions, we used the [simple-data-analysis](https://github.com/nshiab/simple-data-analysis) library.

\`\`\`ts run=false
import type { SimpleDB } from "@nshiab/simple-data-analysis";

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

  // We write the results to src/data.
  await temp.writeData("src/data/temp.json");
  await tempRegressions.writeData("src/data/temp-regressions.json");
}
\`\`\`

`;

  const createChartTs = `
import { dot, line, plot } from "npm:@observablehq/plot";

export default function createChart(
  city: string,
  temp: { city: string; decade: number; meanTemp: number }[],
  tempRegressions: {
    city: string;
    slope: number;
    yIntercept: number;
    r2: number;
  }[],
  width: number
) {
  const tempCity = temp.filter((t) => t.city === city);

  // We create x and y coordinates to draw a line based on the linear regression.
  const regressionCity = tempRegressions.find((r) => r.city === city);
  if (regressionCity === undefined) {
    throw new Error(\`City \${city} not found in tempRegressions.\`);
  }
  const x1 = tempCity[0].decade;
  const x2 = tempCity[tempCity.length - 1].decade;
  const y1 = regressionCity.yIntercept + x1 * regressionCity.slope;
  const y2 = regressionCity.yIntercept + x2 * regressionCity.slope;
  const regressionLine = [
    { decade: x1, meanTemp: y1 },
    { decade: x2, meanTemp: y2 },
  ];

  const caption = \`Mean temperature per decade in \${city}. Linear regression: y = \${regressionCity.slope}x + \${regressionCity.yIntercept}, R² = \${regressionCity.r2}\`;

  return plot({
    width,
    x: { label: "Time", tickFormat: (d) => String(d) },
    y: { label: "Temperature", tickFormat: (d) => \`\${d}°C\`, ticks: 5 },
    inset: 20,
    grid: true,
    marks: [
      line(regressionLine, {
        x: "decade",
        y: "meanTemp",
        stroke: "black",
        strokeDasharray: "4,4",
      }),
      dot(tempCity, { x: "decade", y: "meanTemp", fill: "orange", r: 5 }),
    ],
    caption,
  });
}
`;

  let getTempChangeTs =
    `// It's important to use the 'web' entrypoint since this is running in the browser.
import { formatNumber } from "@nshiab/journalism/web";

export default function getTempChange(
  city: string,
  tempRegressions: { city: string; slope: number }[]
): string {
  const cityRegression = tempRegressions.find((r) => r.city === city);

  if (cityRegression === undefined) {
    throw new Error(\`City \${city} not found in tempRegressions.\`);
  }

  const slopPerDecade = cityRegression.slope * 10;

  return formatNumber(slopPerDecade, { decimals: 3, suffix: "°C" });
}
`;

  console.log("\n2 - Creating relevant files...");

  if (existsSync("README.md")) {
    console.log("    => README.md already exists.");
  } else {
    writeFileSync("README.md", readme);
    console.log("    => README.md has been created.");
  }

  if (runtime === "bun") {
    packageJson.scripts.sda = "bun --watch sda/main.ts";
  } else if (runtime === "deno") {
    packageJson.scripts.sda =
      "deno run --node-modules-dir=auto -A --watch --check sda/main.ts";
  }

  if (runtime === "deno") {
    if (existsSync("deno.json")) {
      console.log("    => deno.json already exists.");
      const currentDenoJson = JSON.parse(
        readFileSync("./deno.json", "utf-8"),
      );
      currentDenoJson.tasks = {
        ...currentDenoJson.tasks,
        ...denoJson.tasks,
      };
      currentDenoJson.nodeModulesDir = "auto";
      writeFileSync("deno.json", JSON.stringify(currentDenoJson, null, 2));
      console.log("    => deno.json has been updated.");
    } else {
      writeFileSync("deno.json", JSON.stringify(denoJson, null, 2));
      console.log("    => deno.json has been created.");
    }
  } else {
    if (existsSync("package.json")) {
      console.log("    => package.json already exists.");
      const currentPackageJson = JSON.parse(
        readFileSync("./package.json", "utf-8"),
      );
      currentPackageJson.scripts = {
        ...currentPackageJson.scripts,
        ...packageJson.scripts,
      };
      writeFileSync(
        "package.json",
        JSON.stringify(currentPackageJson, null, 2),
      );
      console.log("    => package.json has been updated.");
    } else {
      writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
      console.log("    => package.json has been created.");
    }
  }

  if (existsSync("observablehq.config.js")) {
    console.log("    => observablehq.config.js already exists.");
  } else {
    writeFileSync("observablehq.config.js", observableConfigJS);
    console.log("    => observablehq.config.js has been created.");
  }

  if (existsSync(".gitignore")) {
    console.log("    => .gitignore already exists.");
  } else {
    writeFileSync(
      ".gitignore",
      "dist/\nnode_modules/\nyarn-error.log\n.temp\n.sda-cache\ndata\n.DS_Store",
    );
    console.log("    => .gitignore has been created.");
  }

  if (existsSync("sda")) {
    console.log("    => sda/ already exists.");
  } else {
    mkdirSync("sda");

    writeFileSync("sda/main.ts", mainTs);
    console.log("    => sda/main.ts has been created.");

    mkdirSync("sda/helpers");

    writeFileSync("sda/helpers/crunchData.ts", crunchDataTs);
    console.log("    => sda/helpers/crunchData.ts has been created.");

    mkdirSync("sda/data");

    writeFileSync("sda/data/temp.csv", data);
    console.log("    => sda/data/temp.csv has been created.");
  }

  if (existsSync("src")) {
    console.log("    => src/ already exists.");
  } else {
    mkdirSync("src");

    writeFileSync("src/index.md", indexMd);
    console.log("    => src/index.md has been created.");

    writeFileSync("src/.gitignore", "/.observablehq/cache/");
    console.log("    => src/.gitignore has been created.");

    mkdirSync("src/data");
    console.log("    => src/data/ has been created.");

    writeFileSync("src/data/temp.json", tempJSON);
    console.log("    => src/data/temp.json has been created.");

    writeFileSync("src/data/temp-regressions.json", tempRegressionsJSON);
    console.log("    => src/data/temp-regressions.json has been created.");

    mkdirSync("src/components");

    writeFileSync("src/components/createChart.ts", createChartTs);
    console.log("    => src/components/createChart.ts has been created.");

    mkdirSync("src/helpers");

    if (runtime === "deno") {
      getTempChangeTs = getTempChangeTs.replace(
        `import { formatNumber } from "@nshiab/journalism/web";`,
        `import { formatNumber } from "jsr:@nshiab/journalism/web";`,
      );
    }
    writeFileSync("src/helpers/getTempChange.ts", getTempChangeTs);
    console.log("    => src/helpers/getTempChange.ts has been created.");
  }

  if (runtime === "nodejs") {
    console.log("\n3 - Installing libraries with NPM...");
    execSync("npm i rimraf  --save-dev", {
      stdio: "ignore",
    });
    console.log("    => rimraf has been installed from NPM.");
    execSync("npm i @observablehq/framework", {
      stdio: "ignore",
    });
    console.log("    => @observablehq/framework has been installed from NPM.");
    execSync("npm i @observablehq/plot", {
      stdio: "ignore",
    });
    console.log("    => @observablehq/plot has been installed from NPM.");
    execSync("npx jsr add @nshiab/simple-data-analysis", {
      stdio: "ignore",
    });
    console.log("    => simple-data-analysis has been installed from JSR.");
    execSync("npx jsr add @nshiab/journalism", {
      stdio: "ignore",
    });
    console.log("    => journalism has been installed from JSR.");
  } else if (runtime === "bun") {
    console.log("\n3 - Installing libraries with Bun...");
    execSync("bun add rimraf --dev", {
      stdio: "ignore",
    });
    console.log("    => rimraf has been installed from NPM.");
    execSync("bun add @observablehq/framework", {
      stdio: "ignore",
    });
    console.log("    => @observablehq/framework has been installed from NPM.");
    execSync("bun add @observablehq/plot", {
      stdio: "ignore",
    });
    console.log("    => @observablehq/plot has been installed from NPM.");
    execSync("bunx jsr add @nshiab/simple-data-analysis", {
      stdio: "ignore",
    });
    console.log("    => simple-data-analysis has been installed from JSR.");
    execSync("bunx jsr add @nshiab/journalism", {
      stdio: "ignore",
    });
    console.log("    => journalism has been installed from JSR.");
  } else if (runtime === "deno") {
    console.log("\n3 - Installing libraries with Deno...");
    execSync(
      "deno install --node-modules-dir=auto --allow-scripts=npm:playwright-chromium@1.50.0 jsr:@nshiab/simple-data-analysis",
      {
        stdio: "ignore",
      },
    );
    console.log("    => simple-data-analysis has been installed from JSR.");
    execSync(
      "deno install --node-modules-dir=auto --allow-scripts=npm:playwright-chromium@1.50.0 jsr:@nshiab/journalism",
      {
        stdio: "ignore",
      },
    );
    console.log("    => journalism has been installed from JSR.");
    execSync("deno install --node-modules-dir=auto --dev npm:rimraf", {
      stdio: "ignore",
    });
    console.log("    => rimraf has been installed from NPM.");
    execSync(
      "deno install --node-modules-dir=auto npm:@observablehq/framework",
      {
        stdio: "ignore",
      },
    );
    console.log("    => @observablehq/framework has been installed from NPM.");
    execSync("deno install --node-modules-dir=auto npm:@observablehq/plot", {
      stdio: "ignore",
    });
    console.log("    => @observablehq/plot has been installed from NPM.");
  }

  if (args.includes("--git")) {
    console.log("\n4 - Initializing Git repository...");
    execSync("git init && git add -A && git commit -m 'Setup done'", {
      stdio: "ignore",
    });
    console.log("    => First commit done");
  }

  console.log("\nSetup is done!\n");

  if (runtime === "nodejs") {
    console.log("    => Run 'npm run sda' to watch main.ts.");
    console.log(
      "    => Run 'npm run dev' to start a local server and watch index.md.",
    );
  } else if (runtime === "bun") {
    console.log("    => Run 'bun run sda' to watch main.ts.");
    console.log(
      "    => Run 'bun run dev' to start a local server and watch index.md.",
    );
  } else if (runtime === "deno") {
    console.log("    => Run 'deno task sda' to watch main.ts.");
    console.log(
      "    => Run 'deno task dev' to start a local server and watch index.md.",
    );
  }

  console.log("\nCheck the README.md and have fun. ^_^\n");
} else if (args.includes("--svelte")) {
  console.log(`    => You passed the option --svelte`);

  const readme =
    `This repository has been created with [setup-sda](https://github.com/nshiab/setup-sda/).

It's using [simple-data-analysis](https://github.com/nshiab/simple-data-analysis), [journalism](https://github.com/nshiab/journalism), and others great open-source librairies with [SvelteKit](https://svelte.dev/docs/kit/introduction).

Here's the recommended workflow:

- Put your raw data in the \`sda/data\` folder. Note that this folder is gitignored.
- Use the \`sda/main.ts\` file to clean and process your raw data. Write the results to the \`src/data\` or \`static/\` folders.
- Import your processed data from the \`src/data\` folder into the \`src/routes/+page.svelte\` or fetch it with \`src/routes/+page.js\`.
- Use the data for your content.

When working on your project, you can use the following commands:

- \`npm run sda\` will watch your \`sda/main.ts\` and its dependencies. Everytime you'll save some changes, the data will be reprocessed.
- \`npm run dev\` will start a local server and watch all \`src/*\` files and their dependencies. Everytime you'll save some changes or the data is reprocessed, the content will be updated.

By opening two terminals each running one of the above commands, you'll be able to work on your project with a live preview of your content and data.
  `;

  const packageJson = {
    type: "module",
    scripts: {
      "dev": "vite dev",
      "build": "vite build",
      "preview": "vite preview",
      "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
      "check:watch":
        "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
      sda: "node --experimental-strip-types --no-warnings --watch sda/main.ts",
      clean: "rm -rf .sda-cache && rm -rf .temp",
    },
  };

  const denoJson = {
    tasks: {
      "dev": "vite dev",
      "build": "vite build",
      "preview": "vite preview",
      "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
      "check:watch":
        "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
      sda: "deno run --node-modules-dir=auto -A --watch --check sda/main.ts",
      clean: "rm -rf .sda-cache && rm -rf .temp",
    },
    nodeModulesDir: "auto",
    compilerOptions: {
      "lib": ["dom", "deno.ns"],
    },
    unstable: [
      "fmt-component",
    ],
  };

  const tempCsv = `city,decade,meanTemp
Toronto,1840.0,7.1
Toronto,1850.0,6.4
Toronto,1860.0,6.9
Toronto,1870.0,6.8
Montreal,1880.0,5.3
Toronto,1880.0,6.6
Montreal,1890.0,6.0
Toronto,1890.0,7.6
Montreal,1900.0,5.8
Toronto,1900.0,7.7
Montreal,1910.0,6.1
Toronto,1910.0,8.1
Montreal,1920.0,6.2
Toronto,1920.0,8.0
Montreal,1930.0,6.8
Toronto,1930.0,8.6
Montreal,1940.0,6.9
Toronto,1940.0,8.7
Montreal,1950.0,7.4
Toronto,1950.0,9.2
Montreal,1960.0,7.4
Toronto,1960.0,8.8
Montreal,1970.0,7.3
Toronto,1970.0,9.0
Montreal,1980.0,7.7
Toronto,1980.0,9.0
Toronto,1990.0,9.6
Montreal,2000.0,7.6
Toronto,2000.0,9.7
Montreal,2010.0,8.0
Toronto,2010.0,9.9`;

  const tempJSON = `[
	{"city":"Toronto","decade":1840,"meanTemp":7.1},
	{"city":"Toronto","decade":1850,"meanTemp":6.4},
	{"city":"Toronto","decade":1860,"meanTemp":6.9},
	{"city":"Toronto","decade":1870,"meanTemp":6.8},
	{"city":"Montreal","decade":1880,"meanTemp":5.3},
	{"city":"Toronto","decade":1880,"meanTemp":6.6},
	{"city":"Montreal","decade":1890,"meanTemp":6.0},
	{"city":"Toronto","decade":1890,"meanTemp":7.6},
	{"city":"Montreal","decade":1900,"meanTemp":5.8},
	{"city":"Toronto","decade":1900,"meanTemp":7.7},
	{"city":"Montreal","decade":1910,"meanTemp":6.1},
	{"city":"Toronto","decade":1910,"meanTemp":8.1},
	{"city":"Montreal","decade":1920,"meanTemp":6.2},
	{"city":"Toronto","decade":1920,"meanTemp":8.0},
	{"city":"Montreal","decade":1930,"meanTemp":6.8},
	{"city":"Toronto","decade":1930,"meanTemp":8.6},
	{"city":"Montreal","decade":1940,"meanTemp":6.9},
	{"city":"Toronto","decade":1940,"meanTemp":8.7},
	{"city":"Montreal","decade":1950,"meanTemp":7.4},
	{"city":"Toronto","decade":1950,"meanTemp":9.2},
	{"city":"Montreal","decade":1960,"meanTemp":7.4},
	{"city":"Toronto","decade":1960,"meanTemp":8.8},
	{"city":"Montreal","decade":1970,"meanTemp":7.3},
	{"city":"Toronto","decade":1970,"meanTemp":9.0},
	{"city":"Montreal","decade":1980,"meanTemp":7.7},
	{"city":"Toronto","decade":1980,"meanTemp":9.0},
	{"city":"Toronto","decade":1990,"meanTemp":9.6},
	{"city":"Montreal","decade":2000,"meanTemp":7.6},
	{"city":"Toronto","decade":2000,"meanTemp":9.7},
	{"city":"Montreal","decade":2010,"meanTemp":8.0},
	{"city":"Toronto","decade":2010,"meanTemp":9.9}
]`;

  const tempRegressionsJSON = `[
	{"city":"Toronto","x":"decade","y":"meanTemp","slope":0.0203,"yIntercept":-30.7911,"r2":0.9261},
	{"city":"Montreal","x":"decade","y":"meanTemp","slope":0.0196,"yIntercept":-31.3115,"r2":0.921}
]`;

  const mainTs = `import { SimpleDB } from "@nshiab/simple-data-analysis";
import crunchData from "./helpers/crunchData.ts";

const sdb = new SimpleDB({ logDuration: true });

await crunchData(sdb);

await sdb.done();`;

  const crunchDataTs =
    `import type { SimpleDB } from "@nshiab/simple-data-analysis";

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

  const viteConfigTs = `import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
});
  `;

  const tsconfigJson = `{
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
    "rootDirs": ["..", "./types"]
  }
  // Path aliases are handled by https://svelte.dev/docs/kit/configuration#alias
  // except $lib which is handled by https://svelte.dev/docs/kit/configuration#files
  //
  // If you want to overwrite includes/excludes, make sure to copy over the relevant includes/excludes
  // from the referenced tsconfig.json - TypeScript does not merge them in
}
`;

  const svelteConfigJs = `import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      // default options are shown. On some platforms
      // these options are set automatically — see below
      pages: "build",
      assets: "build",
      fallback: undefined,
      precompress: false,
      strict: true,
    }),
  },
};

export default config;`;

  const gitignore = `node_modules

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

# SDA
.temp
.sda-cache
data`;

  const styleCss = `/* Adapted from https://github.com/kevquirk/simple.css */

/* Global variables. */
:root {
  /* Set sans-serif & mono fonts */
  --sans-font:
    -apple-system, BlinkMacSystemFont, "Avenir Next", Avenir, "Nimbus Sans L",
    Roboto, "Noto Sans", "Segoe UI", Arial, Helvetica, "Helvetica Neue",
    sans-serif;
  --mono-font: Consolas, Menlo, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
  --standard-border-radius: 5px;

  /* Default (light) theme */
  --bg: #fff;
  --accent-bg: #f5f5f5;
  /* --accent-bg: #f5f7ff; */
  --text: #212121;
  --text-light: #585858;
  --border: #898ea4;
  --accent: #0d47a1;
  --accent-hover: #1266e2;
  --accent-text: var(--bg);
  --code: #d81b60;
  --preformatted: #444;
  --marked: #ffdd33;
  --disabled: #efefef;
}

/* Dark theme */
/* @media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --bg: #212121;
    --accent-bg: #2b2b2b;
    --text: #dcdcdc;
    --text-light: #ababab;
    --accent: #ffb300;
    --accent-hover: #ffe099;
    --accent-text: var(--bg);
    --code: #f06292;
    --preformatted: #ccc;
    --disabled: #111;
  }
  img,
  video {
    opacity: 0.8;
  }
} */

/* Reset box-sizing */
*, *::before, *::after {
  box-sizing: border-box;
}

/* Reset default appearance */
textarea,
select,
input,
progress {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

html {
  /* Set the font globally */
  font-family: var(--sans-font);
  scroll-behavior: smooth;
}

/* Make the body a nice central block */
body {
  color: var(--text);
  background-color: var(--bg);
  font-size: 1.15rem;
  line-height: 1.5;
  display: grid;
  grid-template-columns: 1fr min(45rem, 90%) 1fr;
  margin: 0;
}
body > div > * {
  grid-column: 2;
}

/* Make the header bg full width, but the content inline with body */
body > div > header {
  background-color: var(--accent-bg);
  border-bottom: 1px solid var(--border);
  text-align: center;
  padding: 0 0.5rem 2rem 0.5rem;
  grid-column: 1 / -1;
}

body > div > header > *:only-child {
  margin-block-start: 2rem;
}

body > div > header h1 {
  max-width: 1200px;
  margin: 1rem auto;
}

body > div > header p {
  max-width: 40rem;
  margin: 1rem auto;
}

/* Add a little padding to ensure spacing is correct between content and header > nav */
main {
  padding-top: 1.5rem;
}

body > div > footer {
  margin-top: 4rem;
  padding: 2rem 1rem 1.5rem 1rem;
  color: var(--text-light);
  font-size: 0.9rem;
  text-align: center;
  border-top: 1px solid var(--border);
}

/* Format headers */
h1 {
  font-size: 3rem;
}

h2 {
  font-size: 2.6rem;
  margin-top: 3rem;
}

h3 {
  font-size: 2rem;
  margin-top: 3rem;
}

h4 {
  font-size: 1.44rem;
}

h5 {
  font-size: 1.15rem;
}

h6 {
  font-size: 0.96rem;
}

p {
  margin: 1.5rem 0;
}

/* Prevent long strings from overflowing container */
p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}

/* Fix line height when title wraps */
h1,
h2,
h3 {
  line-height: 1.1;
}

/* Reduce header size on mobile */
@media only screen and (max-width: 720px) {
  h1 {
    font-size: 2.5rem;
  }

  h2 {
    font-size: 2.1rem;
  }

  h3 {
    font-size: 1.75rem;
  }

  h4 {
    font-size: 1.25rem;
  }
}

/* Format links & buttons */
a,
a:visited {
  color: var(--accent);
}

a:hover {
  text-decoration: none;
}

button,
.button,
a.button, /* extra specificity to override a */
input[type="submit"],
input[type="reset"],
input[type="button"] {
  border: 1px solid var(--accent);
  background-color: var(--accent);
  color: var(--accent-text);
  padding: 0.5rem 0.9rem;
  text-decoration: none;
  line-height: normal;
}

.button[aria-disabled="true"],
input:disabled,
textarea:disabled,
select:disabled,
button[disabled] {
  cursor: not-allowed;
  background-color: var(--disabled);
  border-color: var(--disabled);
  color: var(--text-light);
}

input[type="range"] {
  padding: 0;
}

/* Set the cursor to '?' on an abbreviation and style the abbreviation to show that there is more information underneath */
abbr[title] {
  cursor: help;
  text-decoration-line: underline;
  text-decoration-style: dotted;
}

button:enabled:hover,
.button:not([aria-disabled="true"]):hover,
input[type="submit"]:enabled:hover,
input[type="reset"]:enabled:hover,
input[type="button"]:enabled:hover {
  background-color: var(--accent-hover);
  border-color: var(--accent-hover);
  cursor: pointer;
}

.button:focus-visible,
button:focus-visible:where(:enabled),
input:enabled:focus-visible:where(
  [type="submit"],
  [type="reset"],
  [type="button"]
) {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

/* Format navigation */
header > nav {
  font-size: 1rem;
  line-height: 2;
  padding: 1rem 0 0 0;
}

/* Use flexbox to allow items to wrap, as needed */
header > nav ul,
header > nav ol {
  align-content: space-around;
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  list-style-type: none;
  margin: 0;
  padding: 0;
}

/* List items are inline elements, make them behave more like blocks */
header > nav ul li,
header > nav ol li {
  display: inline-block;
}

header > nav a,
header > nav a:visited {
  margin: 0 0.5rem 1rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--standard-border-radius);
  color: var(--text);
  display: inline-block;
  padding: 0.1rem 1rem;
  text-decoration: none;
}

header > nav a:hover,
header > nav a.current,
header > nav a[aria-current="page"],
header > nav a[aria-current="true"] {
  border-color: var(--accent);
  color: var(--accent);
  cursor: pointer;
}

/* Reduce nav side on mobile */
@media only screen and (max-width: 720px) {
  header > nav a {
    border: none;
    padding: 0;
    text-decoration: underline;
    line-height: 1;
  }
}

/* Consolidate box styling */
aside,
details,
/* pre, */
progress {
  background-color: var(--accent-bg);
  border: 1px solid var(--border);
  border-radius: var(--standard-border-radius);
  margin-bottom: 1rem;
}

pre {
  border-radius: var(--standard-border-radius);
  background-color: #f9f9f9 !important;
}

aside {
  font-size: 1rem;
  width: 30%;
  padding: 0 15px;
  margin-inline-start: 15px;
  float: right;
}
*[dir="rtl"] aside {
  float: left;
}

/* Make aside full-width on mobile */
@media only screen and (max-width: 720px) {
  aside {
    width: 100%;
    float: none;
    margin-inline-start: 0;
  }
}

article, fieldset, dialog {
  border: 1px solid var(--border);
  padding: 1rem;
  border-radius: var(--standard-border-radius);
  margin-bottom: 1rem;
}

article h2:first-child,
section h2:first-child,
article h3:first-child,
section h3:first-child {
  margin-top: 1rem;
}

section {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 2rem 1rem;
  margin: 3rem 0;
}

/* Don't double separators when chaining sections */
section + section,
section:first-child {
  border-top: 0;
  padding-top: 0;
}

section + section {
  margin-top: 0;
}

section:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

details {
  padding: 0.7rem 1rem;
}

summary {
  cursor: pointer;
  font-weight: bold;
  padding: 0.7rem 1rem;
  margin: -0.7rem -1rem;
  word-break: break-all;
}

details[open] > summary + * {
  margin-top: 0;
}

details[open] > summary {
  margin-bottom: 0.5rem;
}

details[open] > :last-child {
  margin-bottom: 0;
}

/* Format tables */
table {
  border-collapse: collapse;
  margin: 1.5rem 0;
}

figure > table {
  width: max-content;
  margin: 0;
}

td,
th {
  border: 1px solid var(--border);
  text-align: start;
  padding: 0.5rem;
}

th {
  background-color: var(--accent-bg);
  font-weight: bold;
}

tr:nth-child(even) {
  /* Set every other cell slightly darker. Improves readability. */
  background-color: var(--accent-bg);
}

table caption {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

/* Format forms */
textarea,
select,
input,
button,
.button {
  font-size: inherit;
  font-family: inherit;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: var(--standard-border-radius);
  box-shadow: none;
  max-width: 100%;
  display: inline-block;
}
textarea,
select,
input {
  color: var(--text);
  background-color: var(--bg);
  border: 1px solid var(--border);
}
label {
  /* display: block; */
  margin-right: 4px;
}
textarea:not([cols]) {
  width: 100%;
}

/* Add arrow to drop-down */
select:not([multiple]) {
  background-image:
    linear-gradient(45deg, transparent 49%, var(--text) 51%),
    linear-gradient(135deg, var(--text) 51%, transparent 49%);
  background-position:
    calc(100% - 15px),
    calc(100% - 10px);
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
  padding-inline-end: 25px;
}
*[dir="rtl"] select:not([multiple]) {
  background-position: 10px, 15px;
}

/* checkbox and radio button style */
input[type="checkbox"],
input[type="radio"] {
  vertical-align: middle;
  position: relative;
  width: min-content;
}

input[type="checkbox"] + label,
input[type="radio"] + label {
  display: inline-block;
}

input[type="radio"] {
  border-radius: 100%;
}

input[type="checkbox"]:checked,
input[type="radio"]:checked {
  background-color: var(--accent);
}

input[type="checkbox"]:checked::after {
  /* Creates a rectangle with colored right and bottom borders which is rotated to look like a check mark */
  content: " ";
  width: 0.18em;
  height: 0.32em;
  border-radius: 0;
  position: absolute;
  top: 0.05em;
  left: 0.17em;
  background-color: transparent;
  border-right: solid var(--bg) 0.08em;
  border-bottom: solid var(--bg) 0.08em;
  font-size: 1.8em;
  transform: rotate(45deg);
}
input[type="radio"]:checked::after {
  /* creates a colored circle for the checked radio button  */
  content: " ";
  width: 0.25em;
  height: 0.25em;
  border-radius: 100%;
  position: absolute;
  top: 0.125em;
  background-color: var(--bg);
  left: 0.125em;
  font-size: 32px;
}

/* Makes input fields wider on smaller screens */
@media only screen and (max-width: 720px) {
  textarea,
  select,
  input {
    width: 100%;
  }
}

/* Set a height for color input */
input[type="color"] {
  height: 2.5rem;
  padding: 0.2rem;
}

/* do not show border around file selector button */
input[type="file"] {
  border: 0;
}

/* Misc body elements */
hr {
  border: none;
  height: 1px;
  background: var(--border);
  margin: 1rem auto;
}

mark {
  padding: 2px 5px;
  border-radius: var(--standard-border-radius);
  background-color: var(--marked);
  color: black;
}

mark a {
  color: #0d47a1;
}

img,
video {
  max-width: 100%;
  height: auto;
  border-radius: var(--standard-border-radius);
}

figure {
  margin: 0;
  display: block;
  overflow-x: auto;
}

figure > img,
figure > picture > img {
  display: block;
  margin-inline: auto;
}

figcaption {
  /* text-align: center; */
  font-size: 0.9rem;
  color: var(--text-light);
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}

blockquote {
  margin-inline-start: 2rem;
  margin-inline-end: 0;
  margin-block: 2rem;
  padding: 0.4rem 0.8rem;
  border-inline-start: 0.35rem solid var(--accent);
  color: var(--text-light);
  font-style: italic;
}

cite {
  font-size: 0.9rem;
  color: var(--text-light);
  font-style: normal;
}

dt {
  color: var(--text-light);
}

/* Use mono font for code elements */
code,
pre,
pre span,
kbd,
samp {
  font-family: var(--mono-font);
  color: var(--code);
}

kbd {
  color: var(--preformatted);
  border: 1px solid var(--preformatted);
  border-bottom: 3px solid var(--preformatted);
  border-radius: var(--standard-border-radius);
  padding: 0.1rem 0.4rem;
}

pre {
  padding: 1rem 1.4rem;
  max-width: 100%;
  overflow: auto;
  color: var(--preformatted);
}

/* Fix embedded code within pre */
pre code {
  color: var(--preformatted);
  background: none;
  margin: 0;
  padding: 0;
}

/* Progress bars */
/* Declarations are repeated because you */
/* cannot combine vendor-specific selectors */
progress {
  width: 100%;
}

progress:indeterminate {
  background-color: var(--accent-bg);
}

progress::-webkit-progress-bar {
  border-radius: var(--standard-border-radius);
  background-color: var(--accent-bg);
}

progress::-webkit-progress-value {
  border-radius: var(--standard-border-radius);
  background-color: var(--accent);
}

progress::-moz-progress-bar {
  border-radius: var(--standard-border-radius);
  background-color: var(--accent);
  transition-property: width;
  transition-duration: 0.3s;
}

progress:indeterminate::-moz-progress-bar {
  background-color: var(--accent-bg);
}

dialog {
  background-color: var(--bg);
  max-width: 40rem;
  margin: auto;
}

dialog::backdrop {
  background-color: var(--bg);
  opacity: 0.8;
}

@media only screen and (max-width: 720px) {
  dialog {
    max-width: 100%;
    margin: auto 1em;
  }
}

/* Superscript & Subscript */
/* Prevent scripts from affecting line-height. */
sup, sub {
  vertical-align: baseline;
  position: relative;
}

sup {
  top: -0.4em;
}

sub {
  top: 0.3em;
}

/* Classes for notices */
.notice {
  background: var(--accent-bg);
  border: 2px solid var(--border);
  border-radius: var(--standard-border-radius);
  padding: 1.5rem;
  margin: 2rem 0;
}
`;

  const highlightThemeCss = `/*
  Theme: GitHub
  Description: Light theme as seen on github.com
  Author: github.com
  Maintainer: @Hirse
  Updated: 2021-05-15

  Outdated base version: https://github.com/primer/github-syntax-light
  Current colors taken from GitHub's CSS
*/

.hljs {
    color: #24292e;
    background: #ffffff;
}

.hljs-doctag,
.hljs-keyword,
.hljs-meta .hljs-keyword,
.hljs-template-tag,
.hljs-template-variable,
.hljs-type,
.hljs-variable.language_ {
    /* prettylights-syntax-keyword */
    color: #d73a49;
}

.hljs-title,
.hljs-title.class_,
.hljs-title.class_.inherited__,
.hljs-title.function_ {
    /* prettylights-syntax-entity */
    color: #6f42c1;
}

.hljs-attr,
.hljs-attribute,
.hljs-literal,
.hljs-meta,
.hljs-number,
.hljs-operator,
.hljs-variable,
.hljs-selector-attr,
.hljs-selector-class,
.hljs-selector-id {
    /* prettylights-syntax-constant */
    color: #005cc5;
}

.hljs-regexp,
.hljs-string,
.hljs-meta .hljs-string {
    /* prettylights-syntax-string */
    color: #032f62;
}

.hljs-built_in,
.hljs-symbol {
    /* prettylights-syntax-variable */
    color: #e36209;
}

.hljs-comment,
.hljs-code,
.hljs-formula {
    /* prettylights-syntax-comment */
    color: #6a737d;
}

.hljs-name,
.hljs-quote,
.hljs-selector-tag,
.hljs-selector-pseudo {
    /* prettylights-syntax-entity-tag */
    color: #22863a;
}

.hljs-subst {
    /* prettylights-syntax-storage-modifier-import */
    color: #24292e;
}

.hljs-section {
    /* prettylights-syntax-markup-heading */
    color: #005cc5;
    font-weight: bold;
}

.hljs-bullet {
    /* prettylights-syntax-markup-list */
    color: #735c0f;
}

.hljs-emphasis {
    /* prettylights-syntax-markup-italic */
    color: #24292e;
    font-style: italic;
}

.hljs-strong {
    /* prettylights-syntax-markup-bold */
    color: #24292e;
    font-weight: bold;
}

.hljs-addition {
    /* prettylights-syntax-markup-inserted */
    color: #22863a;
    background-color: #f0fff4;
}

.hljs-deletion {
    /* prettylights-syntax-markup-deleted */
    color: #b31d28;
    background-color: #ffeef0;
}
/* 
.hljs-char.escape_,
.hljs-link,
.hljs-params,
.hljs-property,
.hljs-punctuation,
.hljs-tag {

} */
`;

  const appHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <!-- <link rel="icon" href="%sveltekit.assets%/favicon.png" /> -->
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
`;

  const appDTs = `// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
`;

  const pageSvelte = `<script lang="ts">
  import Chart from "../components/Chart.svelte";
  import Select from "../components/Select.svelte";
  import Radio from "../components/Radio.svelte";
  import getTempChange from "../helpers/getTempChange.ts";
  import Table from "../components/Table.svelte";
  import CodeHighlight from "../components/CodeHighlight.svelte";
  import Highlight from "../components/Highlight.svelte";

  // Data included in the build.
  import tempRegr from "../data/temp-regressions.json";
  import type { tempT } from "$lib";

  // Data fetched by the server/client from +page.js
  const { data }: { data: { temp: tempT } } = $props();
  const { temp } = data;

  let city = $state("Montreal");
  const cities = tempRegr.map((d) => d.city);

  let testRadioInput = $state("option1");
</script>

<h2>Climate change</h2>

<Select bind:value={city} options={cities} label="Pick a city:" />

<p>
  On average, the temperature in <b>{city}</b> has increased by {getTempChange(
    city,
    tempRegr,
  )} per decade.
</p>

<Chart {city} {temp} {tempRegr} />

<p>Here's all the data.</p>

<Table data={temp.filter((d) => d.city === city)} />

<h2>Methodology</h2>

<p>
  This project uses a simple linear regression to estimate the temperature
  change in each city. The data comes from the Adjusted and Homogenized
  Canadian Climate Data (AHCCD) dataset.
</p>

<p>
  To compute the regressions, we used the <a
    href="https://github.com/nshiab/simple-data-analysis"
    >simple-data-analysis</a
  > library.
</p>

<CodeHighlight
  filename="crunchData.ts"
  code={\`import type { SimpleDB } from "@nshiab/simple-data-analysis";

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

  // We write the results to src/data
  await tempRegressions.writeData("src/data/temp-regressions.json");
  // Or to static
  await temp.writeData("static/temp.json");
}
\`}
  />

<h2>Other components</h2>

<p>
  There is a component to easily <Highlight
    text="highlight text"
    background="orange"
    color="white"
  />.
</p>

<p>
  And there is also a component for radio buttons (<b>{testRadioInput}</b> is selected)
</p>

<Radio
  bind:value={testRadioInput}
  values={["option1", "option2", "option3"]}
  label="Pick an option:"
  name="radioButtonsOptions"
/>
`;

  const pageJs = `export async function load({ fetch }) {
  const res = await fetch("/temp.json");
  const temp = await res.json();

  return { temp };
}`;

  const layoutTs = `export const prerender = true;`;

  const layoutSvelte = `<script>
  let { children } = $props();
</script>

<svelte:head>
  <link rel="stylesheet" href="./style.css" />
  <link rel="stylesheet" href="./highlight-theme.css" />
</svelte:head>

<header>
  <nav>
    <a href="https://github.com/nshiab/simple-data-analysis">Home</a>
    <a href="https://www.naelshiab.com/">Contact</a>
  </nav>
  <h1>My new project</h1>
  <p>The content below is just an example.</p>
</header>

<main>
  {@render children()}
</main>

<footer>
  <p>
    This page has been created with <a
      href="https://github.com/nshiab/setup-sda">setup-sda</a
    >.
  </p>
</footer>
`;

  const libIndexTs =
    `// place files you want to import through the \`$lib\` alias in this folder.

type cityT = string;

type tempT = { city: string; decade: number; meanTemp: number }[];

type tempRegrT = {
    city: string;
    slope: number;
    yIntercept: number;
    r2: number;
}[];

export type { cityT, tempRegrT, tempT };`;

  const getTempChangeTs =
    `// It's important to use the 'web' entrypoint since this is running in the browser.
import { formatNumber } from "@nshiab/journalism/web";
import type { tempRegrT } from "../lib/index.ts";

export default function getTempChange(
  city: string,
  tempRegr: tempRegrT,
): string {
  const cityRegression = tempRegr.find((r) => r.city === city);

  if (cityRegression === undefined) {
    throw new Error(\`City \${city} not found in tempRegr.\`);
  }

  const slopPerDecade = cityRegression.slope * 10;

  return formatNumber(slopPerDecade, { decimals: 3, suffix: "°C" });
}
`;

  const tableSvelte = `<script lang="ts">
    let { data }: { data: { [key: string]: unknown }[] } = $props();
    let columns = ["row", ...Object.keys(data[0])];

    let startRow = $state(0);
    let endRow = $state(4);
    let rows = $derived(
        data
            .map((row, i) => [i, ...Object.values(row)])
            .slice(startRow, endRow + 1),
    );
</script>

{#if data.length > 5}
    <div style="display:flex; flex-wrap: wrap; gap: 10px; font-size: small;">
        <div style="display: flex; align-items:center;">
            <label for="startRow">Start item:</label>
            <input
                type="number"
                bind:value={startRow}
                min="0"
                max={data.length}
                style="margin: 0;"
            />
        </div>
        <div style="display: flex; align-items:center;">
            <label for="endRow">End item:</label>
            <input
                type="number"
                bind:value={endRow}
                min="0"
                max={data.length}
                style="margin: 0;"
            />
        </div>
    </div>
{/if}

<figure
    style={data.length >= 5
        ? "margin-top: 0.75rem; margin-bottom: 0.50rem"
        : ""}
>
    <table style="margin: 0;">
        <thead>
            <tr>
                {#each columns as column}
                    <th>{column}</th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each rows as row}
                <tr>
                    {#each row as cell}
                        <td>{cell}</td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</figure>

{#if data.length > 5}
    <p style="margin-top: 0rem; margin-bottom: 1rem; font-size: small;">
        Displaying {Math.max(0, endRow + 1 - startRow)} items out of {data.length}.
    </p>
{/if}`;

  const selectSvelte = `<script lang="ts">
    let {
        value = $bindable(),
        options,
        label,
        id,
    }: {
        value: string;
        options: string[];
        label: string;
        id?: string;
    } = $props();
</script>

<label for={id}>{label}</label>
<select {id} name={id} bind:value>
    {#each options as opt}
        <option value={opt}>{opt}</option>
    {/each}
</select>
`;

  const radioSvelte = `<script lang="ts">
    let {
        value = $bindable(),
        values,
        label,
        name,
    }: {
        value: string;
        values: string[];
        label: string;
        name?: string;
    } = $props();
</script>

<div style="display: flex; align-items: center; gap: 20px;">
    <p style="margin: 0;">{label}</p>
    {#each values as val, i}
        <label for={\`\${name}-\${i}\`} style="transform: translateY(2px);">
            <input
                type="radio"
                {name}
                id={\`\${name}-\${i}\`}
                value={val}
                bind:group={value}
            />
            {val}</label
        >
    {/each}
</div>
`;

  const CodeHighlightSvelte = `<script lang="ts">
    import hljs from "highlight.js/lib/core";
    import typescript from "highlight.js/lib/languages/typescript";

    let { code, filename }: { code: string; filename: string } = $props();

    hljs.registerLanguage("typescript", typescript);

    function addCode(node: Element, code: string) {
        node.innerHTML =
            "\\n" +
            hljs
                .highlight(code, {
                    language: "typescript",
                })
                .value.trim();
    }
</script>

<div style="position: relative; font-size: 0.9rem;">
    <p
        style="position:absolute; top: 0px; margin:0; border-radius: 5px 5px 0 0; padding: 0.25rem 1.5rem; background-color: #e6e6e6; width: 100%; font-family: var(--mono-font); display: flex; justify-content: space-between; align-items: center;"
    >
        {filename}
        <button
            onclick={() => navigator.clipboard.writeText(code)}
            style="background: none; border: none; cursor: pointer; font-size: 1rem; margin: 0;"
            aria-label="Copy to clipboard"
        >
            <svg
                width="17"
                height="17"
                viewBox="0 0 15 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                    d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.25C11 2.66421 10.6642 3 10.25 3H4.75C4.33579 3 4 2.66421 4 2.25V2H3.5C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H11Z"
                    fill="black"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                ></path></svg
            >
        </button>
    </p>
    <pre style="padding-top: 2.5rem;"><code
            class="language-typescript"
            use:addCode={code}></code></pre>
</div>
`;

  const highlightSvelte = `<script lang="ts">
    let { text, background, color } = $props();
</script>

<span
    style={\`background-color: \${background}; color: \${color}; padding: 1px 5px; border-radius: 4px; font-weight: 600;\`}
>
    {text}
</span>`;

  const chartSvelte = `<script lang="ts">
    import type { cityT, tempRegrT, tempT } from "$lib";
    import { dot, line, plot } from "@observablehq/plot";

    let {
        city,
        temp,
        tempRegr,
    }: {
        city: cityT;
        temp: tempT;
        tempRegr: tempRegrT;
    } = $props();

    let width = $state(0);

    function makeChart(
        node: Element,
        params: {
            city: cityT;
            temp: tempT;
            tempRegr: tempRegrT;
            width: number;
        },
    ) {
        const { city, temp, tempRegr } = params;

        const tempCity = temp.filter((t) => t.city === city);

        // We create x and y coordinates to draw a line based on the linear regression.
        const regressionCity = tempRegr.find((r) => r.city === city);
        if (regressionCity === undefined) {
            throw new Error(\`City \${city} not found in tempRegr.\`);
        }
        const x1 = tempCity[0].decade;
        const x2 = tempCity[tempCity.length - 1].decade;
        const y1 = regressionCity.yIntercept + x1 * regressionCity.slope;
        const y2 = regressionCity.yIntercept + x2 * regressionCity.slope;
        const regressionLine = [
            { decade: x1, meanTemp: y1 },
            { decade: x2, meanTemp: y2 },
        ];

        const caption = \`Mean temperature per decade in \${city}. Linear regression: y = \${regressionCity.slope}x + \${regressionCity.yIntercept}, R² = \${regressionCity.r2}\`;

        const chart = plot({
            width,
            x: { label: "Time", tickFormat: (d) => String(d) },
            y: {
                label: "Temperature",
                tickFormat: (d) => \`\${d}°C\`,
                ticks: 5,
            },
            inset: 20,
            grid: true,
            marks: [
                line(regressionLine, {
                    x: "decade",
                    y: "meanTemp",
                    stroke: "black",
                    strokeDasharray: "4,4",
                }),
                dot(tempCity, {
                    x: "decade",
                    y: "meanTemp",
                    fill: "orange",
                    r: 5,
                }),
            ],
            caption,
        });

        node.appendChild(chart);
    }
</script>

{#key [city, width]}
    <div
        style="width: 100%;"
        bind:clientWidth={width}
        use:makeChart={{ city, temp, tempRegr, width }}
    ></div>
{/key}`;

  console.log("\n2 - Creating relevant files...");
  if (existsSync("README.md")) {
    console.log("    => README.md already exists.");
  } else {
    writeFileSync("README.md", readme);
    console.log("    => README.md has been created.");
  }

  if (runtime === "bun") {
    packageJson.scripts.sda = "bun --watch sda/main.ts";
  }

  if (runtime === "deno") {
    if (existsSync("deno.json")) {
      console.log("    => deno.json already exists.");
      const currentDenoJson = JSON.parse(
        readFileSync("deno.json", "utf-8"),
      );
      currentDenoJson.tasks = {
        ...currentDenoJson.tasks,
        ...denoJson.tasks,
      };
      currentDenoJson.nodeModulesDir = "auto";
      currentDenoJson.compilerOptions = {
        "lib": ["dom", "deno.ns"],
      };
      currentDenoJson.unstable = [
        "fmt-component",
      ];
      writeFileSync("deno.json", JSON.stringify(currentDenoJson, null, 2));
      console.log("    => deno.json has been updated.");
    } else {
      writeFileSync("deno.json", JSON.stringify(denoJson, null, 2));
      console.log("    => deno.json has been created.");
    }
  } else {
    if (existsSync("package.json")) {
      console.log("    => package.json already exists.");
      const currentPackageJson = JSON.parse(
        readFileSync("package.json", "utf-8"),
      );
      currentPackageJson.scripts = {
        ...currentPackageJson.scripts,
        ...packageJson.scripts,
      };
      writeFileSync(
        "package.json",
        JSON.stringify(currentPackageJson, null, 2),
      );
      console.log("    => package.json has been updated.");
    } else {
      writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
      console.log("    => package.json has been created.");
    }
  }

  if (existsSync("vite.config.ts")) {
    console.log("    => vite.config.ts already exists.");
  } else {
    writeFileSync("vite.config.ts", viteConfigTs);
    console.log("    => vite.config.ts has been created.");
  }

  if (existsSync("tsconfig.json")) {
    console.log("    => tsconfig.json already exists.");
  } else {
    writeFileSync("tsconfig.json", tsconfigJson);
    console.log("    => tsconfig.json has been created.");
  }

  if (existsSync("svelte.config.js")) {
    console.log("    => svelte.config.js already exists.");
  } else {
    writeFileSync("svelte.config.js", svelteConfigJs);
    console.log("    => svelte.config.js has been created.");
  }

  if (existsSync(".gitignore")) {
    console.log("    => .gitignore already exists.");
  } else {
    writeFileSync(".gitignore", gitignore);
    console.log("    => .gitignore has been created.");
  }

  if (existsSync("static")) {
    console.log("    => static/ already exists.");
  } else {
    mkdirSync("static");

    writeFileSync("static/style.css", styleCss);
    console.log("    => static/style.css has been created.");

    writeFileSync("static/highlight-theme.css", highlightThemeCss);
    console.log("    => static/highlight-theme.css has been created.");

    writeFileSync("static/temp.json", tempJSON);
    console.log("    => static/temp.json has been created.");
  }

  if (existsSync("src")) {
    console.log("    => src/ already exists.");
  } else {
    mkdirSync("src");

    writeFileSync("src/app.html", appHtml);
    console.log("    => src/app.html has been created.");

    writeFileSync("src/app.d.ts", appDTs);
    console.log("    => src/app.d.ts has been created.");

    mkdirSync("src/routes");

    writeFileSync("src/routes/+page.svelte", pageSvelte);
    console.log("    => src/routes/+page.svelte has been created.");

    writeFileSync("src/routes/+page.js", pageJs);
    console.log("    => src/routes/+page.js has been created.");

    writeFileSync("src/routes/+layout.ts", layoutTs);
    console.log("    => src/routes/+layout.ts has been created.");

    writeFileSync("src/routes/+layout.svelte", layoutSvelte);
    console.log("    => src/routes/+layout.svelte has been created.");

    mkdirSync("src/lib");

    writeFileSync("src/lib/index.ts", libIndexTs);
    console.log("    => src/lib/index.ts has been created.");

    mkdirSync("src/helpers");

    writeFileSync("src/helpers/getTempChange.ts", getTempChangeTs);
    console.log("    => src/helpers/getTempChange.ts has been created.");

    mkdirSync("src/components");

    writeFileSync("src/components/Table.svelte", tableSvelte);
    console.log("    => src/components/Table.svelte has been created.");

    writeFileSync("src/components/Select.svelte", selectSvelte);
    console.log("    => src/components/Select.svelte has been created.");

    writeFileSync("src/components/Radio.svelte", radioSvelte);
    console.log("    => src/components/Radio.svelte has been created.");

    writeFileSync("src/components/CodeHighlight.svelte", CodeHighlightSvelte);
    console.log("    => src/components/CodeHighlight.svelte has been created.");

    writeFileSync("src/components/Highlight.svelte", highlightSvelte);
    console.log("    => src/components/Highlight.svelte has been created.");

    writeFileSync("src/components/Chart.svelte", chartSvelte);
    console.log("    => src/components/Chart.svelte has been created.");

    mkdirSync("src/data");

    writeFileSync("src/data/temp-regressions.json", tempRegressionsJSON);
    console.log("    => src/data/temp-regressions.json has been created.");
  }

  if (existsSync("sda")) {
    console.log("    => sda/ already exists.");
  } else {
    mkdirSync("sda");

    writeFileSync("sda/main.ts", mainTs);
    console.log("    => sda/main.ts has been created.");

    mkdirSync("sda/helpers");

    writeFileSync("sda/helpers/crunchData.ts", crunchDataTs);
    console.log("    => sda/helpers/crunchData.ts has been created.");

    mkdirSync("sda/data");

    writeFileSync("sda/data/temp.csv", tempCsv);
    console.log("    => sda/data/temp.csv has been created.");
  }

  if (runtime === "nodejs") {
    console.log("\n3 - Installing libraries with NPM...");

    execSync("npm i @sveltejs/adapter-auto  --save-dev", {
      stdio: "ignore",
    });
    console.log("    => @sveltejs/adapter-auto has been installed from NPM.");

    execSync("npm i @sveltejs/adapter-static  --save-dev", {
      stdio: "ignore",
    });
    console.log("    => @sveltejs/adapter-static has been installed from NPM.");

    execSync("npm i @sveltejs/kit  --save-dev", {
      stdio: "ignore",
    });
    console.log("    => @sveltejs/kit has been installed from NPM.");

    execSync("npm i @sveltejs/vite-plugin-svelte  --save-dev", {
      stdio: "ignore",
    });
    console.log(
      "    => @sveltejs/vite-plugin-svelte has been installed from NPM.",
    );

    execSync("npm i svelte  --save-dev", {
      stdio: "ignore",
    });
    console.log("    => svelte has been installed from NPM.");

    execSync("npm i svelte-check  --save-dev", {
      stdio: "ignore",
    });
    console.log("    => svelte-check has been installed from NPM.");

    execSync("npm i typescript  --save-dev", {
      stdio: "ignore",
    });
    console.log("    => typescript has been installed from NPM.");

    execSync("npm i vite  --save-dev", {
      stdio: "ignore",
    });
    console.log("    => vite has been installed from NPM.");

    execSync("npm i highlight.js", {
      stdio: "ignore",
    });
    console.log("    => highlight.js has been installed from NPM.");

    execSync("npm i @observablehq/plot", {
      stdio: "ignore",
    });
    console.log("    => @observablehq/plot has been installed from NPM.");

    execSync("npx jsr add @nshiab/simple-data-analysis", {
      stdio: "ignore",
    });
    console.log("    => simple-data-analysis has been installed from JSR.");

    execSync("npx jsr add @nshiab/journalism", {
      stdio: "ignore",
    });
    console.log("    => journalism has been installed from JSR.");
  } else if (runtime === "bun") {
    console.log("\n3 - Installing libraries with Bun...");

    execSync("bun add @sveltejs/adapter-auto --dev", {
      stdio: "ignore",
    });
    console.log("    => @sveltejs/adapter-auto has been installed from NPM.");

    execSync("bun add @sveltejs/adapter-static --dev", {
      stdio: "ignore",
    });
    console.log("    => @sveltejs/adapter-static has been installed from NPM.");

    execSync("bun add @sveltejs/kit --dev", {
      stdio: "ignore",
    });
    console.log("    => @sveltejs/kit has been installed from NPM.");

    execSync("bun add @sveltejs/vite-plugin-svelte --dev", {
      stdio: "ignore",
    });
    console.log(
      "    => @sveltejs/vite-plugin-svelte has been installed from NPM.",
    );

    execSync("bun add svelte --dev", {
      stdio: "ignore",
    });
    console.log("    => svelte has been installed from NPM.");

    execSync("bun add svelte-check --dev", {
      stdio: "ignore",
    });
    console.log("    => svelte-check has been installed from NPM.");

    execSync("bun add typescript --dev", {
      stdio: "ignore",
    });
    console.log("    => typescript has been installed from NPM.");

    execSync("bun add vite --dev", {
      stdio: "ignore",
    });
    console.log("    => vite has been installed from NPM.");

    execSync("bun add highlight.js", {
      stdio: "ignore",
    });
    console.log("    => highlight.js has been installed from NPM.");

    execSync("bun add @observablehq/plot", {
      stdio: "ignore",
    });
    console.log("    => @observablehq/plot has been installed from NPM.");

    execSync("bunx jsr add @nshiab/simple-data-analysis", {
      stdio: "ignore",
    });
    console.log("    => simple-data-analysis has been installed from JSR.");

    execSync("bunx jsr add @nshiab/journalism", {
      stdio: "ignore",
    });
    console.log("    => journalism has been installed from JSR.");
  } else if (runtime === "deno") {
    console.log("\n3 - Installing libraries with Deno...");

    execSync(
      "deno install --node-modules-dir=auto --dev --allow-scripts=npm:@sveltejs/kit npm:@sveltejs/adapter-auto",
      {
        stdio: "ignore",
      },
    );
    console.log("    => @sveltejs/adapter-auto has been installed from NPM.");

    execSync(
      "deno install --node-modules-dir=auto --dev npm:@sveltejs/adapter-static",
      {
        stdio: "ignore",
      },
    );
    console.log("    => @sveltejs/adapter-static has been installed from NPM.");

    execSync("deno install --node-modules-dir=auto --dev npm:@sveltejs/kit", {
      stdio: "ignore",
    });
    console.log("    => @sveltejs/kit has been installed from NPM.");

    execSync(
      "deno install --node-modules-dir=auto --dev npm:@sveltejs/vite-plugin-svelte",
      {
        stdio: "ignore",
      },
    );
    console.log(
      "    => @sveltejs/vite-plugin-svelte has been installed from NPM.",
    );

    execSync("deno install --node-modules-dir=auto --dev npm:svelte", {
      stdio: "ignore",
    });
    console.log("    => svelte has been installed from NPM.");

    execSync("deno install --node-modules-dir=auto --dev npm:svelte-check", {
      stdio: "ignore",
    });
    console.log("    => svelte-check has been installed from NPM.");

    execSync("deno install --node-modules-dir=auto --dev npm:typescript", {
      stdio: "ignore",
    });
    console.log("    => typescript has been installed from NPM.");

    execSync("deno install --node-modules-dir=auto --dev npm:vite", {
      stdio: "ignore",
    });
    console.log("    => vite has been installed from NPM.");

    execSync("deno install --node-modules-dir=auto npm:highlight.js", {
      stdio: "ignore",
    });
    console.log("    => highlight.js has been installed from NPM.");

    execSync("deno install --node-modules-dir=auto npm:@observablehq/plot", {
      stdio: "ignore",
    });
    console.log("    => @observablehq/plot has been installed from NPM.");

    writeFileSync(".npmrc", "@jsr:registry=https://npm.jsr.io");
    const packageJson = {
      "type": "module",
      "dependencies": {
        "@nshiab/journalism": "npm:@jsr/nshiab__journalism@^1.21.10",
        "@nshiab/simple-data-analysis":
          "npm:@jsr/nshiab__simple-data-analysis@^4.0.1",
      },
    };
    writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
    execSync(
      "deno install --node-modules-dir=auto --allow-scripts=npm:playwright-chromium@1.50.0",
      {
        stdio: "ignore",
      },
    );
    console.log(
      "    => simple-data-analysis has been installed from JSR (with a package.json).",
    );
    console.log(
      "    => journalism has been installed from JSR (with a package.json).",
    );
  }

  if (args.includes("--git")) {
    console.log("\n4 - Initializing Git repository...");
    execSync("git init && git add -A && git commit -m 'Setup done'", {
      stdio: "ignore",
    });
    console.log("    => First commit done");
  }

  console.log("\nSetup is done!\n");

  if (runtime === "nodejs") {
    console.log("    => Run 'npm run sda' to watch sda/main.ts.");
    console.log(
      "    => Run 'npm run dev' to start a local server.",
    );
  } else if (runtime === "bun") {
    console.log("    => Run 'bun run sda' to watch sda/main.ts.");
    console.log(
      "    => Run 'bun run dev' to start a local server.",
    );
  } else if (runtime === "deno") {
    console.log("    => Run 'deno task sda' to watch sda/main.ts.");
    console.log(
      "    => Run 'deno task dev' to start a local server.",
    );
  }

  console.log("\nCheck the README.md and have fun. ^_^\n");
} else if (args.includes("--example")) {
  console.log(`    => You passed the option --example.`);
  const readme =
    `This repository has been created with [setup-sda](https://github.com/nshiab/setup-sda/).

It's using [simple-data-analysis](https://github.com/nshiab/simple-data-analysis) and [journalism](https://github.com/nshiab/journalism).

Here's the recommended workflow:

- Put your raw data in the \`sda/data\` folder. Note that this folder is gitignored.
- Use the \`sda/main.ts\` file to clean and process your raw data. Write the results to the \`sda/output\` folder.

When working on your project, use the following command:

- \`npm run sda\` will watch your \`sda/main.ts\` and its dependencies. Everytime you'll save some changes, the data will be reprocessed.
`;

  const tsconfigContent = `{
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

  const packageJson = {
    type: "module",
    scripts: {
      sda: "node --experimental-strip-types --no-warnings --watch sda/main.ts",
      clean: "rm -rf .sda-cache && rm -rf .temp",
    },
  };

  const denoJson = {
    tasks: {
      sda: "deno run --node-modules-dir=auto -A --watch --check sda/main.ts",
      clean: "rm -rf .sda-cache && rm -rf .temp",
    },
    nodeModulesDir: "auto",
  };

  const mainTs = `import { SimpleDB } from "@nshiab/simple-data-analysis";
import crunchData from "./helpers/crunchData.ts";

const sdb = new SimpleDB({ logDuration: true});

await crunchData(sdb);

await sdb.done();

`;

  const crunchData =
    `import type { SimpleDB } from "@nshiab/simple-data-analysis";

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
    formatY: (d) => \`\${d}°C\`,
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

  const data = `city,decade,meanTemp
Toronto,1840.0,7.1
Toronto,1850.0,6.4
Toronto,1860.0,6.9
Toronto,1870.0,6.8
Montreal,1880.0,5.3
Toronto,1880.0,6.6
Montreal,1890.0,6.0
Toronto,1890.0,7.6
Montreal,1900.0,5.8
Toronto,1900.0,7.7
Montreal,1910.0,6.1
Toronto,1910.0,8.1
Montreal,1920.0,6.2
Toronto,1920.0,8.0
Montreal,1930.0,6.8
Toronto,1930.0,8.6
Montreal,1940.0,6.9
Toronto,1940.0,8.7
Montreal,1950.0,7.4
Toronto,1950.0,9.2
Montreal,1960.0,7.4
Toronto,1960.0,8.8
Montreal,1970.0,7.3
Toronto,1970.0,9.0
Montreal,1980.0,7.7
Toronto,1980.0,9.0
Toronto,1990.0,9.6
Montreal,2000.0,7.6
Toronto,2000.0,9.7
Montreal,2010.0,8.0
Toronto,2010.0,9.9
`;

  console.log("\n2 - Creating relevant files...");

  if (runtime === "nodejs") {
    if (existsSync("package.json")) {
      console.log("    => package.json already exists.");
    } else {
      writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
      console.log("    => package.json has been created.");
    }

    if (existsSync("tsconfig.json")) {
      console.log("    => tsconfig.json already exists.");
    } else {
      writeFileSync("tsconfig.json", tsconfigContent);
      console.log("    => tsconfig.json has been created.");
    }
  } else if (runtime === "bun") {
    packageJson.scripts = {
      sda: "bun --watch sda/main.ts",
    };

    if (existsSync("package.json")) {
      console.log("    => package.json already exists.");
    } else {
      writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
      console.log("    => package.json has been created.");
    }

    if (existsSync("tsconfig.json")) {
      console.log("    => tsconfig.json already exists.");
    } else {
      writeFileSync("tsconfig.json", tsconfigContent);
      console.log("    => tsconfig.json has been created.");
    }
  } else if (runtime === "deno") {
    if (existsSync("deno.json")) {
      console.log("    => deno.json already exists.");
    } else {
      writeFileSync("deno.json", JSON.stringify(denoJson, null, 2));
      console.log("    => deno.json has been created.");
    }
  }

  if (existsSync(".gitignore")) {
    console.log("    => .gitignore already exists.");
  } else {
    writeFileSync(
      ".gitignore",
      "node_modules\n.temp\n.sda-cache\ndata\n.DS_Store",
    );
    console.log("    => .gitignore has been created.");
  }

  if (existsSync("sda")) {
    console.log("    => sda/ already exists.");
  } else {
    mkdirSync("sda");
    writeFileSync(
      "sda/main.ts",
      mainTs,
    );
    console.log("    => sda/main.ts has been created.");

    mkdirSync("sda/helpers");
    writeFileSync(
      "sda/helpers/crunchData.ts",
      crunchData,
    );
    console.log("    => sda/helpers/crunchData.ts has been created.");

    mkdirSync("sda/data");
    writeFileSync("sda/data/temp.csv", data);
    console.log("    => sda/data/temp.csv has been created.");
    mkdirSync("sda/output");
    console.log("    => sda/output/ has been created.");
  }

  if (existsSync("README.md")) {
    console.log("    => README.md already exists.");
  } else {
    writeFileSync("README.md", readme);
    console.log("    => README.md has been created.");
  }

  if (runtime === "nodejs") {
    console.log("\n3 - Installing libraries...");
    execSync("npx jsr add @nshiab/simple-data-analysis", {
      stdio: "ignore",
    });
    console.log("    => simple-data-analysis has been installed from JSR.");
    execSync("npx jsr add @nshiab/journalism", {
      stdio: "ignore",
    });
    console.log("    => journalism has been installed from JSR.");
    execSync("npm i @observablehq/plot", {
      stdio: "ignore",
    });
    console.log("    => @observablehq/plot has been installed from NPM.");
  } else if (runtime === "bun") {
    console.log("\n3 - Installing libraries with Bun...");
    execSync("bunx jsr add @nshiab/simple-data-analysis", {
      stdio: "ignore",
    });
    console.log("    => simple-data-analysis has been installed from JSR.");
    execSync("bunx jsr add @nshiab/journalism", {
      stdio: "ignore",
    });
    console.log("    => journalism has been installed from JSR.");
    execSync("bun add @observablehq/plot", {
      stdio: "ignore",
    });
    console.log("    => @observablehq/plot has been installed from NPM.");
  } else if (runtime === "deno") {
    console.log("\n3 - Installing libraries with Deno...");
    execSync(
      "deno install --node-modules-dir=auto --allow-scripts=npm:playwright-chromium@1.50.0 jsr:@nshiab/simple-data-analysis",
      {
        stdio: "ignore",
      },
    );
    console.log("    => simple-data-analysis has been installed from JSR.");
    execSync(
      "deno install --node-modules-dir=auto --allow-scripts=npm:playwright-chromium@1.50.0 jsr:@nshiab/journalism",
      {
        stdio: "ignore",
      },
    );
    console.log("    => journalism has been installed JSR.");
    execSync("deno install --node-modules-dir=auto npm:@observablehq/plot", {
      stdio: "ignore",
    });
    console.log("    => @observablehq/plot has been installed from NPM.");
  }

  if (args.includes("--git")) {
    console.log("\n4 - Initializing Git repository...");
    execSync("git init && git add -A && git commit -m 'Setup done'", {
      stdio: "ignore",
    });
    console.log("    => First commit done");
  }

  console.log("\nSetup is done!\n");

  if (runtime === "nodejs") {
    console.log("    => Run 'npm run sda' to watch main.ts.");
  } else if (runtime === "bun") {
    console.log("    => Run 'bun run sda' to watch main.ts.");
  } else if (runtime === "deno") {
    console.log("    => Run 'deno task sda' to watch main.ts.");
  }

  console.log("\nCheck the README.md and have fun. ^_^\n");
} else {
  const readme =
    `This repository has been created with [setup-sda](https://github.com/nshiab/setup-sda/).

It's using [simple-data-analysis](https://github.com/nshiab/simple-data-analysis) and [journalism](https://github.com/nshiab/journalism).

Here's the recommended workflow:

- Put your raw data in the \`sda/data\` folder. Note that this folder is gitignored.
- Use the \`sda/main.ts\` file to clean and process your raw data. Write the results to the \`sda/output\` folder.

When working on your project, use the following command:

- \`npm run sda\` will watch your \`sda/main.ts\` and its dependencies. Everytime you'll save some changes, the data will be reprocessed.
`;

  const tsconfigContent = `{
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

  const packageJson = {
    type: "module",
    scripts: {
      sda: "node --experimental-strip-types --no-warnings --watch sda/main.ts",
      clean: "rm -rf .sda-cache && rm -rf .temp",
    },
  };

  const denoJson = {
    tasks: {
      sda: "deno run --node-modules-dir=auto -A --watch --check sda/main.ts",
      clean: "rm -rf .sda-cache && rm -rf .temp",
    },
    nodeModulesDir: "auto",
  };

  const mainTs = `console.log("Hello! How are you doing?");`;

  console.log("\n2 - Creating relevant files...");

  if (runtime === "nodejs") {
    if (existsSync("package.json")) {
      console.log("    => package.json already exists.");
    } else {
      writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
      console.log("    => package.json has been created.");
    }

    if (existsSync("tsconfig.json")) {
      console.log("    => tsconfig.json already exists.");
    } else {
      writeFileSync("tsconfig.json", tsconfigContent);
      console.log("    => tsconfig.json has been created.");
    }
  } else if (runtime === "bun") {
    packageJson.scripts = {
      sda: "bun --watch sda/main.ts",
    };

    if (existsSync("package.json")) {
      console.log("    => package.json already exists.");
    } else {
      writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
      console.log("    => package.json has been created.");
    }

    if (existsSync("tsconfig.json")) {
      console.log("    => tsconfig.json already exists.");
    } else {
      writeFileSync("tsconfig.json", tsconfigContent);
      console.log("    => tsconfig.json has been created.");
    }
  } else if (runtime === "deno") {
    if (existsSync("deno.json")) {
      console.log("    => deno.json already exists.");
    } else {
      writeFileSync("deno.json", JSON.stringify(denoJson, null, 2));
      console.log("    => deno.json has been created.");
    }
  }

  if (existsSync(".gitignore")) {
    console.log("    => .gitignore already exists.");
  } else {
    writeFileSync(
      ".gitignore",
      "node_modules\n.temp\n.sda-cache\ndata\n.DS_Store",
    );
    console.log("    => .gitignore has been created.");
  }

  if (existsSync("sda")) {
    console.log("    => sda/ already exists.");
  } else {
    mkdirSync("sda");
    writeFileSync(
      "sda/main.ts",
      mainTs,
    );
    console.log("    => sda/main.ts has been created.");

    mkdirSync("sda/helpers");
    console.log("    => sda/helpers/ has been created.");

    mkdirSync("sda/data");
    console.log("    => sda/data/ has been created.");
    mkdirSync("sda/output");
    console.log("    => sda/output/ has been created.");
  }

  if (existsSync("README.md")) {
    console.log("    => README.md already exists.");
  } else {
    writeFileSync("README.md", readme);
    console.log("    => README.md has been created.");
  }

  if (runtime === "nodejs") {
    console.log("\n3 - Installing libraries...");
    execSync("npx jsr add @nshiab/simple-data-analysis", {
      stdio: "ignore",
    });
    console.log("    => simple-data-analysis has been installed from JSR.");
    execSync("npx jsr add @nshiab/journalism", {
      stdio: "ignore",
    });
    console.log("    => journalism has been installed from JSR.");
    execSync("npm i @observablehq/plot", {
      stdio: "ignore",
    });
    console.log("    => @observablehq/plot has been installed from NPM.");
  } else if (runtime === "bun") {
    console.log("\n3 - Installing libraries with Bun...");
    execSync("bunx jsr add @nshiab/simple-data-analysis", {
      stdio: "ignore",
    });
    console.log("    => simple-data-analysis has been installed from JSR.");
    execSync("bunx jsr add @nshiab/journalism", {
      stdio: "ignore",
    });
    console.log("    => journalism has been installed from JSR.");
    execSync("bun add @observablehq/plot", {
      stdio: "ignore",
    });
    console.log("    => @observablehq/plot has been installed from NPM.");
  } else if (runtime === "deno") {
    console.log("\n3 - Installing libraries with Deno...");
    execSync(
      "deno install --node-modules-dir=auto --allow-scripts=npm:playwright-chromium@1.50.0 jsr:@nshiab/simple-data-analysis",
      {
        stdio: "ignore",
      },
    );
    console.log("    => simple-data-analysis has been installed from JSR.");
    execSync(
      "deno install --node-modules-dir=auto --allow-scripts=npm:playwright-chromium@1.50.0 jsr:@nshiab/journalism",
      {
        stdio: "ignore",
      },
    );
    console.log("    => journalism has been installed from JSR.");
    execSync("deno install --node-modules-dir=auto npm:@observablehq/plot", {
      stdio: "ignore",
    });
    console.log("    => @observablehq/plot has been installed from NPM.");
  }

  if (args.includes("--git")) {
    console.log("\n4 - Initializing Git repository...");
    execSync("git init && git add -A && git commit -m 'Setup done'", {
      stdio: "ignore",
    });
    console.log("    => First commit done");
  }

  console.log("\nSetup is done!\n");

  if (runtime === "nodejs") {
    console.log("    => Run 'npm run sda' to watch main.ts.");
  } else if (runtime === "bun") {
    console.log("    => Run 'bun run sda' to watch main.ts.");
  } else if (runtime === "deno") {
    console.log("    => Run 'deno task sda' to watch main.ts.");
  }

  console.log("\nCheck the README.md and have fun. ^_^\n");
}
