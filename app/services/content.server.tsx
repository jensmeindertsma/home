import Markdoc from "@markdoc/markdoc";
import yaml from "yaml";
import z from "zod";

export async function parseFrontmatter(source: string) {
  const ast = Markdoc.parse(source);

  const schema = z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("lab"),
      name: z.string(),
      date: z.coerce.date(),
      difficulty: z.enum(["easy", "medium", "hard", "insane"]),
      platform: z.enum(["linux", "windows"]),
    }),
    z.object({
      kind: z.literal("challenge"),
      name: z.string(),
      date: z.coerce.date(),
      difficulty: z.enum(["very-easy", "easy", "medium", "hard", "insane"]),
    }),
  ]);

  const frontmatter = await schema.parseAsync(
    yaml.parse(ast.attributes.frontmatter),
  );

  return schema.parseAsync(frontmatter);
}
