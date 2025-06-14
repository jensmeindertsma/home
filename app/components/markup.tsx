import type { ReactNode } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import style from "react-syntax-highlighter/dist/esm/styles/prism/gruvbox-dark";

export function Blockquote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="mb-5 flex flex-row gap-3">
      <span className="font-bold">{"=>"}</span>
      <span className="italic">{children}</span>
    </blockquote>
  );
}

export function Code({ content }: { content: string }) {
  return (
    <code className="rounded-sm bg-[rgb(29,32,33)] pt-1 pr-2 pb-1 pl-2 font-mono text-[rgb(235,219,178)]">
      {content}
    </code>
  );
}

export function Fence({
  content,
  language,
}: {
  content: string;
  language: string;
}) {
  return (
    <div className="mt-5 mb-5">
      <SyntaxHighlighter language={language} style={style} PreTag={Pre}>
        {content}
      </SyntaxHighlighter>
    </div>
  );
}

export function Heading({
  children,
  level,
}: {
  children: ReactNode;
  level: number;
}) {
  switch (level) {
    case 2: {
      return <h2 className="mt-10 mb-5 text-2xl">{children}</h2>;
    }

    case 3: {
      return <h3 className="mt-10 mb-5 text-xl">{children}</h3>;
    }

    case 4: {
      return <h4 className="mt-10 mb-5 text-lg">{children}</h4>;
    }

    default: {
      console.log(level);
      throw new Error("heading, please set title in frontmatter");
    }
  }
}

export function Image({
  src,
  alt,
  title,
}: {
  src: string;
  alt?: string;
  title?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      title={title}
      className="mt-5 mr-auto mb-5 ml-auto"
    />
  );
}

export function Link({
  href,
  title,
  children,
}: {
  children: ReactNode;
  href: string;
  title: string;
}) {
  return (
    <a href={href} title={title} className="text-blue-500">
      {children}
    </a>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return <p className="mb-5">{children}</p>;
}

function Pre({ children }: { children: ReactNode }) {
  return (
    <pre className="mt-5 mb-5 overflow-auto rounded-sm bg-[rgb(29,32,33)] p-5 font-mono">
      {children}
    </pre>
  );
}
