To quickly get started with
[simple-data-analysis](https://github.com/nshiab/simple-data-analysis), create a
folder and run:

```
# Node.js
npx setup-sda

# Bun
bunx --bun setup-sda

# Deno
deno run -A jsr:@nshiab/setup-sda
```

There are two options:

- _--js_ : To use JavaScript instead of TypeScript.
- _--force_ : To force the creation of files even if the folder is not
  empty.

The script will:

- Make sure that the folder is empty (unless you passed the option _--force_).

- Check your runtime (Node.js, Bun, or Deno).

- If you use Node.js:

  - If it's >= 22.6.x, it will create an `src/main.ts` and `tsconfig.json` (unless
    you passed the option _--js_)
  - If it's < 22.6.x, it will create an `src/main.js`

- If you use Bun or Deno, it will create an `index.ts` (unless you passed the
  option _--js_)

- Create `data/temp.csv` with some data.

- If you use Node.js or Bun, it will create a `package.json` with two scripts:

  - `npm run sda` to run and watch `src/main.ts` or `src/main.js`
  - `npm run clean` to remove the folders `.sda-cache` (used by methods like
    [cache](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#cache))
    and `.temp` (used by [duckdb-node](https://github.com/duckdb/duckdb-node)
    when there is not enough RAM).

- If you use Deno, it will create a `deno.json` with two tasks:

  - `deno task sda` to run and watch `src/main.ts`
  - `deno task clean` to remove the folders `.sda-cache` and `.temp`

- Install the libraries (with NPM, Bun, or JSR, depending on the runtime):

  - [simple-data-analysis](https://github.com/nshiab/simple-data-analysis)
  - [journalism](https://github.com/nshiab/journalism)

- Create a `.gitignore` file with:
  - `node_modules`
  - `.temp`
  - `.sda-cache`
