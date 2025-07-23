import type { Config } from "@react-router/dev/config";
import { readdir } from "node:fs/promises";

export default {
  prerender: async () => {
    const entries = await readdir("content");

    const paths = entries.map((entry) => `/${entry}`);

    return ["/", ...paths];
  },
} satisfies Config;
