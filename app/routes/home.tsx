import type { Route } from "./+types/home";
import { parseDetails } from "~/services/content.server";
import { readdir, readFile } from "node:fs/promises";
import { Link } from "react-router";

export default function Home({
  loaderData: { entries },
}: Route.ComponentProps) {
  return (
    <>
      <header className="mb-12 flex flex-col gap-8 md:mb-12 md:flex-row md:gap-12">
        <img src="/me.jpg" className="md:w-80" />

        <div className="flex flex-col justify-start gap-6 md:gap-10">
          <h1 className="font-mono text-5xl font-bold">
            <span className="mb-2 block">Jens</span>
            <span>Meindertsma</span>
          </h1>

          <a
            href="https://github.com/jensmeindertsma"
            className="flex flex-row p-6 md:p-0"
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
            <span className="mr-4 self-center font-mono text-2xl font-bold underline decoration-3 md:mr-0">
              ABOUT ME
            </span>
          </a>
        </div>
      </header>
      <main>
        <nav>
          <ul className="flex flex-col gap-5 font-mono">
            {entries.map(({ path, date, title, icon, ...entry }) => {
              const formattedDate = new Intl.DateTimeFormat("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }).format(date);

              const tags = [];

              if (entry.category === "posts") {
                tags.push(formatTag(entry.category, "bg-blue-500"));
              } else {
                tags.push(
                  formatTag(entry.category, "bg-green-600"),
                  formatTag(entry.difficulty, "bg-red-400"),
                );
              }

              tags.push(formatTag(formattedDate, "bg-violet-400"));

              function formatTag(text: string, color: string) {
                return (
                  <span
                    key={text}
                    className={`rounded-md pt-1 pr-2 pb-1 pl-2 font-mono text-xs text-black italic ${color}`}
                  >
                    {text}
                  </span>
                );
              }

              if (
                entry.category === "challenges" ||
                entry.category == "machines" ||
                entry.category === "sherlocks"
              ) {
                title = `${title} (HackTheBox)`;
              }

              return (
                <li key={path}>
                  <Link to={path} className="flex flex-row p-4">
                    <img
                      src={`/icons/${icon}.png`}
                      className="mt-auto mr-6 mb-auto w-12"
                    />
                    <div>
                      <span className="mb-2 block underline">{title}</span>
                      <div className="mt-1 flex flex-row flex-wrap gap-2 text-nowrap">
                        {tags}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
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

    const details = parseDetails(file);

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
