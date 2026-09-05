import React from "react";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12 sm:py-16 px-5 sm:px-6 relative overflow-hidden">
      {/* Decorative texture overlay specific to footer */}
      <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] pointer-events-none" />

      <div className="container mx-auto max-w-4xl flex flex-col items-center text-center relative z-10">
        <h2 className="font-serif text-2xl md:text-3xl mb-4 text-primary-foreground">
          Dr. Jared Earl Hazleton
        </h2>
        <p className="font-sans text-primary-foreground/70 tracking-[0.12em] sm:tracking-widest text-xs sm:text-sm mb-9 sm:mb-12 leading-relaxed">
          September 12, 1937 &mdash; September 3, 2026
        </p>

        <div className="w-16 h-px bg-secondary/50 mb-12" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 md:gap-12 w-full max-w-3xl mb-12 sm:mb-16 text-sm font-sans text-primary-foreground/80">
          <div className="px-3">
            <h3 className="uppercase tracking-widest text-xs text-secondary mb-3 font-semibold">
              Scholarship
            </h3>
            <p className="leading-relaxed">
              A lifelong dedication to economic education and research, shaping minds across
              generations.
            </p>
          </div>
          <div className="px-3">
            <h3 className="uppercase tracking-widest text-xs text-secondary mb-3 font-semibold">
              Service
            </h3>
            <p className="leading-relaxed">
              Commitment to public good through the United Way, Arthritis Foundation, and Texas
              Research League.
            </p>
          </div>
          <div className="px-3">
            <h3 className="uppercase tracking-widest text-xs text-secondary mb-3 font-semibold">
              Legacy
            </h3>
            <p className="leading-relaxed">
              Remembered as an insightful economist, devoted educator, and principal of TexEcon.
            </p>
          </div>
        </div>

        <p className="text-xs font-sans text-primary-foreground/80 tracking-wider">
          Preserved with deep respect and gratitude by his family.
        </p>
        <a
          href={`${import.meta.env.BASE_URL}texas/`}
          className="mt-6 text-xs font-sans uppercase tracking-[0.16em] text-secondary hover:text-primary-foreground transition-colors"
        >
          Continue to the TexEcon archive
        </a>
      </div>
    </footer>
  );
}
