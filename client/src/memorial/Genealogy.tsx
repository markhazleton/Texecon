import SEOHead from "@/components/seo-head";
import biography from "@/data/jared-biography.json";
import Footer from "./components/layout/Footer";
import "./memorial.css";

const genealogyUrl = "https://texecon.com/jared-hazleton/genealogy/";
const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const biographyHref = `${import.meta.env.BASE_URL}${biography.url.slice(1)}`;

const photos = [
  {
    path: "images/genealogy/smith-history-009.jpg",
    alt: "Myrtle Frances Smith Hazleton",
    title: "Myrtle Frances Smith Hazleton",
    note: "The album caption identifies Myrtle as the daughter of O.E. Smith Sr. and Besse Smith.",
  },
  {
    path: "images/genealogy/smith-history-010.jpg",
    alt: "O. E. Smith Sr. and Besse M. Goode Smith",
    title: "O. E. Smith Sr. and Besse M. Goode Smith",
    note: "A family photograph captioned circa the 1940s.",
  },
  {
    path: "images/genealogy/smith-history-015.jpg",
    alt: "W. H. Goode",
    title: "W. H. Goode",
    note: "The caption identifies W. H. Goode as Besse Goode Smith's father.",
  },
  {
    path: "images/genealogy/smith-history-003.jpg",
    alt: "Hazleton and Smith family Thanksgiving gathering",
    title: "A family Thanksgiving gathering",
    note: "Captioned circa the 1950s, with O. E. Smith Jr., Al Hazleton, O. E. Smith Sr., and Jared Hazleton named.",
  },
  {
    path: "images/genealogy/smith-history-011.jpg",
    alt: "Myrtle and Susan Hazleton with O. E. Smith Sr. and Besse Smith",
    title: "Hazleton and Smith family connections",
    note: "The caption names Myrtle and Susan Hazleton with O. E. Smith Sr. and Besse Smith.",
  },
  {
    path: "images/genealogy/smith-history-019.jpg",
    alt: "Jared Hazleton and Jackie Smith Devore",
    title: "Jared Hazleton and Jackie Smith Devore",
    note: "The album calls them cousins and dates the photograph to approximately the 1940s.",
  },
  {
    path: "images/genealogy/smith-history-026.jpg",
    alt: "Hazleton family wedding photograph",
    title: "A Hazleton family wedding photograph",
    note: "The original caption says family wedding; the event and people are not independently identified.",
  },
  {
    path: "images/genealogy/smith-history-001.jpg",
    alt: "Elizabeth Goode with Jared Hazleton",
    title: "Elizabeth Goode and Jared Hazleton",
    note: "The caption calls Elizabeth Jared's grandmother; the exact Goode generation remains under review.",
  },
];

const groups = [
  {
    title: "Alfred and Myrtle Hazleton",
    text: "Alfred Larson Hazleton and Myrtle Frances Smith Hazleton are identified as Jared's parents in the research collection. Susan Hazleton Swingen is identified as his sister. The family records preserve the distinction between these supported relationships and shorter caption references such as 'Al Hazleton.'",
    evidence: "Obituary and family-photo research; Myrtle's Smith parentage is caption-reported.",
  },
  {
    title: "The O. E. Smith family",
    text: "Myrtle's maternal family is represented here through O. E. Smith Sr. and Besse M. Goode Smith. The album identifies Mills Smith as O. E. Sr.'s younger brother and preserves stories of the Smith family's cleaning businesses in Oklahoma and Missouri. The identities of some Smith relatives remain unresolved.",
    evidence: "Family album captions 006, 009, 013, 016, and 017.",
  },
  {
    title: "The Goode and Livingston connections",
    text: "The working family group identifies W. H. Goode as Besse's father and preserves a possible line to John Goode and Susan A. Goode. Besse's sister Lola Livingston appears with Jack Livingston in the album. Elizabeth Goode appears with Jared, but her exact place in the Goode household has not been settled.",
    evidence: "Family album captions 001, 008, 015, 018, 020, and 035.",
  },
  {
    title: "Jared, Elaine, and their family",
    text: "Jared Earl Hazleton and Elaine raised Frances, Alan, and Mark. The research notes also name five grandchildren without assigning each grandchild to a parent. A photograph captioned as a family wedding is included below, but its event and participants remain unverified.",
    evidence: "Biography research and family album captions 019, 026, and 027.",
  },
];

