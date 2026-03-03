import { existsSync, mkdirSync, writeFileSync } from "node:fs";

export async function setupAgents(args: string[]) {
  if (
    !args.includes("--claude") && !args.includes("--gemini") &&
    !args.includes("--copilot") && !args.includes("--agent")
  ) return;

  console.log("      => Fetching up-to-date documentation for journalism...");
  const journalismDoc = await fetch(
    "https://raw.githubusercontent.com/nshiab/journalism/refs/heads/main/llm.md",
  ).then((d) => d.text());

  const journalismFunctions = journalismDoc
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => line.replace("## ", "").trim())
    .join("\n");

  console.log("      => Fetching up-to-date documentation for simple-data-analysis...");
  const sdaDoc = await fetch(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/refs/heads/main/llm.md",
  ).then((d) => d.text());

  const sdaClassesAndMethods = sdaDoc
    .split("\n")
    .filter((line) => line.startsWith("## ") || line.startsWith("#### "))
    .map((line) =>
      line.startsWith("## ")
        ? "\n" + line.replace("## ", "").trim()
        : line.replace("#### Parameters", "  Methods:").replace("#### ", "    ")
          .replaceAll("`", "")
    )
    .join("\n");

  const llm = `Always verify if there is a deno.json or package.json file in the root of the project and familiarize yourself with the scripts available in it and the libraries already installed in the project.

If it's a Deno project, always run \`deno run -A --node-modules-dir=auto --env-file --check sda/main.ts\` to test your code. Before handing off your work, always run \`deno lint\` and \`deno fmt\` as well. Fix any errors or warnings triggered along the way.

If it's a Node.js project, always run \`node --env-file=.env --experimental-strip-types --no-warnings sda/main.ts\` to test your code. Before handing off your work, always fix any errors or warnings triggered along the way.

Always use "sda/main.ts" as the entry point.

If you need to create other TypeScript files, create them in the "sda/helpers" folder. Prioritize the use of helper functions to keep the code well organized and maintainable, with one helper function per file, with the file named after the function. Prioritize default exports for helper functions.

If you need to download data, always put the files in the "sda/data" folder, which is gitignored. 

If you need to output data to a file, always put the file in the "sda/output" folder.

Always prioritize the use of the "journalism" and "simple-data-analysis" libraries. These libraries are already installed in the project and can be used directly like this:
\x60\x60\x60typescript
import { formatDate } from "@nshiab/journalism";
import { SimpleDB } from "@nshiab/simple-data-analysis";
\x60\x60\x60
  
Here are the functions available in the "journalism" library. If one of the function might be relevant, read the complete documentation at "./docs/journalism.md" to properly use it.

\x24{journalismFunctions}

Here are the classes and their methods available in the "simple-data-analysis" library. If one of the classes or methods might be relevant, read the complete documentation at "./docs/simple-data-analysis.md" to properly use it. Remember that almost all methods are asynchronous, so you need to use \`await\` when calling them.
\x24{sdaClassesAndMethods}`;

  const agentFiles = [
    { flag: "--claude", file: "CLAUDE.md" },
    { flag: "--gemini", file: "GEMINI.md" },
    { flag: "--agent", file: "AGENTS.md" },
  ];

  for (const { flag, file } of agentFiles) {
    if (args.includes(flag)) {
      if (existsSync(file)) {
        console.log("      => " + file + " already exists. Skipping creation.");
      } else {
        console.log("      => Creating " + file + ".");
        writeFileSync(file, llm);
      }
    }
  }

  if (args.includes("--copilot")) {
    if (!existsSync(".github")) mkdirSync(".github", { recursive: true });
    if (existsSync(".github/copilot-instructions.md")) {
      console.log("      => .github/copilot-instructions.md already exists. Skipping creation.");
    } else {
      console.log("      => Creating .github/copilot-instructions.md.");
      writeFileSync(".github/copilot-instructions.md", llm);
    }
  }

  if (!existsSync("docs")) mkdirSync("docs", { recursive: true });
  writeFileSync("docs/journalism.md", journalismDoc);
  writeFileSync("docs/simple-data-analysis.md", sdaDoc);
}
