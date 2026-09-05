import React from "react";
import { FadeIn } from "../animations";
import { ExternalLink, PenLine } from "lucide-react";

export default function FamilyNote() {
  return (
    <section
      id="tribute"
      className="scroll-mt-20 py-16 sm:py-20 md:py-28 lg:py-32 px-4 sm:px-6 bg-background relative border-t border-border/50"
    >
      <div className="container mx-auto max-w-3xl">
        <FadeIn>
          <div className="bg-card border border-border p-5 sm:p-8 md:p-12 lg:p-16 text-center shadow-sm relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background p-4 rounded-full border border-border text-primary">
              <PenLine className="w-6 h-6" strokeWidth={1.5} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif text-primary mb-5 sm:mb-6 mt-4">
              Obituary & Remembrance
            </h2>

            <div className="w-12 h-px bg-secondary mx-auto mb-8" />

            <p className="text-foreground/70 font-sans text-base sm:text-lg leading-relaxed mb-7 sm:mb-8">
              Jared Earl Hazleton passed away on Thursday, September 3, 2026, at the age of 88, at
              his residence surrounded by his family. He will be remembered for the loving spirit
              and kindness he shared with relatives, friends, students, and colleagues.
            </p>

            <div className="bg-muted/10 p-5 sm:p-6 md:p-8 rounded text-left font-sans border border-border/50 mb-7 sm:mb-8">
              <p className="text-sm uppercase tracking-[0.18em] text-secondary font-semibold mb-4">
                Celebration of life
              </p>
              <p className="text-foreground/70 leading-relaxed">
                A celebration of life will be held on September 19, 2026, at a church in Fort Worth,
                Texas. Church name, address, and service time will be added when available.
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center justify-center gap-3">
              <a
                href="https://fortworthreport.org/2026/09/04/jared-earl-hazleton-september-12-1937-september-3-2026/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 w-full md:w-auto items-center justify-center gap-2 border border-border px-4 py-2.5 text-sm font-sans text-primary hover:border-secondary hover:text-secondary transition-colors"
              >
                Read the published obituary
                <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <a
                href="https://www.dignitymemorial.com/obituaries/arlington-tx/jared-hazleton-13026327"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 w-full md:w-auto items-center justify-center gap-2 border border-border px-4 py-2.5 text-sm font-sans text-primary hover:border-secondary hover:text-secondary transition-colors"
              >
                Funeral home obituary & updates
                <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <a
                href="https://www.dignitymemorial.com/obituaries/arlington-tx/jared-hazleton-13026327/add-memory"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 w-full md:w-auto items-center justify-center gap-2 border border-border px-4 py-2.5 text-sm font-sans text-primary hover:border-secondary hover:text-secondary transition-colors"
              >
                Add a memory
                <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
              </a>
            </div>

            <div className="mt-10 pt-8 border-t border-border/50 text-sm text-foreground/60 font-sans italic">
              <p>
                The family may add a personal tribute, shared memories, or memorial service details
                here when ready.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
