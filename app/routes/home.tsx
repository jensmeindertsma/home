import type { Route } from "./+types/home";
import Markdoc from "@markdoc/markdoc";
import { parseDetails } from "~/services/content.server";
import { readdir, readFile } from "node:fs/promises";
import { Link } from "react-router";

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <h1>Jens Meindertsma</h1>
      <p>Welcome to my website!</p>

      <ul>
        {loaderData.entries.map(({ path, icon, title, category, date }) => (
          <li key={path}>
            <Link to={path}>
              {icon} {title} ({category}) ({date.toDateString()})
            </Link>
          </li>
        ))}
      </ul>
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
