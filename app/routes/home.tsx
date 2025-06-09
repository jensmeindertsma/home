import Markdoc from "@markdoc/markdoc";
import { parseDetails } from "~/services/content.server";
import { readdir, readFile } from "node:fs/promises";

export default function Home() {
  return (
    <>
      <img src="/me.jpg" />
      <h1 className="mt-6 font-mono text-5xl font-bold">
        <span className="mb-2 block">Jens</span>
        <span>Meindertsma</span>
      </h1>

      <a
        href="https://github.com/jensmeindertsma"
        className="mt-6 flex h-24 flex-row justify-center p-4 font-mono text-xl font-bold"
      >
        <picture className="w-16">
          <source
            srcSet="/github-light.png"
            media="(prefers-color-scheme: dark)"
          />
          <img src="/github-dark.png" className="block h-16" />
        </picture>
        <span className="ml-8 flex h-full items-center">{"=>"}</span>
        <span className="ml-8 flex h-full items-center underline decoration-2">
          {" "}
          ABOUT ME
        </span>
      </a>

      {/*
      <ul>
        {loaderData.entries.map(({ path, icon, title, category, date }) => (
          <li key={path}>
            <Link to={path}>
              <img src={`/icons/${icon}.png`} /> {title} ({category}) (
              {date.toDateString()})
            </Link>
          </li>
        ))}
      </ul>
       */}
    </>
  );
}

export async function loader() {
  const entries = [];

  for (const entry of await readdir("content", { withFileTypes: true })) {
    const file = await readFile(`content/${entry.name}/${entry.name}.md`, {
      encoding: "utf8",
    });

    const ast = Markdoc.parse(file);

    const details = parseDetails(ast);

    entries.push({
      path: `/${entry.name}`,
      ...details,
    });
  }

  entries.sort((a, b) => b.date.getTime() - a.date.getTime());

  return {
    entries,
  };
}
