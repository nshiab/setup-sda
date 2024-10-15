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
# Deno >= 2.x.x
deno -A jsr:@nshiab/setup-sda

# Node.js >= 22.6.x
npx setup-sda

# Bun
bunx --bun setup-sda
```

If you want to use SDA with
[Framework](https://github.com/observablehq/framework), pass the `--framework`
flag:

```
# Deno >= 2.x.x
deno -A jsr:@nshiab/setup-sda --framework

# Node.js >= 22.6.x
npx setup-sda --framework

# Bun
bunx --bun setup-sda --framework
```

To initialize a git repository, pass the `--git` flag.
