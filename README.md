The library is maintained by [Nael Shiab](http://naelshiab.com/), computational
journalist and senior data producer at [CBC News](https://www.cbc.ca/news).

You might also find the
[journalism library](https://github.com/nshiab/journalism) and
[Code Like a Journalist](https://github.com/nshiab/code-like-a-journalist)
interesting.

To quickly get started with
[simple-data-analysis](https://github.com/nshiab/simple-data-analysis), create a
folder and run:

```
# Deno >= 2.2.x
deno -A jsr:@nshiab/setup-sda

# Node.js >= 22.6.x
npx setup-sda

# Bun
bunx --bun setup-sda
```

Here are the different options:

- `--claude` or `--gemini` or `--copilot`: Adds a `CLAUDE.md` or `GEMINI.md` or
  `.github/copilot-instructions.md` file and extra documentation in `./docs` to
  work efficiently with AI agents.
- `--example`: Adds example files.
- `--scrape`: Adds web scraping dependencies.
- `--svelte`: Adds a Svelte project.
- `--pages`: Adds a GitHub Pages Actions workflow (works only with `--svelte`).
- `--git`: Initializes a git repository and commits the initial files.
- `--env`: Creates a `.env` file for environment variables and loads them when
  running.

You can combine options. For example, this command will install web scraping
dependencies, set up a Svelte project with example files, initialize a git
repository and make the first commit, add a GitHub Pages Actions workflow, and
create a `.env` file:

```
deno -A jsr:@nshiab/setup-sda --scrape --svelte --example --pages --git --env
```
