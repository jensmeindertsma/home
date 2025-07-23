import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { readdir, stat } from "node:fs/promises";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(async () => {
  const entries = await readdir("content");

  const directories = (
    await Promise.all(
      entries.map(async (entry) => {
        try {
          await stat(`content/${entry}/images`);

          return entry;
        } catch {
          return null;
        }
      }),
    )
  ).filter((directory): directory is string => {
    return Boolean(directory);
  });

  const targets = directories.map((entry) => {
    return {
      src: `content/${entry}/images/*`,
      dest: entry,
    };
  });

  return {
    plugins: [
      reactRouter(),
      tailwindcss(),
      tsconfigPaths(),
      viteStaticCopy({
        targets,
      }),
    ],
  };
});
