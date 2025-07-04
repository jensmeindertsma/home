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

export function parseDocument({
  source,
  name,
}: {
  source: string;
  name: string;
}) {
  const ast = Markdoc.parse(source);

  const details = Details.parse(yaml.load(ast.attributes.frontmatter));

  const config: Config = {
    nodes: {
      blockquote: {
        render: "Blockquote",
      },

      code: {
        render: "Code",
        attributes: {
          content: { type: String, required: true },
        },
      },

      fence: {
        render: "Fence",
        attributes: {
          language: { type: String, required: true },
          content: { type: String, required: true },
        },
      },

      heading: {
        render: "Heading",
        attributes: {
          level: { type: String, required: true },
        },
      },

      image: {
        transform(node, config) {
          const attributes = node.transformAttributes(config);
          return new Markdoc.Tag("Image", {
            ...attributes,
            src: node.attributes.src.replace(/\.\/images/, `/${name}`),
          });
        },
      },

      item: {
        render: "Item",
      },

      link: {
        render: "MarkupLink",
        attributes: {
          href: { type: String, required: true },
          title: { type: String, required: true },
        },
      },

      list: {
        render: "List",
        attributes: {
          ordered: { type: Boolean, required: true },
        },
      },

      paragraph: {
        render: "Paragraph",
      },
    },
  };

  const content = Markdoc.transform(ast, config);

  try {
    return {
      content,
      details,
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
    os: z.string(),
  }),

  z.object({
    ...base,
    category: z.enum(["challenges", "sherlocks"]),
    difficulty: z.enum(["very-easy", "easy", "medium", "hard", "insane"]),
  }),
]);
