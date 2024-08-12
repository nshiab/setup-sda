To quickly get started with [simple-data-analysis](https://github.com/nshiab/simple-data-analysis), create a folder and run:

```
npx setup-sda
```

The options are:

- _--bun_ : To use Bun instead of Node.js.
- _--js_ : To use JavaScript instead of TypeScript.
- _--force_ : To overwrite files like package.json, .gitignore, etc.

The script will:

- Check your Node.js version (unless you passed the option _--bun_)

  - If it's >= 22.6.0, it will create an `index.ts` and `tsconfig.json` (unless you passed the option _--js_)
  - If it's < 22.6.0, it will create an `index.js`

- Create a `package.json` with two scripts:

  - `npm run sda` to run and watch `index.ts` or `index.js`
  - `npm run clean` to remove the folders `.sda-cache` (used by methods like [cache](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#cache)) and `.temp` (used by [duckdb-node](https://github.com/duckdb/duckdb-node) when there is not enough RAM).

- Install the libraries:

  - [simple-data-analysis](https://github.com/nshiab/simple-data-analysis)
  - [journalism](https://github.com/nshiab/journalism)

- Create a `.gitignore` file with:
  - `node_modules`
  - `.temp`
  - `.sda-cache`
