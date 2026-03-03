const bundleCommand = new Deno.Command("deno", {
  args: ["bundle", "src/main.ts", "-o", "setup-sda.mjs"],
});

const { success, stderr } = await bundleCommand.output();

if (!success) {
  console.error(new TextDecoder().decode(stderr));
  Deno.exit(1);
}

const content = await Deno.readTextFile("setup-sda.mjs");
await Deno.writeTextFile("setup-sda.mjs", `#!/usr/bin/env node

${content}`);

const chmodCommand = new Deno.Command("chmod", {
  args: ["+x", "setup-sda.mjs"],
});
await chmodCommand.output();

console.log("Build complete!");
