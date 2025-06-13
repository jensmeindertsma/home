import type { Route } from "./+types/content";
import Markdoc from "@markdoc/markdoc";
import { Code, Fence, Image, Paragraph } from "~/components/markup";
import { parseDocument } from "~/services/content.server";
import { readFile } from "node:fs/promises";
import React from "react";
import { Link } from "react-router";

export default function Content({
  loaderData: {
    details: { title, icon, date, ...details },
    content,
  },
}: Route.ComponentProps) {
  if (
    details.category === "challenges" ||
    details.category == "machines" ||
    details.category === "sherlocks"
  ) {
    title = `${title} (HackTheBox)`;
  }

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

  const tags = [];

  if (details.category === "posts") {
    tags.push(formatTag(details.category, "bg-blue-500"));
  } else {
    tags.push(
      formatTag(details.category, "bg-green-600"),
      formatTag(details.difficulty, "bg-red-400"),
    );
  }

  tags.push(formatTag(formattedDate, "bg-violet-400 "));

  function formatTag(text: string, color: string) {
    return (
      <span
        key={text}
        className={`rounded-md pt-1 pr-2 pb-1 pl-2 font-mono text-xs font-bold text-white ${color}`}
      >
        {text}
      </span>
    );
  }

  return (
    <>
      <header className="mb-10">
        <Link to="/" className="flex flex-row">
          <img src="/avatar.jpg" className="mr-5 w-20" />
          <span className="flex flex-col font-mono text-3xl font-bold">
            <span className="mb-1">Jens</span>
            <span>Meindertsma</span>
          </span>
        </Link>
      </header>
      <div className="mb-3 flex flex-row items-center gap-5 font-mono font-semibold">
        <img src={`/icons/${icon}.png`} className="w-8" />
        <h1 className="text-3xl">{title}</h1>
      </div>
      <div className="mt-5 mb-5 flex flex-row flex-wrap gap-2 text-nowrap sm:mb-10">
        {tags}
      </div>
      {Markdoc.renderers.react(content, React, {
        components: {
          Code,
          Fence,
          Image,
          Paragraph,
        },
      })}
    </>
  );
}

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const source = await readFile(`content/${params.path}/${params.path}.md`, {
      encoding: "utf8",
    });

    return parseDocument({ source, name: params.path as string });
  } catch {
    throw new Response("Content not found", { status: 404 });
  }
}
