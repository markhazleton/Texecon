import SEOHead from "@/components/seo-head";
import biography from "@/data/jared-biography.json";
import Footer from "./components/layout/Footer";
import "./memorial.css";

const canonicalUrl = `https://texecon.com${biography.url}`;
const sourceUrl = (url: string) =>
  url.startsWith("/") ? `${import.meta.env.BASE_URL}${url.slice(1)}` : url;

export default function JaredBiography() {
  return (
    <div className="memorial-page min-h-screen bg-background">
      <SEOHead
        title={`${biography.title} | TexEcon`}
        description={biography.description}
        url={canonicalUrl}
        image="https://texecon.com/jared-hazleton.png"
        type="profile"
        keywords={["Jared Earl Hazleton", "biography", "Elaine Hazleton", "economist", "TexEcon"]}
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          "@id": `${canonicalUrl}#profile`,
          url: canonicalUrl,
          name: biography.title,
          description: biography.description,
          dateModified: biography.updated,
          mainEntity: {
            "@type": "Person",
            "@id": "https://texecon.com/#jared-hazleton",
            name: "Jared Earl Hazleton",
            birthDate: "1937-09-12",
            deathDate: "2026-09-03",
            image: "https://texecon.com/jared-hazleton.png",
          },
        })}
      </script>
      <header className="border-b border-border bg-card px-5 py-5 sm:px-8">
        <nav
          aria-label="Biography navigation"
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-primary"
        >
          <a className="font-serif text-lg" href={import.meta.env.BASE_URL}>
            ← Return to the tribute
          </a>
          <a className="underline underline-offset-4" href="#sources">
            Sources &amp; further reading
          </a>
        </nav>
      </header>
      <main id="biography-main" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
        <article>
          <header className="mb-12 grid items-center gap-8 border-b border-border pb-12 md:grid-cols-[1fr_220px] md:gap-14">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                The full biography
              </p>
              <h1 className="font-serif text-4xl leading-tight text-primary sm:text-5xl lg:text-6xl">
                Jared Earl Hazleton
              </h1>
              <p className="mt-4 font-serif text-xl text-muted-foreground sm:text-2xl">
                A Life of Curiosity and Service
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                September 12, 1937 — September 3, 2026
              </p>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-foreground/85">
                {biography.introduction}
              </p>
            </div>
            <img
              src={`${import.meta.env.BASE_URL}jared-hazleton.png`}
              alt="Portrait of Jared Earl Hazleton"
              width="220"
              height="275"
              className="w-40 border border-border p-2 shadow-sm md:w-full"
            />
          </header>
          <div className="grid items-start gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
            <nav
              aria-label="Biography chapters"
              className="border-l-2 border-secondary pl-5 lg:sticky lg:top-8"
            >
              <h2 className="mb-4 font-serif text-xl text-primary">In this story</h2>
              <ol className="space-y-3 text-sm leading-6 text-muted-foreground">
                {biography.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="hover:text-primary hover:underline">
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="min-w-0 max-w-3xl">
              {biography.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-title`}
                  className="mb-12 scroll-mt-8 border-b border-border pb-10"
                >
                  <h2
                    id={`${section.id}-title`}
                    className="mb-6 font-serif text-2xl leading-tight text-primary sm:text-3xl"
                  >
                    {section.title}
                  </h2>
                  <div className="space-y-5 text-base leading-8 text-foreground/85 sm:text-lg">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-6 text-muted-foreground">
                    Sources:{" "}
                    {section.sources.map((id, index) => {
                      const source = biography.sources.find((entry) => entry.id === id)!;
                      return (
                        <span key={id}>
                          {index > 0 && " · "}
                          <a href={`#source-${id}`} className="underline underline-offset-4">
                            {source.title}
                          </a>
                        </span>
                      );
                    })}
                  </p>
                </section>
              ))}
              <section id="sources" aria-labelledby="sources-title" className="scroll-mt-8">
                <h2 id="sources-title" className="mb-5 font-serif text-3xl text-primary">
                  Sources &amp; further reading
                </h2>
                <p className="mb-6 leading-7 text-muted-foreground">
                  This biography brings together institutional records, published scholarship, and
                  family recollections. The exact year of Jared’s Rice doctorate is omitted because
                  the available accounts disagree. Earlier ancestral relationships remain under
                  review.
                </p>
                <ul className="space-y-6">
                  {biography.sources.map((source) => (
                    <li key={source.id} id={`source-${source.id}`} className="scroll-mt-8">
                      {source.url ? (
                        <a
                          href={sourceUrl(source.url)}
                          className="font-medium text-primary underline underline-offset-4"
                        >
                          {source.title}
                        </a>
                      ) : (
                        <span className="font-medium text-primary">{source.title}</span>
                      )}
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{source.note}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-8 text-sm text-muted-foreground">
                  Updated <time dateTime={biography.updated}>September 14, 2026</time>
                </p>
              </section>
              <aside className="mt-12 border border-border bg-card p-6 sm:p-8">
                <h2 className="mb-3 font-serif text-2xl text-primary">
                  Remembering Jared together
                </h2>
                <p className="mb-4 leading-7 text-muted-foreground">
                  Visit the tribute for family memories, photographs, and Celebration of Life
                  information.
                </p>
                <a
                  href={import.meta.env.BASE_URL}
                  className="font-medium text-primary underline underline-offset-4"
                >
                  Return to the tribute →
                </a>
              </aside>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
