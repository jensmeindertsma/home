export default function Home() {
  return (
    <>
      <header className="mb-12 flex flex-col gap-8 md:mt-18 md:mb-12 md:flex-row md:gap-12">
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
      <main></main>
    </>
  );
}
