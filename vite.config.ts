import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { readdir, stat } from "node:fs/promises";
import { defineConfig } from "vite";
import type { Target } from "vite-plugin-static-copy";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    reactRouter(),
    tailwindcss(),
    tsconfigPaths(),
    viteStaticCopy({
      targets: [...(await prepareTargets())],
    }),
  ],
});

async function prepareTargets(): Promise<Target[]> {
  const entries = await readdir("content", {
    withFileTypes: true,
  });

  const targets = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      throw new Error("Invalid content entry (should be directory)");
    }

    let images;

    try {
      images = await stat(`content/${entry.name}/images`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      continue;
    }

    if (images && images.isDirectory()) {
      targets.push({
        src: `content/${entry.name}/images/*`,
        dest: entry.name,
      });
    }
  }

  return targets;
}
