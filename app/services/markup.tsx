import type { ReactNode } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import style from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";

export function Paragraph({ children }: { children: ReactNode }) {
  return <p className="mb-5">{children}</p>;
}

export function Code({ content }: { content: string }) {
  return (
    <code
      className="rounded-sm pr-2 pl-2 font-mono text-gray-300"
      style={{
        backgroundColor: "hsl(220, 13%, 18%)",
      }}
    >
      {content}
    </code>
  );
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
      className="mt-5 mr-auto mb-5 ml-auto sm:pr-5 sm:pl-5"
    />
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
      <SyntaxHighlighter
        language={language}
        style={style}
        customStyle={{
          borderRadius: "4px",
        }}
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
}
