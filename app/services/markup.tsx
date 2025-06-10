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
      className="mt-5 mb-5 sm:mt-10 sm:mb-10 sm:w-2xl sm:pr-5 sm:pl-5 md:w-3xl"
    />
  );
}
