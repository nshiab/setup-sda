#!/usr/bin/env node

// src/main.ts
import process from "node:process";

// src/lib/utils.ts
import { execSync as nodeExecSync } from "node:child_process";
function getRuntime() {
  const userAgent = (globalThis.navigator?.userAgent || "node").toLocaleLowerCase();
  if (userAgent.includes("bun")) return "bun";
  if (userAgent.includes("deno")) return "deno";
  return "nodejs";
}
function createExecSync(isTest) {
  return (command, options = {
    stdio: "ignore"
  }) => {
    if (isTest && (command.includes("npm ") || command.includes("npx ") || command.includes("bun ") || command.includes("bunx ") || command.includes("deno install"))) {
      console.log(`      => Skipping: ${command}`);
    } else {
      nodeExecSync(command, options);
    }
  };
}

// src/actions/agents.ts
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
async function setupAgents(args) {
  if (!args.includes("--claude") && !args.includes("--gemini") && !args.includes("--copilot") && !args.includes("--agent")) return;
  console.log("      => Fetching up-to-date documentation for journalism...");
  const journalismDoc = await fetch("https://raw.githubusercontent.com/nshiab/journalism/refs/heads/main/llm.md").then((d) => d.text());
  const journalismFunctions = journalismDoc.split("\n").filter((line) => line.startsWith("## ")).map((line) => line.replace("## ", "").trim()).join("\n");
  console.log("      => Fetching up-to-date documentation for simple-data-analysis...");
  const sdaDoc = await fetch("https://raw.githubusercontent.com/nshiab/simple-data-analysis/refs/heads/main/llm.md").then((d) => d.text());
  const sdaClassesAndMethods = sdaDoc.split("\n").filter((line) => line.startsWith("## ") || line.startsWith("#### ")).map((line) => line.startsWith("## ") ? "\n" + line.replace("## ", "").trim() : line.replace("#### Parameters", "  Methods:").replace("#### ", "    ").replaceAll("`", "")).join("\n");
  const llm = `Always verify if there is a deno.json or package.json file in the root of the project and familiarize yourself with the scripts available in it and the libraries already installed in the project.

If it's a Deno project, always run \`deno run -A --node-modules-dir=auto --env-file --check sda/main.ts\` to test your code. Before handing off your work, always run \`deno lint\` and \`deno fmt\` as well. Fix any errors or warnings triggered along the way.

If it's a Node.js project, always run \`node --env-file=.env --experimental-strip-types --no-warnings sda/main.ts\` to test your code. Before handing off your work, always fix any errors or warnings triggered along the way.

Always use "sda/main.ts" as the entry point.

If you need to create other TypeScript files, create them in the "sda/helpers" folder. Prioritize the use of helper functions to keep the code well organized and maintainable, with one helper function per file, with the file named after the function. Prioritize default exports for helper functions.

If you need to download data, always put the files in the "sda/data" folder, which is gitignored. 

If you need to output data to a file, always put the file in the "sda/output" folder.

Always prioritize the use of the "journalism" and "simple-data-analysis" libraries. These libraries are already installed in the project and can be used directly like this:
\`\`\`typescript
import { formatDate } from "@nshiab/journalism";
import { SimpleDB } from "@nshiab/simple-data-analysis";
\`\`\`
  
Here are the functions available in the "journalism" library. If one of the function might be relevant, read the complete documentation at "./docs/journalism.md" to properly use it.

\${journalismFunctions}

Here are the classes and their methods available in the "simple-data-analysis" library. If one of the classes or methods might be relevant, read the complete documentation at "./docs/simple-data-analysis.md" to properly use it. Remember that almost all methods are asynchronous, so you need to use \`await\` when calling them.
\${sdaClassesAndMethods}`;
  const agentFiles = [
    {
      flag: "--claude",
      file: "CLAUDE.md"
    },
    {
      flag: "--gemini",
      file: "GEMINI.md"
    },
    {
      flag: "--agent",
      file: "AGENTS.md"
    }
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
    if (!existsSync(".github")) mkdirSync(".github", {
      recursive: true
    });
    if (existsSync(".github/copilot-instructions.md")) {
      console.log("      => .github/copilot-instructions.md already exists. Skipping creation.");
    } else {
      console.log("      => Creating .github/copilot-instructions.md.");
      writeFileSync(".github/copilot-instructions.md", llm);
    }
  }
  if (!existsSync("docs")) mkdirSync("docs", {
    recursive: true
  });
  writeFileSync("docs/journalism.md", journalismDoc);
  writeFileSync("docs/simple-data-analysis.md", sdaDoc);
}

