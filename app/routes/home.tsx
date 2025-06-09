import Markdoc from "@markdoc/markdoc";
import { parseDetails } from "~/services/content.server";
import { readdir, readFile } from "node:fs/promises";

export default function Home() {
  return (
    <>
      <header className="flex flex-col gap-5 md:flex-row md:gap-12">
        <img src="/me.jpg" className="md:w-80" />

        <div className="flex flex-col justify-start gap-6 md:gap-10">
          <h1 className="font-mono text-5xl font-bold">
            <span className="mb-2 block">Jens</span>
            <span>Meindertsma</span>
          </h1>

          <a
            href="https://github.com/jensmeindertsma"
            className="flex flex-row p-4 md:p-0"
          >
            <picture className=" ">
              <source
                srcSet="/github-light.png"
                media="(prefers-color-scheme: dark)"
              />
              <img src="/github-dark.png" className="h-16 w-16" />
            </picture>
            <span className="mr-auto ml-auto self-center font-mono text-2xl font-bold md:mr-7 md:ml-7">
              {"=>"}
            </span>
            <span className="self-center font-mono text-2xl font-bold underline decoration-3">
              ABOUT ME
            </span>
          </a>
        </div>
      </header>
      <main>
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
      </main>
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
