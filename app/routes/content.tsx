import type { Route } from "./+types/content";
import Markdoc from "@markdoc/markdoc";
import { Footer } from "~/components/footer";
import { parseFrontmatter } from "~/services/content.server";
import { access, readFile } from "node:fs/promises";
import React from "react";
import { data, Link } from "react-router";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import style from "react-syntax-highlighter/dist/esm/styles/prism/gruvbox-dark";

export default function Content({
  loaderData: { content, frontmatter },
}: Route.ComponentProps) {
  return (
    <>
      <title>{frontmatter.name}</title>
      <header className="mb-8 flex h-24 w-full flex-row gap-8">
        <Link to="/" className="h-full">
          <img src="/avatar.jpg" className="h-full" />
        </Link>
        <div className="font-mono text-3xl font-bold">
          <span className="block">Jens</span>
          <span>Meindertsma</span>
        </div>
      </header>
      <main>
        <h1 className="mb-4 text-4xl font-bold underline">
          {frontmatter.name}
        </h1>
        <div className="mb-4 font-mono">
          <span>
            {new Intl.DateTimeFormat("nl-NL", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(new Date(frontmatter.date))}
          </span>{" "}
          <span className="font-bold text-red-500">|</span>{" "}
          <span>{frontmatter.kind}</span>{" "}
          {frontmatter.kind === "lab" ? (
            <>
              <span className="font-bold text-red-500">|</span>{" "}
              <span>{frontmatter.platform}</span>
            </>
          ) : null}
        </div>
        <article>
          {Markdoc.renderers.react(content, React, {
            components: {
              Blockquote: ({ children }) => (
                <blockquote className="flex flex-row gap-3">
                  <span className="font-bold">{"=>"}</span>
                  <span className="italic">{children}</span>
                </blockquote>
              ),
              Code: ({ content }) => (
                <code className="rounded-sm bg-[rgb(29,32,33)] pt-0 pr-1 pb-0 pl-1 font-mono text-[rgb(235,219,178)]">
                  {content}
                </code>
              ),
              Fence: ({ content, language }) => (
                <div className="mt-5 mb-5">
                  <SyntaxHighlighter
                    language={language}
                    style={style}
                    PreTag={({ children }) => (
                      <pre className="mt-5 mb-5 overflow-auto rounded-sm bg-[rgb(29,32,33)] p-5 font-mono">
                        {children}
                      </pre>
                    )}
                  >
                    {content}
                  </SyntaxHighlighter>
                </div>
              ),
              Heading: ({ children, level }) => {
                switch (level) {
                  case 2: {
                    return (
                      <h2 className="mt-5 mb-5 text-2xl underline">
                        {children}
                      </h2>
                    );
                  }

                  case 3: {
                    return (
                      <h3 className="mt-5 mb-5 text-xl underline">
                        {children}
                      </h3>
                    );
                  }

                  case 4: {
                    return (
                      <h4 className="mt-5 mb-5 text-lg underline">
                        {children}
                      </h4>
                    );
                  }

                  default: {
                    console.log(level);
                    throw new Error("heading, please set title in frontmatter");
                  }
                }
              },
              Image: ({ src, alt, title }) => (
                <img
                  src={src}
                  alt={alt}
                  title={title}
                  className="mt-5 mr-auto mb-5 ml-auto"
                />
              ),
              Link: ({ href, title, children }) => (
                <a href={href} title={title} className="text-blue-500">
                  {children}
                </a>
              ),
              List: ({ children, ordered }) =>
                ordered ? (
                  <ol className="mt-5 mb-5 list-inside list-decimal marker:font-semibold marker:text-red-500">
                    {children}
                  </ol>
                ) : (
                  <ul className="mt-5 mb-5 list-inside list-disc marker:text-red-500">
                    {children}
                  </ul>
                ),
              Paragraph: ({ children }) => <p className="mb-5">{children}</p>,
            },
          })}
        </article>
      </main>
      <Footer />
    </>
  );
}

export async function loader({ params: { entry } }: Route.LoaderArgs) {
  try {
    await access(`content/${entry}/${entry}.md`);
  } catch {
    throw data(null, 404);
  }

  const source = await readFile(`content/${entry}/${entry}.md`, "utf-8");

  const ast = Markdoc.parse(source);
  const content = Markdoc.transform(ast, {
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
            src: node.attributes.src.replace(/\.\/images/, `/${entry}`),
          });
        },
      },

      link: {
        render: "Link",
        attributes: {
          href: { type: String, required: true },
          title: { type: String, required: true },
        },
      },

      list: {
        render: "List",
        attributes: {
          ordered: { type: String, required: true },
        },
      },

      paragraph: {
        render: "Paragraph",
      },
    },
  });

  return { content, frontmatter: await parseFrontmatter(source) };
}
