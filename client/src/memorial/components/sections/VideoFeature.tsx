import React from "react";
import { ExternalLink, Play } from "lucide-react";
import { FadeIn } from "../animations";

const videoUrl = "https://www.youtube.com/watch?v=CgpMrZp_iiI";

export default function VideoFeature() {
  return (
    <section
      id="video"
      className="scroll-mt-20 py-16 sm:py-20 md:py-28 lg:py-32 px-5 sm:px-6 bg-card/30 border-y border-border/50"
    >
      <div className="container mx-auto max-w-5xl">
        <FadeIn>
          <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
            <span className="w-8 sm:w-12 h-px bg-secondary" />
            <span className="text-xs sm:text-sm font-sans tracking-[0.18em] sm:tracking-[0.2em] uppercase text-muted font-medium">
              A deeper look
            </span>
          </div>

          <div className="grid lg:grid-cols-[0.75fr_1.25fr] gap-8 sm:gap-10 lg:gap-16 items-center">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-primary leading-tight mb-4 sm:mb-6">
                Deep Dive: Jared Hazleton
              </h2>
              <p className="text-base sm:text-lg text-foreground/70 font-sans leading-relaxed mb-6 sm:mb-8">
                A thoughtful look at Dr. Jared E. Hazleton’s life as an economist, academic, and
                leader, and at the career he devoted to teaching, research, and public service.
              </p>
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-sans text-primary hover:text-secondary transition-colors underline underline-offset-4"
              >
                Watch on YouTube
                <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
              </a>
            </div>

            <div className="relative overflow-hidden bg-primary shadow-xl aspect-video -mx-5 sm:mx-0 sm:border sm:border-border/50">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/CgpMrZp_iiI"
                title="Deep Dive: Jared Hazleton"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/10">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background/90 text-primary shadow-lg">
                  <Play className="ml-1 h-5 w-5 fill-current" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
