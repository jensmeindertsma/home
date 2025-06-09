import { type Node } from "@markdoc/markdoc";
import yaml from "js-yaml";
import { z } from "zod/v4";

export function parseDetails(ast: Node) {
  const base = {
    title: z.string(),
    icon: z.string(),
    date: z.date(),
  };

  const Details = z.discriminatedUnion("category", [
    z.object({
      ...base,
      category: z.literal("posts"),
    }),

    z.object({
      ...base,
      category: z.literal("machines"),
      difficulty: z.enum(["easy", "medium", "hard", "insane"]),
    }),

    z.object({
      ...base,
      category: z.enum(["challenges", "sherlocks"]),
      difficulty: z.enum(["very-easy", "easy", "medium", "hard", "insane"]),
    }),
  ]);
  return Details.parse(yaml.load(ast.attributes.frontmatter));
}
