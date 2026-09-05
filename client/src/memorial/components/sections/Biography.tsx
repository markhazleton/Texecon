import React from "react";
import { FadeIn, FadeInStagger, FadeInItem } from "../animations";

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
                  His early life instilled a deep curiosity about how systems function, how
                  societies structure themselves, and how policy impacts the lives of individuals.
                </p>
              </FadeInItem>

              <FadeInItem className="mb-8">
                <p>
                  He laid the academic foundation for his life's work at the University of Oklahoma,
                  where he earned his Bachelor of Business Administration in 1959. Recognizing that
                  his passion lay in the deeper mechanisms of economics, he pursued advanced study
                  at Rice University, receiving his Ph.D. in Economics in 1961.
                </p>
              </FadeInItem>

              <FadeInItem className="mb-12">
                <p>
                  His intellect was matched by a profound sense of duty, reflected in his service in
                  the U.S. Naval Reserve, which helped shape his disciplined, structural approach to
                  complex problems.
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
                        <span className="text-muted-foreground">Rice University, 1961</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </FadeInItem>
            </FadeInStagger>
          </div>
        </div>
      </div>
    </section>
  );
}
