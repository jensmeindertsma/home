import Markdoc, { type Config } from "@markdoc/markdoc";
import yaml from "js-yaml";
import { z } from "zod/v4";

export function parseDetails(source: string) {
  const ast = Markdoc.parse(source);

  try {
    return Details.parse(yaml.load(ast.attributes.frontmatter));
  } catch (error) {
    throw new Error(`Invalid frontmatter: ${error}`);
  }
}

export function parseDocument(source: string) {
  const ast = Markdoc.parse(source);

  const config: Config = {
    nodes: {
      paragraph: {
        render: "Paragraph",
      },
    },
  };

  const content = Markdoc.transform(ast, config);

  try {
    return {
      content,
      details: Details.parse(yaml.load(ast.attributes.frontmatter)),
    };
  } catch (error) {
    throw new Error(`Invalid document: ${error}`);
  }
}

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
