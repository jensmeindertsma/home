import type { Config } from "@react-router/dev/config";
import { readdir } from "node:fs/promises";

export default {
  ssr: true,
  async prerender() {
    const entries = await readdir("content");

    return ["/", ...entries];
  },
} satisfies Config;
