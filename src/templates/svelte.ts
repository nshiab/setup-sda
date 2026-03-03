export function getPageSvelte(example: boolean) {
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
  } else {
    return `<h1>Your new project</h1>
<p>Time to create something amazing.</p>`;
  }
}

export function getLayoutSvelte(example: boolean, pages: boolean) {
  if (example) {
    return `<script>
  ${pages ? 'import { base } from "$app/paths";\n' : ""}let { children } = $props();
</script>

<svelte:head>
  ${
      pages
        ? "<link rel=\"stylesheet\" href=\"{base}/style.css\" />\n<link rel=\"stylesheet\" href=\"{base}/highlight-theme.css\" />"
        : "<link rel=\"stylesheet\" href=\"./style.css\" />\n<link rel=\"stylesheet\" href=\"./highlight-theme.css\" />"
    }

  
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
</script>

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

export const tableSvelte = `<script lang="ts">
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

export const selectSvelte = `<script lang="ts">
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

export const radioSvelte = `<script lang="ts">
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

export const CodeHighlightSvelte = `<script lang="ts">
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

export const highlightSvelte = `<script lang="ts">
    let { text, background, color } = $props();
</script>

<span
    style={"background-color: " + background + "; color: " + color + "; padding: 1px 5px; border-radius: 4px; font-weight: 600;"}
>
    {text}
</span>`;

export const chartSvelte = `<script lang="ts">
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

        const caption = "Mean temperature per decade in " + city + ". Linear regression: y = " + regressionCity.slope + "x + " + regressionCity.yIntercept + ", R² = " + regressionCity.r2;

        const chart = plot({
            width,
            x: { label: "Time", tickFormat: (d) => String(d) },
            y: {
                label: "Temperature",
                tickFormat: (d) => d + "°C",
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

export const pageTs = `// Types automatically generated by SvelteKit.
import type { PageLoad } from "./$types";
// Custom types.
import type { tempT } from "$lib";

export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch("/temp.json");
  const temp = await res.json() as tempT;

  return { temp };
};
`;

export const layoutTs = `export const prerender = true;
export const trailingSlash = "always";`;

export function getLibIndexTs(example: boolean) {
  if (example) {
    return `// place files you want to import through the \$lib alias in this folder.

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
    return `// place files you want to import through the \$lib alias in this folder.`;
  }
}

export const getTempChangeTs = `// It's important to use the 'web' entrypoint since this is running in the browser.
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

  return formatNumber(slopPerDecade, { decimals: 3, suffix: "°C" });
}
`;

export const appDTs = `// See https://svelte.dev/docs/kit/types#app.d.ts
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

export const appHtml = `
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
