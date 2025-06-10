import type { Route } from "./+types/content";
import Markdoc from "@markdoc/markdoc";
import { parseDocument } from "~/services/content.server";
import { readFile } from "node:fs/promises";
import React from "react";
import { Link } from "react-router";

export default function Content({
  loaderData: { details, content },
}: Route.ComponentProps) {
  return (
    <>
      <header>
        <Link to="/" className="flex flex-row">
          <img src="/avatar.jpg" className="mr-5 w-20" />
          <span className="flex flex-col font-mono text-3xl font-bold">
            <span className="mb-1">Jens</span>
            <span>Meindertsma</span>
          </span>
        </Link>
      </header>
      <article>
        <img src={`/icons/${details.icon}.png`} />
        <h1>{details.title}</h1>
        <p>Category: {details.category}</p>
        <p>Date: {details.date.toDateString()}</p>
        {Markdoc.renderers.react(content, React)}
      </article>
    </>
  );
}

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const file = await readFile(`content/${params.path}/${params.path}.md`, {
      encoding: "utf8",
    });

    return parseDocument(file);
  } catch {
    throw new Response("Content not found", { status: 404 });
  }
}
