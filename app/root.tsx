import type { Route } from "./+types/root";
import stylesheet from "./app.css?url";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

export function meta(): Route.MetaDescriptors {
  return [{ title: "Jens Meindertsma" }];
}

export function links(): Route.LinkDescriptors {
  return [
    {
      rel: "icon",
      href: "/icons/camp.png",
      type: "image/png",
    },

    { rel: "preload", href: "/mono.ttf", as: "font" },
    { rel: "preload", href: stylesheet, as: "style" },

    { rel: "stylesheet", href: stylesheet },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="bg-white text-black dark:bg-black dark:text-white"
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="p-5 sm:mr-auto sm:ml-auto sm:w-2xl md:w-3xl md:p-10">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <>
      <title>Error!</title>

      <h1 className="mt-14 mb-8 text-center font-mono text-2xl font-black">
        {message}
      </h1>
      <p className="text-center font-mono">{details}</p>
      {stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
    </>
  );
}
