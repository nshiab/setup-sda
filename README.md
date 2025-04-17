The library is maintained by [Nael Shiab](http://naelshiab.com/), computational
journalist and senior data producer for [CBC News](https://www.cbc.ca/news).

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

- `--example`: adds example files
- `--scrape`: adds web scraping dependencies
- `--svelte`: adds a Svelte project
- `--pages`: adds a GitHub Pages Actions workflow (works just with `--svelte`)
- `--git`: initializes a git repository and commits the initial files

You can combine options, for example, this will install web scraping
dependencies, set up a Svelte project with example files, initialize a git
repository and make a first commit, and add a GitHub Pages Actions workflow:

```
deno -A jsr:@nshiab/setup-sda --scrape --svelte --example --pages --git
```