export default function Genealogy() {
  return (
    <div className="memorial-page min-h-screen bg-background">
      <SEOHead
        title="Hazleton Family Genealogy | TexEcon"
        description="A working, evidence-aware family genealogy for Dr. Jared Earl Hazleton, preserving Hazleton, Smith, Goode, and Livingston family connections alongside local photographs."
        url={genealogyUrl}
        image="https://texecon.com/images/genealogy/smith-history-009.jpg"
        type="article"
        keywords={["Hazleton genealogy", "Jared Hazleton family", "Smith family history", "Goode family"]}
      />
      <header className="border-b border-border bg-card px-5 py-5 sm:px-8">
        <nav
          aria-label="Genealogy navigation"
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-primary"
        >
          <a className="font-serif text-lg" href={biographyHref}>
            &larr; Return to Jared's biography
          </a>
          <a className="underline underline-offset-4" href="#family-groups">
            Family groups
          </a>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
        <header className="max-w-4xl border-b border-border pb-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            A working family history
          </p>
          <h1 className="font-serif text-4xl leading-tight text-primary sm:text-5xl lg:text-6xl">
            Hazleton Family Genealogy
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-foreground/85 sm:text-xl">
            This page follows the family connections surrounding Dr. Jared Earl Hazleton, with
            special attention to the Hazleton, Smith, Goode, and Livingston lines.
          </p>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">
            This is a working research record, not a completed pedigree. Captions, obituary facts,
            photographed inscriptions, and unresolved leads are labeled according to the evidence
            available. A person appearing beside another person does not by itself establish a
            relationship.
          </p>
        </header>

        <section id="family-groups" aria-labelledby="family-groups-title" className="scroll-mt-8 py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">The working tree</p>
              <h2 id="family-groups-title" className="mt-3 font-serif text-3xl text-primary sm:text-4xl">
                Family groups
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {groups.map((group) => (
                <article key={group.title} className="border border-border bg-card p-6 sm:p-7">
                  <h3 className="font-serif text-2xl text-primary">{group.title}</h3>
                  <p className="mt-4 leading-7 text-foreground/80">{group.text}</p>
                  <p className="mt-5 border-t border-border pt-4 text-xs leading-6 text-muted-foreground">
                    Evidence: {group.evidence}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="photographs-title" className="border-t border-border py-14 sm:py-20">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Preserved album images</p>
            <h2 id="photographs-title" className="mt-3 font-serif text-3xl text-primary sm:text-4xl">
              Faces and family places
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              These local copies come from the Smith History Photos archive. Captions are retained as
              family testimony and are not treated as facial recognition or independent proof.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {photos.map((photo) => (
              <figure key={photo.path} className="overflow-hidden border border-border bg-card">
                <img
                  src={assetUrl(photo.path)}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover"
                />
                <figcaption className="p-4">
                  <h3 className="font-serif text-lg text-primary">{photo.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{photo.note}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <aside className="border border-border bg-card p-6 sm:p-8">
          <h2 className="font-serif text-2xl text-primary">Research notes</h2>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            Important open questions include Alfred and Myrtle's marriage record, the 1940 and 1950
            Hazleton households, the Waterloo Cemetery lead, and the conflicting Goode generations.
            The underlying research ledger and source notes remain in the project's family-history
            archive.
          </p>
          <a href={biographyHref} className="mt-6 inline-block font-medium text-primary underline underline-offset-4">
            Read Jared's full biography &rarr;
          </a>
        </aside>
      </main>
      <Footer />
    </div>
  );
}
