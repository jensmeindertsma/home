import type { ReactNode } from "react";

export function Paragraph({ children }: { children: ReactNode }) {
  return <p className="mb-5">{children}</p>;
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
