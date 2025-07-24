import type { Route } from "./+types/home";
import { Footer } from "~/components/footer";
import { parseFrontmatter } from "~/services/content.server";
import { readdir, readFile } from "node:fs/promises";
import { Link } from "react-router";

export default function Home({ loaderData: content }: Route.ComponentProps) {
  return (
    <>
      <header className="mb-8 flex flex-col gap-8 md:flex-row">
        <Link to="/" className="w-full md:w-80">
          <img src="/me.jpg" className="w-full" />
        </Link>

        <div className="font-mono text-5xl font-bold">
          <span className="block">Jens</span>
          <span>Meindertsma</span>
          <p className="mt-5 text-2xl underline decoration-red-500 decoration-2">
            Certified cybersecurity specialist
          </p>
        </div>
      </header>
      <main className="flex-1">
        <nav>
          <ul>
            {content
              .sort(
                (a, b) =>
                  b.frontmatter.date.getTime() - a.frontmatter.date.getTime(),
              )
              .map((entry) => (
                <li key={entry.path} className="mb-5">
                  <Link to={entry.path}>
                    <span className="decoration-red block text-xl font-bold underline">
                      {entry.frontmatter.name}
                    </span>
                    <span className="font-mono">
                      <span>
                        {new Intl.DateTimeFormat("nl-NL", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }).format(new Date(entry.frontmatter.date))}
                      </span>{" "}
                      <span className="font-bold text-red-500">|</span>{" "}
                      <span>{entry.frontmatter.kind}</span>{" "}
                      {entry.frontmatter.kind === "lab" ? (
                        <>
                          <span className="font-bold text-red-500">|</span>{" "}
                          <span>{entry.frontmatter.platform}</span>
                        </>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </main>
      <Footer />
    </>
  );
}

export async function loader() {
  const paths = await readdir("content");

  const entries = await Promise.all(
    paths.map(async (entry) => {
      const source = await readFile(`content/${entry}/${entry}.md`, "utf-8");

      return {
        path: `/${entry}`,
        frontmatter: await parseFrontmatter(source),
      };
    }),
  );

  return entries;
}