// src/actions/svelte.ts
import { existsSync as existsSync2, mkdirSync as mkdirSync2, readFileSync, writeFileSync as writeFileSync2 } from "node:fs";
import { Buffer } from "node:buffer";

// src/templates/css.ts
var styleCss = `/* Adapted from https://github.com/kevquirk/simple.css */

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
var highlightThemeCss = `/*
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

// src/templates/svelte.ts
function getPageSvelte(example) {
  if (example) {
    return `<script lang="ts">
  import type { PageProps } from "./$types";
  import Chart from "../components/Chart.svelte";
  import Select from "../components/Select.svelte";
  import Radio from "../components/Radio.svelte";
  import getTempChange from "../helpers/getTempChange.ts";
  import Table from "../components/Table.svelte";
  import CodeHighlight from "../components/CodeHighlight.svelte";
  import Highlight from "../components/Highlight.svelte";

  // Data included in the build.
  import tempRegr from "../data/temp-regressions.json";

  // Data fetched by the server/client from +page.ts
  const { data } = $props();
  const { temp } = data;

  let city = $state("Montreal");
  const cities = tempRegr.map((d) => d.city);

  let testRadioInput = $state("option1");
<\/script>

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
    formatY: (d) => \\\`\\\${d}\xB0C\\\`,
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
  } else {
    return `<h1>Your new project</h1>
<p>Time to create something amazing.</p>`;
  }
}
function getLayoutSvelte(example, pages) {
  if (example) {
    return `<script>
  ${pages ? 'import { base } from "$app/paths";\n' : ""}let { children } = $props();
<\/script>

<svelte:head>
  ${pages ? '<link rel="stylesheet" href="{base}/style.css" />\n<link rel="stylesheet" href="{base}/highlight-theme.css" />' : '<link rel="stylesheet" href="./style.css" />\n<link rel="stylesheet" href="./highlight-theme.css" />'}

  
</svelte:head>

<header>
  <nav>
    ${pages ? "<a href={`${base}/`}>Home</a>" : '<a href="/">Home</a>'}
    <a href="https://github.com/nshiab/simple-data-analysis" target="_blank">About</a>
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
  } else {
    return `<script>
  let { children } = $props();
<\/script>

<svelte:head>
  <link rel="stylesheet" href="./style.css" />
  <link rel="stylesheet" href="./highlight-theme.css" />
</svelte:head>

<main>
  {@render children()}
</main>
`;
  }
}
var tableSvelte = `<script lang="ts">
    let { data }: { data: { [key: string]: unknown }[] } = $props();
    let columns = ["row", ...Object.keys(data[0])];

    let startRow = $state(0);
    let endRow = $state(4);
    let rows = $derived(
        data
            .map((row, i) => [i, ...Object.values(row)])
            .slice(startRow, endRow + 1),
    );
<\/script>

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
var selectSvelte = `<script lang="ts">
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
<\/script>

<label for={id}>{label}</label>
<select {id} name={id} bind:value>
    {#each options as opt}
        <option value={opt}>{opt}</option>
    {/each}
</select>
`;
var radioSvelte = `<script lang="ts">
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
<\/script>

<div style="display: flex; align-items: center; gap: 20px;">
    <p style="margin: 0;">{label}</p>
    {#each values as val, i}
        <label for={name + '-' + i} style="transform: translateY(2px);">
            <input
                type="radio"
                {name}
                id={name + '-' + i}
                value={val}
                bind:group={value}
            />
            {val}</label
        >
    {/each}
</div>
`;
var CodeHighlightSvelte = `<script lang="ts">
    import hljs from "highlight.js/lib/core";
    import typescript from "highlight.js/lib/languages/typescript";

    let { code, filename }: { code: string; filename: string } = $props();

    hljs.registerLanguage("typescript", typescript);

    function addCode(node: Element, code: string) {
        node.innerHTML =
            "
" +
            hljs
                .highlight(code, {
                    language: "typescript",
                })
                .value.trim();
    }
<\/script>

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
var highlightSvelte = `<script lang="ts">
    let { text, background, color } = $props();
<\/script>

<span
    style={"background-color: " + background + "; color: " + color + "; padding: 1px 5px; border-radius: 4px; font-weight: 600;"}
>
    {text}
</span>`;
var chartSvelte = `<script lang="ts">
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
            throw new Error("City " + city + " not found in tempRegr.");
        }
        const x1 = tempCity[0].decade;
        const x2 = tempCity[tempCity.length - 1].decade;
        const y1 = regressionCity.yIntercept + x1 * regressionCity.slope;
        const y2 = regressionCity.yIntercept + x2 * regressionCity.slope;
        const regressionLine = [
            { decade: x1, meanTemp: y1 },
            { decade: x2, meanTemp: y2 },
        ];

        const caption = "Mean temperature per decade in " + city + ". Linear regression: y = " + regressionCity.slope + "x + " + regressionCity.yIntercept + ", R\xB2 = " + regressionCity.r2;

        const chart = plot({
            width,
            x: { label: "Time", tickFormat: (d) => String(d) },
            y: {
                label: "Temperature",
                tickFormat: (d) => d + "\xB0C",
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
<\/script>

{#key [city, width]}
    <div
        style="width: 100%;"
        bind:clientWidth={width}
        use:makeChart={{ city, temp, tempRegr, width }}
    ></div>
{/key}`;
var pageTs = `// Types automatically generated by SvelteKit.
import type { PageLoad } from "./$types";
// Custom types.
import type { tempT } from "$lib";

export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch("/temp.json");
  const temp = await res.json() as tempT;

  return { temp };
};
`;
var layoutTs = `export const prerender = true;
export const trailingSlash = "always";`;
function getLibIndexTs(example) {
  if (example) {
    return `// place files you want to import through the $lib alias in this folder.

type cityT = string;

type tempT = { city: string; decade: number; meanTemp: number }[];

type tempRegrT = {
    city: string;
    slope: number;
    yIntercept: number;
    r2: number;
}[];

export type { cityT, tempRegrT, tempT };`;
  } else {
    return `// place files you want to import through the $lib alias in this folder.`;
  }
}
var getTempChangeTs = `// It's important to use the 'web' entrypoint since this is running in the browser.
import { formatNumber } from "@nshiab/journalism/web";
import type { tempRegrT } from "../lib/index.ts";

export default function getTempChange(
  city: string,
  tempRegr: tempRegrT,
): string {
  const cityRegression = tempRegr.find((r) => r.city === city);

  if (cityRegression === undefined) {
    throw new Error("City " + city + " not found in tempRegr.");
  }

  const slopPerDecade = cityRegression.slope * 10;

  return formatNumber(slopPerDecade, { decimals: 3, suffix: "\xB0C" });
}
`;
var appDTs = `// See https://svelte.dev/docs/kit/types#app.d.ts
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
var appHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
`;

// src/templates/configs.ts
var viteConfigTs = `import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
});
`;
var tsconfigJson = `{
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
function getSvelteConfigJs(pages) {
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
var deployYml = `name: Deploy to GitHub Pages

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
var svelteGitignore = `node_modules

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
var baseGitignore = `# Added by setup-sda
node_modules
.tmp
.sda-cache
.journalism-cache
sda/data
.env
.DS_Store`;
function getMainTs(example, svelte) {
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
function getCrunchDataTs(svelte) {
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
    formatY: (d) => \\\`\\\${d}\xB0C\\\`,
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
var baseTsconfigJson = `{
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

// src/actions/svelte.ts
async function setupSvelte(args, runtime, execSync) {
  if (!args.includes("--svelte")) return;
  const example = args.includes("--example");
  console.log("\n2 - Creating relevant files...");
  if (runtime === "nodejs") {
    if (existsSync2("package.json")) {
      const current = JSON.parse(readFileSync("package.json", "utf-8"));
      current.scripts = {
        ...current.scripts,
        dev: "vite dev",
        build: "vite build",
        preview: "vite preview",
        check: "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
        "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
        sda: "node " + (args.includes("--env") ? "--env-file=.env " : "") + "--experimental-strip-types --no-warnings --watch sda/main.ts",
        clean: "rm -rf .sda-cache && rm -rf .journalism-cache && rm -rf .tmp"
      };
      writeFileSync2("package.json", JSON.stringify(current, null, 2));
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
      writeFileSync2("package.json", JSON.stringify(pkg, null, 2));
    }
    if (!existsSync2("tsconfig.json")) writeFileSync2("tsconfig.json", tsconfigJson);
    if (!existsSync2("vite.config.ts")) writeFileSync2("vite.config.ts", viteConfigTs);
    if (!existsSync2("svelte.config.js")) writeFileSync2("svelte.config.js", getSvelteConfigJs(args.includes("--pages")));
  } else if (runtime === "bun") {
    if (existsSync2("package.json")) {
      const current = JSON.parse(readFileSync("package.json", "utf-8"));
      current.scripts = {
        ...current.scripts,
        dev: "vite dev",
        build: "vite build",
        preview: "vite preview",
        check: "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
        "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
        sda: "bun --watch sda/main.ts",
        clean: "rm -rf .sda-cache && rm -rf .journalism-cache && rm -rf .tmp"
      };
      writeFileSync2("package.json", JSON.stringify(current, null, 2));
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
      writeFileSync2("package.json", JSON.stringify(pkg, null, 2));
    }
    if (!existsSync2("tsconfig.json")) writeFileSync2("tsconfig.json", tsconfigJson);
    if (!existsSync2("vite.config.ts")) writeFileSync2("vite.config.ts", viteConfigTs);
    if (!existsSync2("svelte.config.js")) writeFileSync2("svelte.config.js", getSvelteConfigJs(args.includes("--pages")));
  } else if (runtime === "deno") {
    const denoJson = {
      tasks: {
        "dev": "vite dev",
        "build": "vite build",
        "preview": "vite preview",
        "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
        "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
        sda: "deno run " + (args.includes("--env") ? "--env-file " : "") + "--node-modules-dir=auto -A --watch --check sda/main.ts",
        clean: "rm -rf .sda-cache && rm -rf .journalism-cache && rm -rf .tmp"
      },
      nodeModulesDir: "auto",
      "unstable": [
        "sloppy-imports",
        "fmt-component"
      ],
      "lint": {
        "rules": {
          "exclude": [
            "no-sloppy-imports"
          ]
        }
      },
      "imports": {
        "$lib": "./src/lib/index.ts",
        "$lib/": "./src/lib/"
      },
      "compilerOptions": {
        "rootDirs": [
          ".",
          "./.svelte-kit/types"
        ],
        "verbatimModuleSyntax": true,
        "lib": [
          "esnext",
          "DOM",
          "DOM.Iterable",
          "deno.ns"
        ],
        "types": [
          "./.svelte-kit/ambient.d.ts",
          "./.svelte-kit/non-ambient.d.ts"
        ]
      }
    };
    if (existsSync2("deno.json")) {
      const current = JSON.parse(readFileSync("deno.json", "utf-8"));
      current.tasks = {
        ...current.tasks,
        ...denoJson.tasks
      };
      writeFileSync2("deno.json", JSON.stringify(current, null, 2));
    } else {
      writeFileSync2("deno.json", JSON.stringify(denoJson, null, 2));
    }
    if (!existsSync2("tsconfig.json")) writeFileSync2("tsconfig.json", tsconfigJson);
    if (!existsSync2("vite.config.ts")) writeFileSync2("vite.config.ts", viteConfigTs);
    if (!existsSync2("svelte.config.js")) writeFileSync2("svelte.config.js", getSvelteConfigJs(args.includes("--pages")));
  }
  if (existsSync2(".gitignore")) {
    const current = readFileSync(".gitignore", "utf-8");
    writeFileSync2(".gitignore", current + "\n\n# Added by setup-sda\n" + svelteGitignore);
  } else {
    writeFileSync2(".gitignore", svelteGitignore);
  }
  if (!existsSync2(".svelte-kit")) mkdirSync2(".svelte-kit", {
    recursive: true
  });
  writeFileSync2(".svelte-kit/ambient.d.ts", "");
  writeFileSync2(".svelte-kit/non-ambient.d.ts", "");
  if (!existsSync2("static")) mkdirSync2("static", {
    recursive: true
  });
  writeFileSync2("static/style.css", styleCss);
  writeFileSync2("static/highlight-theme.css", highlightThemeCss);
  try {
    const res = await fetch("https://svelte.dev/favicon.png");
    const arrayBuffer = await res.arrayBuffer();
    writeFileSync2("static/favicon.png", Buffer.from(arrayBuffer));
  } catch (e) {
    console.error("    => static/favicon.png could not be created.");
  }
  if (example) writeFileSync2("static/temp.json", JSON.stringify([]));
  if (!existsSync2("src")) mkdirSync2("src", {
    recursive: true
  });
  writeFileSync2("src/app.html", appHtml);
  writeFileSync2("src/app.d.ts", appDTs);
  if (!existsSync2("src/routes")) mkdirSync2("src/routes", {
    recursive: true
  });
  writeFileSync2("src/routes/+page.svelte", getPageSvelte(example));
  if (example) writeFileSync2("src/routes/+page.ts", pageTs);
  writeFileSync2("src/routes/+layout.ts", layoutTs);
  writeFileSync2("src/routes/+layout.svelte", getLayoutSvelte(example, args.includes("--pages")));
  if (!existsSync2("src/lib")) mkdirSync2("src/lib", {
    recursive: true
  });
  writeFileSync2("src/lib/index.ts", getLibIndexTs(example));
  if (!existsSync2("src/helpers")) mkdirSync2("src/helpers", {
    recursive: true
  });
  if (example) writeFileSync2("src/helpers/getTempChange.ts", getTempChangeTs);
  if (!existsSync2("src/components")) mkdirSync2("src/components", {
    recursive: true
  });
  writeFileSync2("src/components/Table.svelte", tableSvelte);
  writeFileSync2("src/components/Select.svelte", selectSvelte);
  writeFileSync2("src/components/Radio.svelte", radioSvelte);
  writeFileSync2("src/components/CodeHighlight.svelte", CodeHighlightSvelte);
  writeFileSync2("src/components/Highlight.svelte", highlightSvelte);
  if (example) writeFileSync2("src/components/Chart.svelte", chartSvelte);
  if (!existsSync2("src/data")) mkdirSync2("src/data", {
    recursive: true
  });
  if (!existsSync2("sda")) mkdirSync2("sda", {
    recursive: true
  });
  writeFileSync2("sda/main.ts", getMainTs(example, true));
  if (!existsSync2("sda/helpers")) mkdirSync2("sda/helpers", {
    recursive: true
  });
  if (example) writeFileSync2("sda/helpers/crunchData.ts", getCrunchDataTs(true));
  if (!existsSync2("sda/data")) mkdirSync2("sda/data", {
    recursive: true
  });
  if (example) writeFileSync2("sda/data/temp.csv", "city,decade,meanTemp\nToronto,1840.0,7.1");
  if (!existsSync2("sda/output")) mkdirSync2("sda/output", {
    recursive: true
  });
  if (args.includes("--pages")) {
    if (!existsSync2(".github")) mkdirSync2(".github", {
      recursive: true
    });
    if (!existsSync2(".github/workflows")) mkdirSync2(".github/workflows", {
      recursive: true
    });
    writeFileSync2(".github/workflows/deploy.yml", deployYml);
  }
  if (args.includes("--env") && !existsSync2(".env")) writeFileSync2(".env", "");
  const installCmds = {
    nodejs: [
      "npm i @sveltejs/adapter-auto @sveltejs/adapter-static @sveltejs/kit @sveltejs/vite-plugin-svelte svelte svelte-check typescript vite highlight.js @observablehq/plot --save-dev",
      "npx jsr add @nshiab/simple-data-analysis @nshiab/journalism"
    ],
    bun: [
      "bun add @sveltejs/adapter-auto @sveltejs/adapter-static @sveltejs/kit @sveltejs/vite-plugin-svelte svelte svelte-check typescript vite highlight.js @observablehq/plot --dev",
      "bunx jsr add @nshiab/simple-data-analysis @nshiab/journalism"
    ],
    deno: [
      "deno install --node-modules-dir=auto --dev --allow-scripts=npm:@sveltejs/kit npm:@sveltejs/adapter-auto npm:@sveltejs/adapter-static npm:@sveltejs/kit npm:@sveltejs/vite-plugin-svelte npm:svelte npm:svelte-check npm:typescript npm:vite npm:highlight.js npm:@observablehq/plot jsr:@nshiab/simple-data-analysis jsr:@nshiab/journalism"
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
  installCmds[runtime].forEach((cmd) => execSync(cmd));
}

// src/actions/base.ts
import { existsSync as existsSync3, mkdirSync as mkdirSync3, readFileSync as readFileSync2, writeFileSync as writeFileSync3 } from "node:fs";
async function setupBase(args, runtime, execSync) {
  if (args.includes("--svelte")) return;
  const example = args.includes("--example");
  const readme = "This repository has been created with [setup-sda](https://github.com/nshiab/setup-sda/).\n\nIt's using [simple-data-analysis](https://github.com/nshiab/simple-data-analysis) and [journalism](https://github.com/nshiab/journalism).\n\nHere's the recommended workflow:\n\n- Put your raw data in the `sda/data` folder. Note that this folder is gitignored.\n- Use the `sda/main.ts` file to clean and process your raw data. Write the results to the `sda/output` folder.\n\nWhen working on your project, use the following command:\n\n- `" + (runtime === "deno" ? "deno task" : "npm run") + " sda` will watch your `sda/main.ts` and its dependencies. Everytime you'll save some changes, the data will be reprocessed.\n";
  console.log("\n2 - Creating relevant files...");
  if (runtime === "nodejs" || runtime === "bun") {
    const pkg = {
      type: "module",
      scripts: {
        sda: "node " + (args.includes("--env") ? "--env-file=.env " : "") + "--experimental-strip-types --no-warnings --watch sda/main.ts",
        clean: "rm -rf .sda-cache && rm -rf .journalism-cache && rm -rf .tmp"
      }
    };
    if (runtime === "bun") pkg.scripts.sda = "bun --watch sda/main.ts";
    writeFileSync3("package.json", JSON.stringify(pkg, null, 2));
    writeFileSync3("tsconfig.json", baseTsconfigJson);
  } else {
    const deno = {
      tasks: {
        sda: "deno run " + (args.includes("--env") ? "--env-file " : "") + "--node-modules-dir=auto -A --watch --check sda/main.ts",
        clean: "rm -rf .sda-cache && rm -rf .journalism-cache && rm -rf .tmp"
      },
      nodeModulesDir: "auto"
    };
    writeFileSync3("deno.json", JSON.stringify(deno, null, 2));
  }
  if (existsSync3(".gitignore")) {
    const current = readFileSync2(".gitignore", "utf-8");
    writeFileSync3(".gitignore", current + "\n" + baseGitignore);
  } else {
    writeFileSync3(".gitignore", baseGitignore);
  }
  if (!existsSync3("sda")) mkdirSync3("sda", {
    recursive: true
  });
  writeFileSync3("sda/main.ts", getMainTs(example, false));
  if (!existsSync3("sda/helpers")) mkdirSync3("sda/helpers", {
    recursive: true
  });
  if (example) writeFileSync3("sda/helpers/crunchData.ts", getCrunchDataTs(false));
  if (!existsSync3("sda/data")) mkdirSync3("sda/data", {
    recursive: true
  });
  if (example) writeFileSync3("sda/data/temp.csv", "city,decade,meanTemp\nToronto,1840.0,7.1");
  if (!existsSync3("sda/output")) mkdirSync3("sda/output", {
    recursive: true
  });
  if (!existsSync3("README.md")) writeFileSync3("README.md", readme);
  if (args.includes("--env") && !existsSync3(".env")) writeFileSync3(".env", "");
  const installCmds = {
    nodejs: [
      "npx jsr add @nshiab/simple-data-analysis @nshiab/journalism",
      "npm i @observablehq/plot"
    ],
    bun: [
      "bunx jsr add @nshiab/simple-data-analysis @nshiab/journalism",
      "bun add @observablehq/plot"
    ],
    deno: [
      "deno install --node-modules-dir=auto jsr:@nshiab/simple-data-analysis jsr:@nshiab/journalism npm:@observablehq/plot"
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
  installCmds[runtime].forEach((cmd) => execSync(cmd));
  if (args.includes("--git")) {
    console.log("\n4 - Initializing Git repository...");
    execSync("git init && git add -A && git commit -m 'Setup done'");
  }
  console.log("\nSetup is done!\n");
}

// src/main.ts
async function main() {
  const args = process.argv.slice(2);
  const isTest = args.includes("--test");
  const runtime = getRuntime();
  const execSync = createExecSync(isTest);
  console.log("\nStarting sda setup...");
  console.log("\n1 - Checking runtime and options...");
  console.log(`    => Your navigator userAgent is: ${navigator.userAgent}`);
  const flags = [
    "--test",
    "--git",
    "--scrape",
    "--pages",
    "--env",
    "--claude",
    "--gemini",
    "--copilot",
    "--agent",
    "--svelte",
    "--example"
  ];
  flags.forEach((flag) => {
    if (args.includes(flag)) {
      console.log(`    => You passed the option ${flag}`);
    }
  });
  if (args.includes("--pages") && !args.includes("--svelte")) {
    console.log(`    => You passed the option --pages, but it only works with --svelte`);
  }
  await setupAgents(args);
  if (args.includes("--svelte")) {
    await setupSvelte(args, runtime, execSync);
  } else {
    await setupBase(args, runtime, execSync);
  }
  if (args.includes("--pages") && args.includes("--svelte")) {
    console.log("PS: Don't forget to enable GitHub Pages in your repository settings.\n");
  }
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
