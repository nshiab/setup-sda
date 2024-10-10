#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import process from "node:process";

console.log("\nStarting sda setup...");

const args = process.argv.slice(2);

const files = readdirSync(".");
if (files.length > 0) {
  throw new Error(
    "The folder is not empty. Please start over in an empty folder."
  );
}

let mainContent = `import { SimpleDB } from "simple-data-analysis";
import { prettyDuration } from "journalism";

const start = Date.now();
const sdb = new SimpleDB();

const temp = sdb.newTable("temp");
await temp.loadData("data/temp.csv");

await temp.logTable();

await temp.logLineChart("decade", "meanTemp", {
  smallMultiples: "city",
  fixedScales: true,
  formatY: (d) => \`\${d}°C\`,
});

await sdb.done();

prettyDuration(start, { log: true, prefix: "Done in " });
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

console.log("\n2 - Creating relevant files...");

if (runtime === "bun" || runtime === "nodejs") {
  const packageJson = {
    type: "module",
  };
  if (runtime === "bun") {
    packageJson.scripts = {
      sda: "bun --watch src/main.ts",
    };
  } else {
    packageJson.scripts = {
      sda: "node --experimental-strip-types --no-warnings --watch src/main.ts",
    };
  }
  packageJson.scripts.clean = "rm -rf .sda-cache && rm -rf .temp";
  writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
  console.log("    => package.json has been created.");

  writeFileSync("tsconfig.json", tsconfigContent);
  console.log("    => tsconfig.json has been created.");
} else if (runtime === "deno") {
  const denoConfig = {
    tasks: {
      sda: "deno run --node-modules-dir=auto -A --watch src/main.ts",
      clean: "rm -rf .sda-cache && rm -rf .temp",
    },
    nodeModulesDir: "auto",
  };
  writeFileSync("deno.json", JSON.stringify(denoConfig, null, 2));
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
if (!existsSync("src")) {
  mkdirSync("src");
}

writeFileSync("src/main.ts", mainContent);
console.log("    => src/main.ts has been created.");
if (!existsSync("data")) {
  mkdirSync("data");
}

writeFileSync("data/temp.csv", data);
console.log("    => data/temp.csv has been created.");

if (runtime === "nodejs") {
  console.log("\n3 - Installing libraries with NPM...");
  execSync("npm i simple-data-analysis --silent", {
    stdio: "ignore",
  });
  console.log("    => simple-data-analysis has been installed.");
  execSync("npm i journalism --silent", {
    stdio: "ignore",
  });
  console.log("    => journalism has been installed.");
} else if (runtime === "bun") {
  console.log("\n3 - Installing libraries with Bun from NPM...");
  execSync("bun add simple-data-analysis", {
    stdio: "ignore",
  });
  console.log("    => simple-data-analysis has been installed.");
  execSync("bun add journalism", {
    stdio: "ignore",
  });
  console.log("    => journalism has been installed.");
} else if (runtime === "deno") {
  console.log("\n3 - Installing libraries with Deno from JSR...");
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

console.log("\nSetup is done!");

if (runtime === "nodejs") {
  console.log("    => Run 'npm run sda' to watch main.ts.");
} else if (runtime === "bun") {
  console.log("    => Run 'bun run sda' to watch main.ts.");
} else if (runtime === "deno") {
  console.log("    => Run 'deno task sda' to watch main.ts.");
}

console.log("    => Have fun. ^_^\n");
