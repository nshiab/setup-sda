#!/usr/bin/env node

import { execSync } from "node:child_process";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
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

const table = await sdb
  .newTable()
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/firesCanada2023.csv"
  );

await table.logTable();

await sdb.done()

prettyDuration(start, { log: true, prefix: "\\nDone in " });
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

let language = args.includes("--js") ? "js" : "ts";

if (runtime === "bun") {
  console.log("    => Setting things up for Bun.");
  if (language === "js") {
    console.log("    => Setting things up for JavaScript.");
  } else {
    console.log("    => Setting things up for TypeScript.");
  }
} else if (runtime === "deno") {
  console.log("    => Setting things up for Deno.");
  if (language === "ts") {
    console.log("    => Setting things up for TypeScript.");
  } else {
    console.log("    => Setting things up for JavaScript.");
    language = "js";
  }
} else {
  console.log("    => Setting things up for Node.js.");
  if (language === "ts") {
    const nodeVersion = process.version
      .split(".")
      .map((d) => parseInt(d.replace("v", "")));
    if (nodeVersion[0] >= 22 && nodeVersion[1] >= 6) {
      console.log(
        "    => Node.js version is >= 22.6.0. Setting things up for TypeScript."
      );
    } else {
      console.log(
        "    => Node.js version is < 22.6.0. Setting things up for JavaScript."
      );
      language = "js";
    }
  } else {
    console.log("    => Setting things up for JavaScript.");
  }
}

console.log("\n2 - Creating relevant files...");

if (runtime === "bun" || runtime === "nodejs") {
  const packageJson = {
    type: "module",
  };
  if (runtime === "bun") {
    if (language === "ts") {
      packageJson.scripts = {
        sda: "bun --watch main.ts",
      };
    } else {
      packageJson.scripts = {
        sda: "bun --watch main.js",
      };
    }
  } else {
    if (language === "ts") {
      packageJson.scripts = {
        sda: "node --experimental-strip-types --no-warnings --watch main.ts",
      };
    } else {
      packageJson.scripts = {
        sda: "node --no-warnings --watch main.js",
      };
    }
  }
  packageJson.scripts.clean = "rm -rf .sda-cache && rm -rf .temp";
  writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
  console.log("    => package.json has been created.");
} else if (runtime === "deno") {
  const denoConfig = {
    tasks: {
      sda: "deno run --node-modules-dir=auto -A --watch main.ts",
      clean: "rm -rf .sda-cache && rm -rf .temp",
    },
    nodeModulesDir: "auto",
  };
  writeFileSync("deno.json", JSON.stringify(denoConfig, null, 2));
  console.log("    => deno.json has been created.");
}

if (runtime === "nodejs" && language === "ts") {
  writeFileSync("tsconfig.json", tsconfigContent);
  console.log("    => tsconfig.json has been created.");
}

writeFileSync(".gitignore", "node_modules\n.temp\n.sda-cache");
console.log("    => .gitignore has been created.");

if (runtime === "deno") {
  // NEED TO DO SAME THING FOR JOURNALISM
  mainContent = mainContent.replace(
    `import { SimpleDB } from "simple-data-analysis";`,
    `import { SimpleDB } from "@nshiab/simple-data-analysis";`
  );
}
mkdirSync("src");
if (language === "ts") {
  writeFileSync("src/main.ts", mainContent);
  console.log("    => src/main.ts has been created.");
} else {
  writeFileSync("main.js", mainContent);
  console.log("    => src/main.js has been created.");
}

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
  // NEEDS TO BE UPDATED. JOURNALISM ON JSR. NEED TO UPDATE IMPORTS TOO.
  execSync("deno install --node-modules-dir=auto npm:journalism", {
    stdio: "ignore",
  });
  console.log("    => journalism has been installed.");
}

console.log("\nSetup is done!");

if (runtime === "nodejs") {
  if (language === "ts") {
    console.log("    => Run 'npm run sda' to watch main.ts.");
  } else {
    console.log("    => Run 'npm run sda' to watch main.js.");
  }
} else if (runtime === "bun") {
  if (language === "ts") {
    console.log("    => Run 'bun run sda' to watch main.ts.");
  } else {
    console.log("    => Run 'bun run sda' to watch main.js.");
  }
} else if (runtime === "deno") {
  if (language === "ts") {
    console.log("    => Run 'deno task sda' to watch main.ts.");
  } else {
    console.log("    => Run 'deno task sda' to watch main.js.");
  }
}

console.log("    => Have fun. ^_^\n");
