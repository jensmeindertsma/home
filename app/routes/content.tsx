import type { Route } from "./+types/content";
import Markdoc from "@markdoc/markdoc";
import { parseDetails } from "~/services/content.server";
import { readFile } from "node:fs/promises";
import React from "react";

export default function Content({
  loaderData: { details, content },
}: Route.ComponentProps) {
  return (
    <>
      <img src={`/icons/${details.icon}.png`} />
      <h1>{details.title}</h1>
      <p>Category: {details.category}</p>
      <p>Date: {details.date.toDateString()}</p>
      {Markdoc.renderers.react(content, React)}
    </>
  );
}

export async function loader({ params }: Route.LoaderArgs) {
  const file = await readFile(`content/${params.path}/${params.path}.md`, {
    encoding: "utf8",
  });
  const ast = Markdoc.parse(file);
  const content = Markdoc.transform(ast);

  return {
    content,
    details: parseDetails(ast),
  };
}
