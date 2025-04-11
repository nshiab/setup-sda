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

If you want an example, pass the `--example` flag.

```
# Deno >= 2.2.x
deno -A jsr:@nshiab/setup-sda --example

# Node.js >= 22.6.x
npx setup-sda --example

# Bun
bunx --bun setup-sda --example
```

If you want to install web scraping dependencies, pass the `--scrape` flag.

```
# Deno >= 2.2.x
deno -A jsr:@nshiab/setup-sda --scrape

# Node.js >= 22.6.x
npx setup-sda --scrape

# Bun
bunx --bun setup-sda --scrape
```

If you want to use SDA with [Svelte](https://svelte.dev/), pass the `--svelte`
flag.

If a `sda` folder is already set up in your repository, this command won't touch
it but will overwrite the `deno.json`/`package.json` to make sure everything
works. Your `.gitignore` file will have new entries added to it.

```
# Deno >= 2.2.x
deno -A jsr:@nshiab/setup-sda --svelte

# Node.js >= 22.6.x
npx setup-sda --svelte

# Bun
bunx --bun setup-sda --svelte
```

If you want to use SDA with [Svelte](https://svelte.dev/) and install web
scraping dependencies, pass the `--svelte` and `--scrape` flags.

```
# Deno >= 2.2.x
deno -A jsr:@nshiab/setup-sda --svelte --scrape

# Node.js >= 22.6.x
npx setup-sda --svelte --scrape

# Bun
bunx --bun setup-sda --svelte --scrape
```

If you want an example with Svelte, pass the `--svelte` and `--example` flags.

```
# Deno >= 2.2.x
deno -A jsr:@nshiab/setup-sda --svelte --example

# Node.js >= 22.6.x
npx setup-sda --svelte --example

# Bun
bunx --bun setup-sda --svelte --example
```

If you want to use SDA with
[Framework](https://github.com/observablehq/framework), pass the `--framework`
flag. If SDA is already set up in your repository, this command will add
Framework without overwriting your existing files.

```
# Deno >= 2.2.x
deno -A jsr:@nshiab/setup-sda --framework

# Node.js >= 22.6.x
npx setup-sda --framework

# Bun
bunx --bun setup-sda --framework
```

To initialize a git repository, pass the `--git` flag.
