#!/usr/bin/env node

import { execSync } from "node:child_process";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import process from "node:process";

console.log("\nStarting sda setup...");

const args = process.argv.slice(2);

if (!args.includes("--force")) {
  const files = readdirSync(".");
  if (files.length > 0) {
    throw new Error(
      "The folder is not empty. Please start over in an empty folder or pass the option --force."
    );
  }
} else {
  console.log(
    "    => The folder is not empty but --force option is used. Overwriting files."
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
  formatY: (d) => \`${d}°C\`,
});

await sdb.done();

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
const data = `city,decade,meanTemp
Toronto,1840.0,7.1
Toronto,1850.0,6.4
Toronto,1860.0,6.9
Toronto,1870.0,6.8
Montreal,1880.0,5.3
Toronto,1880.0,6.6
Calgary,1890.0,2.7
Montreal,1890.0,6.0
Toronto,1890.0,7.6
Calgary,1900.0,3.3
Montreal,1900.0,5.8
Toronto,1900.0,7.7
Vancouver,1900.0,8.7
Calgary,1910.0,3.5
Montreal,1910.0,6.1
Toronto,1910.0,8.1
Vancouver,1910.0,8.8
Calgary,1920.0,3.6
Montreal,1920.0,6.2
Toronto,1920.0,8.0
Vancouver,1920.0,9.3
Calgary,1930.0,4.1
Montreal,1930.0,6.8
Toronto,1930.0,8.6
Vancouver,1930.0,9.6
Calgary,1940.0,4.2
Montreal,1940.0,6.9
Toronto,1940.0,8.7
Vancouver,1940.0,10.0
Calgary,1950.0,3.2
Montreal,1950.0,7.4
Toronto,1950.0,9.2
Vancouver,1950.0,9.8
Calgary,1960.0,4.0
Montreal,1960.0,7.4
Toronto,1960.0,8.8
Vancouver,1960.0,10.0
Calgary,1970.0,3.8
Montreal,1970.0,7.3
Toronto,1970.0,9.0
Vancouver,1970.0,9.6
Calgary,1980.0,4.9
Montreal,1980.0,7.7
Toronto,1980.0,9.0
Vancouver,1980.0,10.2
Calgary,1990.0,4.5
Toronto,1990.0,9.6
Vancouver,1990.0,10.6
Calgary,2000.0,4.7
Montreal,2000.0,7.6
Toronto,2000.0,9.7
Vancouver,2000.0,10.6
Calgary,2010.0,4.8
Montreal,2010.0,8.0
Toronto,2010.0,9.9
Vancouver,2010.0,10.9
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
        sda: "bun --watch src/main.ts",
      };
    } else {
      packageJson.scripts = {
        sda: "bun --watch src/main.js",
      };
    }
  } else {
    if (language === "ts") {
      packageJson.scripts = {
        sda: "node --experimental-strip-types --no-warnings --watch src/main.ts",
      };
    } else {
      packageJson.scripts = {
        sda: "node --no-warnings --watch src/main.js",
      };
    }
  }
  packageJson.scripts.clean = "rm -rf .sda-cache && rm -rf .temp";
  writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
  console.log("    => package.json has been created.");
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

if (runtime === "nodejs" && language === "ts") {
  writeFileSync("tsconfig.json", tsconfigContent);
  console.log("    => tsconfig.json has been created.");
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
if (language === "ts") {
  writeFileSync("src/main.ts", mainContent);
  console.log("    => src/main.ts has been created.");
} else {
  writeFileSync("main.js", mainContent);
  console.log("    => src/main.js has been created.");
}
mkdirSync("data");
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
  execSync(
    "deno install --node-modules-dir=auto --allow-scripts=npm:duckdb jsr:@nshiab/journalism",
    {
      stdio: "ignore",
    }
  );
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
