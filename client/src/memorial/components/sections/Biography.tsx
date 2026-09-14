import React from "react";
import { FadeIn, FadeInStagger, FadeInItem } from "../animations";
import biography from "@/data/jared-biography.json";

export default function Biography() {
  return (
    <section
      id="biography"
      className="scroll-mt-20 py-16 sm:py-20 md:py-28 lg:py-32 px-5 sm:px-6 bg-background relative border-t border-border/50"
    >
      <div className="container mx-auto max-w-5xl">
        <FadeIn>
          <div className="flex flex-col items-center text-center mb-10 sm:mb-14 md:mb-20">
            <span className="text-secondary text-xs sm:text-sm font-sans tracking-widest uppercase mb-3 sm:mb-4">
              Origins & Education
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-primary">
              A Life of Inquiry
            </h2>
            <div className="w-16 h-px bg-secondary mt-6 sm:mt-8" />
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-24">
          <div className="lg:col-span-5 relative">
            <FadeIn delay={0.2} className="lg:sticky lg:top-32">
              <div className="aspect-[5/3] sm:aspect-[4/3] w-full bg-card shadow-lg relative border border-border p-2 sm:p-3">
                <div className="w-full h-full bg-muted/10 flex flex-col items-center justify-center text-center p-5 sm:p-8 border border-border/50">
                  <span className="font-serif text-5xl sm:text-6xl text-secondary/30 mb-3 sm:mb-4 font-light">
                    1937
                  </span>
                  <p className="font-sans text-sm text-foreground/70 uppercase tracking-widest">
                    Born September 12
                  </p>
                  <p className="font-serif italic text-lg text-primary mt-2">Oklahoma City</p>
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-7">
            <FadeInStagger className="prose prose-base sm:prose-lg prose-slate max-w-none text-foreground/80 font-sans leading-relaxed">
              <FadeInItem className="mb-8">
                <p className="text-lg sm:text-xl font-serif text-primary leading-relaxed">
                  Jared Earl Hazleton was born on September 12, 1937, in Oklahoma City, Oklahoma.
                  His parents were Alfred Larson Hazleton and Myrtle Hazleton, and his sister was
                  Susan Hazleton Swingen. Family photographs preserve his childhood and the Smith
                  family connections on his mother’s side.
                </p>
              </FadeInItem>

              <FadeInItem className="mb-8">
                <p>
                  At the University of Oklahoma, Jared studied accounting and earned his Bachelor of
                  Business Administration in 1959. He also met Elaine, his wife of sixty-six years.
                  Together they raised Franci, Alan, and Mark, and became grandparents to Weston,
                  Kendall, Marlis, Berit, and Ian.
                </p>
              </FadeInItem>

              <FadeInItem className="mb-12">
                <p>
                  Jared served as a U.S. Navy officer and earned a Ph.D. in Economics from Rice
                  University. His work took him from the Federal Reserve Bank of Boston to
                  university teaching, public service, and an assignment in Amman, Jordan—a chapter
                  his family remembers as part of the life they explored together.
                </p>
              </FadeInItem>

              <FadeInItem>
                <div className="bg-card border border-border/60 p-5 sm:p-8 md:p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
                  <h3 className="text-xl font-serif text-primary mb-6 flex items-center gap-4">
                    <span className="w-8 h-px bg-secondary" />
                    Academic Milestones
                  </h3>
                  <ul className="space-y-4 font-sans text-base">
                    <li className="flex items-start gap-4">
                      <span className="text-secondary mt-1">❖</span>
                      <div>
                        <strong className="text-foreground block">B.B.A.</strong>
                        <span className="text-muted-foreground">University of Oklahoma, 1959</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="text-secondary mt-1">❖</span>
                      <div>
                        <strong className="text-foreground block">Ph.D. Economics</strong>
                        <span className="text-muted-foreground">Rice University</span>
                      </div>
                    </li>
                  </ul>
                  <a
                    href={`${import.meta.env.BASE_URL}${biography.url.slice(1)}`}
                    className="mt-8 inline-block text-primary underline underline-offset-4 hover:text-secondary"
                  >
                    Read the full biography →
                  </a>
                </div>
              </FadeInItem>
            </FadeInStagger>
          </div>
        </div>
      </div>
    </section>
  );
}
