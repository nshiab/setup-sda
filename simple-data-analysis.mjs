#!/usr/bin/env node

import { execSync } from "node:child_process";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import process from "node:process";

console.log("\nStarting sda setup...");

const files = readdirSync(".");
if (files.length > 0) {
  throw new Error(
    "The folder is not empty. Please start over in an empty folder."
  );
}

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

  let readme = `This repository has been created with [setup-sda](https://github.com/nshiab/setup-sda/).

It's using [simple-data-analysis](https://github.com/nshiab/simple-data-analysis), [journalism](https://github.com/nshiab/journalism) and [Framework](https://github.com/observablehq/framework) with [Plot](https://github.com/observablehq/plot).

Here's the recommended workflow:

- Put your raw data in the \`src/data-raw\` folder.
- Use the \`src/main.ts\` file to clean and process your raw data. Write the results to the \`src/data\` folder.
- Import your processed data from the \`src/data\` folder into the \`src/index.md\` and use it for your content.

When working on your project, you can use the following commands:

- \`npm run sda\` will watch your \`src/main.ts\` and its dependencies. Everytime you'll save some changes, the data will be reprocessed.
- \`npm run dev\` will start a local server and watch all \`src/*.md\` files and their dependencies. Everytime you'll save some changes or the data is reprocessed, the content will be updated.

By opening two terminals each running one of the above commands, you'll be able to work on your project with a live preview of your content and data.
`;

  const packageJson = {
    type: "module",
    private: true,
    scripts: {
      clean:
        "rimraf src/.observablehq/cache && rimraf .sda-cache && rimraf .temp",
      build: "observable build",
      dev: "observable preview",
      deploy: "observable deploy",
      observable: "observable",
      sda: "node --experimental-strip-types --no-warnings --watch src/main.ts",
    },
    engines: {
      node: ">=18",
    },
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
  // theme: "default", // try "light", "dark", "slate", etc.
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

  const mainTs = `import { SimpleDB } from "simple-data-analysis";
import { prettyDuration } from "journalism";

const start = Date.now();
const sdb = new SimpleDB();

// The mean temperature per decade.
const temp = sdb.newTable("temp");
await temp.loadData("src/data-raw/temp.csv");
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

await sdb.done();

prettyDuration(start, { log: true, prefix: "Done in " });
`;

  const indexMd = `\`\`\`ts
// To import .ts files, you need to use the .js extension
import getTempChange from "./helpers/getTempChange.js";
import createChart from "./components/createChart.js";
import getHighlightedCode from "./helpers/getHighlightedCode.js";

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

\`\`\`ts
display(await getHighlightedCode(FileAttachment("./main.ts")));
\`\`\`
`;

  const createChartTs = `
import { dot, line, plot } from "@observablehq/plot";

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

  const getHighlightedCodeTs = `import { FileAttachment } from "@observablehq/stdlib";
import { html } from "htl";
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";

hljs.registerLanguage("typescript", typescript);

export default async function getHighlightedCode(file: FileAttachment) {
  const code = await file.text();

  const highlightedCode = hljs.highlight(code, {
    language: "typescript",
  }).value;

  const wrappedCode = html\`<div
    class="observablehq-pre-container"
    data-language="ts"
  >
    <pre data-language="ts"><code class="language-ts"></code></pre>
  </div>\`;

  wrappedCode.querySelector("code").innerHTML = highlightedCode;

  return wrappedCode;
}
`;

  const getTempChangeTs = `import { formatNumber } from "journalism";

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

  writeFileSync("README.md", readme);
  console.log("    => README.md has been created.");

  if (runtime === "bun") {
    packageJson.scripts.sda = "bun --watch src/main.ts";
  } else if (runtime === "deno") {
    packageJson.scripts.sda =
      "deno run --node-modules-dir=auto -A --watch src/main.ts";
  }
  writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
  console.log("    => package.json has been created.");

  writeFileSync("observablehq.config.js", observableConfigJS);
  console.log("    => observablehq.config.js has been created.");

  writeFileSync(
    ".gitignore",
    ".DS_Store\n/dist/\nnode_modules/\nyarn-error.log\n.temp\n.sda-cache"
  );
  console.log("    => .gitignore has been created.");

  mkdirSync("src");

  writeFileSync("src/main.ts", mainTs);
  console.log("    => src/main.ts has been created.");

  writeFileSync("src/index.md", indexMd);
  console.log("    => src/index.md has been created.");

  writeFileSync("src/.gitignore", "/.observablehq/cache/");
  console.log("    => src/.gitignore has been created.");

  mkdirSync("src/data-raw");

  writeFileSync("src/data-raw/temp.csv", data);
  console.log("    => src/data-raw/temp.csv has been created.");

  mkdirSync("src/data");
  console.log("    => src/data/ has been created.");

  mkdirSync("src/components");

  writeFileSync("src/components/createChart.ts", createChartTs);
  console.log("    => src/components/createChart.ts has been created.");

  mkdirSync("src/helpers");

  writeFileSync("src/helpers/getHighlightedCode.ts", getHighlightedCodeTs);
  console.log("    => src/helpers/getHighlightedCode.ts has been created.");

  writeFileSync("src/helpers/getTempChange.ts", getTempChangeTs);
  console.log("    => src/helpers/getTempChange.ts has been created.");

  if (runtime === "nodejs") {
    console.log("\n3 - Installing libraries with NPM...");
    execSync("npm i rimraf  --save-dev --silent", {
      stdio: "ignore",
    });
    console.log("    => journalism has been installed.");
    execSync("npm i @observablehq/framework --silent", {
      stdio: "ignore",
    });
    console.log("    => framework has been installed.");
    execSync("npm i @observablehq/plot --silent", {
      stdio: "ignore",
    });
    console.log("    => rimraf has been installed.");
    execSync("npm i simple-data-analysis --silent", {
      stdio: "ignore",
    });
    console.log("    => simple-data-analysis has been installed.");
    execSync("npm i journalism --silent", {
      stdio: "ignore",
    });
  } else if (runtime === "bun") {
    console.log("\n3 - Installing libraries with Bun...");
    execSync("bun add rimraf --dev", {
      stdio: "ignore",
    });
    console.log("    => rimraf has been installed.");
    execSync("bun add @observablehq/framework", {
      stdio: "ignore",
    });
    console.log("    => framework has been installed.");
    execSync("bun add @observablehq/plot", {
      stdio: "ignore",
    });
    console.log("    => plot has been installed.");
    execSync("bun add simple-data-analysis", {
      stdio: "ignore",
    });
    console.log("    => simple-data-analysis has been installed.");
    execSync("bun add journalism", {
      stdio: "ignore",
    });
    console.log("    => journalism has been installed.");
  } else if (runtime === "deno") {
    console.log("\n3 - Installing libraries with Deno...");
    execSync("deno install --node-modules-dir=auto --dev npm:rimraf", {
      stdio: "ignore",
    });
    console.log("    => rimraf has been installed.");
    execSync(
      "deno install --node-modules-dir=auto npm:@observablehq/framework",
      {
        stdio: "ignore",
      }
    );
    console.log("    => framework has been installed.");
    execSync("deno install --node-modules-dir=auto npm:@observablehq/plot", {
      stdio: "ignore",
    });
    console.log("    => plot has been installed.");
    execSync(
      "deno install --node-modules-dir=auto --allow-scripts=npm:duckdb jsr:@nshiab/simple-data-analysis",
      {
        stdio: "ignore",
      }
    );
    console.log("    => simple-data-analysis has been installed.");
    execSync("deno install --node-modules-dir=auto jsr:@nshiab/journalism", {
      stdio: "ignore",
    });
    console.log("    => journalism has been installed.");
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
      "    => Run 'npm run dev' to start a local server and watch index.md."
    );
  } else if (runtime === "bun") {
    console.log("    => Run 'bun run sda' to watch main.ts.");
    console.log(
      "    => Run 'bun run dev' to start a local server and watch index.md."
    );
  } else if (runtime === "deno") {
    console.log("    => Run 'deno task sda' to watch main.ts.");
    console.log(
      "    => Run 'deno task dev' to start a local server and watch index.md."
    );
  }

  console.log("\nHave fun. ^_^\n");
} else {
  let readme = `This repository has been created with [setup-sda](https://github.com/nshiab/setup-sda/).

It's using [simple-data-analysis](https://github.com/nshiab/simple-data-analysis) and [journalism](https://github.com/nshiab/journalism).

Here's the recommended workflow:

- Put your raw data in the \`src/data-raw\` folder.
- Use the \`src/main.ts\` file to clean and process your raw data. Write the results to the \`src/data\` folder.

When working on your project, use the following command:

- \`npm run sda\` will watch your \`src/main.ts\` and its dependencies. Everytime you'll save some changes, the data will be reprocessed.
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
      sda: "node --experimental-strip-types --no-warnings --watch src/main.ts",
      clean: "rm -rf .sda-cache && rm -rf .temp",
    },
  };

  const denoJson = {
    tasks: {
      sda: "deno run --node-modules-dir=auto -A --watch src/main.ts",
      clean: "rm -rf .sda-cache && rm -rf .temp",
    },
    nodeModulesDir: "auto",
  };

  let mainContent = `import { SimpleDB } from "simple-data-analysis";
import { prettyDuration } from "journalism";

const start = Date.now();
const sdb = new SimpleDB();

// The mean temperature per decade.
const temp = sdb.newTable("temp");
await temp.loadData("src/data-raw/temp.csv");

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

// We write the results to src/data.
await tempRegressions.writeData("src/data/temp-regressions.json");

await sdb.done();

prettyDuration(start, { log: true, prefix: "\\nDone in " });
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
    writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
    console.log("    => package.json has been created.");
    writeFileSync("tsconfig.json", tsconfigContent);
    console.log("    => tsconfig.json has been created.");
  } else if (runtime === "bun") {
    packageJson.scripts = {
      sda: "bun --watch src/main.ts",
    };
    writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
    console.log("    => package.json has been created.");

    writeFileSync("tsconfig.json", tsconfigContent);
    console.log("    => tsconfig.json has been created.");
  } else if (runtime === "deno") {
    writeFileSync("deno.json", JSON.stringify(denoJson, null, 2));
    console.log("    => deno.json has been created.");
  }

  writeFileSync(".gitignore", "node_modules\n.temp\n.sda-cache");
  console.log("    => .gitignore has been created.");

  if (runtime === "deno") {
    mainContent = mainContent
      .replace(
        `import { SimpleDB } from "simple-data-analysis";`,
        `import { SimpleDB } from "@nshiab/simple-data-analysis";`
      )
      .replace(
        `import { prettyDuration } from "journalism";`,
        `import { prettyDuration } from "@nshiab/journalism";`
      );
  }

  mkdirSync("src");
  writeFileSync("src/main.ts", mainContent);
  console.log("    => src/main.ts has been created.");

  mkdirSync("src/data-raw");
  writeFileSync("src/data-raw/temp.csv", data);
  console.log("    => src/data-raw/temp.csv has been created.");
  mkdirSync("src/data");
  console.log("    => src/data/ has been created.");

  writeFileSync("README.md", readme);
  console.log("    => README.md has been created.");

  if (runtime === "nodejs") {
    console.log("\n3 - Installing libraries with NPM...");
    execSync("npm i simple-data-analaysis --silent", {
      stdio: "ignore",
    });
    console.log("    => simple-data-analysis has been installed.");
    execSync("npm i journalism --silent", {
      stdio: "ignore",
    });
    console.log("    => journalism has been installed.");
  } else if (runtime === "bun") {
    console.log("\n3 - Installing libraries with Bun...");
    execSync("bun add simple-data-analysis", {
      stdio: "ignore",
    });
    console.log("    => simple-data-analysis has been installed.");
    execSync("bun add journalism", {
      stdio: "ignore",
    });
    console.log("    => journalism has been installed.");
  } else if (runtime === "deno") {
    console.log("\n3 - Installing libraries with Deno...");
    execSync(
      "deno install --node-modules-dir=auto --allow-scripts=npm:duckdb jsr:@nshiab/simple-data-analysis",
      {
        stdio: "ignore",
      }
    );
    console.log("    => simple-data-analysis has been installed.");
    execSync("deno install --node-modules-dir=auto jsr:@nshiab/journalism", {
      stdio: "ignore",
    });
    console.log("    => journalism has been installed.");
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

  console.log("\nHave fun. ^_^\n");
}
