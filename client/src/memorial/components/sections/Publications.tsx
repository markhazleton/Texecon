import React from "react";
import { FadeIn, FadeInStagger, FadeInItem } from "../animations";
import { BookMarked } from "lucide-react";

export default function Publications() {
  const books = [
    "The Economics of the Sulphur Industry",
    "Recent Research and Developments in Fisheries Economics",
    "Managing Macroeconomic Policy: The Johnson Presidency",
    "Planning Development in the Oil-Rich Countries",
    "Public Policy for Controlling the Environment",
  ];

  const topics = [
    "Land Reform",
    "Year-Round Schooling",
    "Bank Mergers",
    "Regional Economic Stability",
    "Macroeconomic Forecasting",
  ];

  return (
    <section
      id="publications"
      className="scroll-mt-20 py-16 sm:py-20 md:py-28 lg:py-32 px-5 sm:px-6 bg-primary text-primary-foreground relative overflow-hidden"
    >
      {/* Background graphic */}
      <div className="absolute right-0 top-0 w-1/2 h-full opacity-5 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full object-cover">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <FadeIn>
          <div className="flex flex-col items-center text-center mb-12 sm:mb-16 md:mb-20">
            <BookMarked
              className="w-7 h-7 sm:w-8 sm:h-8 text-secondary mb-5 sm:mb-6"
              strokeWidth={1.5}
            />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-primary-foreground mb-4 sm:mb-6">
              Published Works
            </h2>
            <p className="max-w-2xl text-primary-foreground/70 font-sans text-base sm:text-lg leading-relaxed">
              Dr. Hazleton's rigorous research spanned diverse fields—from natural resource
              economics to presidential policy—leaving a permanent record of his analytical insight.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24">
          <div>
            <FadeIn>
              <h3 className="text-sm font-sans tracking-widest uppercase text-secondary mb-8 border-b border-secondary/30 pb-4">
                Selected Books
              </h3>
            </FadeIn>
            <FadeInStagger className="space-y-6">
              {books.map((book, i) => (
                <FadeInItem key={i}>
                  <div className="flex gap-4 items-start">
                    <span className="text-secondary/50 font-serif italic text-xl leading-none mt-1">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h4 className="text-lg md:text-xl font-serif text-primary-foreground/90 leading-tight">
                      {book}
                    </h4>
                  </div>
                </FadeInItem>
              ))}
            </FadeInStagger>
          </div>

          <div>
            <FadeIn>
              <h3 className="text-sm font-sans tracking-widest uppercase text-secondary mb-8 border-b border-secondary/30 pb-4">
                Research Areas
              </h3>
            </FadeIn>
            <FadeInStagger className="flex flex-wrap gap-3">
              {topics.map((topic, i) => (
                <FadeInItem key={i}>
                  <span className="inline-block px-4 py-2 border border-primary-foreground/20 text-sm font-sans text-primary-foreground/80 rounded-sm hover:border-secondary hover:text-secondary transition-colors cursor-default">
                    {topic}
                  </span>
                </FadeInItem>
              ))}
            </FadeInStagger>

            <FadeIn delay={0.6}>
              <div className="mt-10 sm:mt-12 p-5 sm:p-6 bg-primary-foreground/5 border-l-2 border-secondary">
                <p className="font-serif italic text-primary-foreground/80 leading-relaxed text-base sm:text-lg">
                  "His expertise in economics was unmatched, and he brought a wealth of knowledge
                  and experience... providing insightful analysis and commentary on the current
                  state and future prospects."
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
