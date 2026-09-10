import React from "react";
import { CalendarPlus, MapPin } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative flex min-h-0 items-center justify-center overflow-hidden px-5 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:min-h-[100dvh] lg:py-28">
      <div className="absolute inset-0 z-0 bg-background pointer-events-none" />

      {/* Abstract decorative elements */}
      <div className="absolute top-1/4 left-10 w-[40vw] h-[40vw] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[30vw] h-[30vw] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-24 items-center">
        <div className="order-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
            <span className="w-8 sm:w-12 h-px bg-secondary" />
            <span className="text-xs sm:text-sm font-sans tracking-[0.18em] sm:tracking-[0.2em] uppercase text-muted font-medium">
              In Loving Memory
            </span>
          </div>

          <h1 className="font-serif text-[2.85rem] sm:text-6xl lg:text-7xl xl:text-8xl text-primary leading-[1.06] mb-5 sm:mb-6">
            Dr. Jared Earl <br className="hidden lg:block" /> Hazleton
          </h1>

          <p className="text-[1.05rem] sm:text-xl md:text-2xl font-serif text-foreground/80 mb-6 sm:mb-8 italic leading-relaxed">
            <span className="block sm:inline">September 12, 1937</span>
            <span className="hidden sm:inline"> &mdash; </span>
            <span className="block sm:inline">September 3, 2026</span>
          </p>

          <p className="max-w-md text-[0.98rem] md:text-lg text-foreground/70 font-sans leading-relaxed">
            American economist, educator, public servant, and principal of TexEcon. A life devoted
            to understanding the world and elevating those within it.
          </p>

          <div className="mt-8 w-full max-w-xl border-l-2 border-secondary bg-card/70 px-5 py-5 text-left shadow-sm sm:px-6">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
              Celebration of Life
            </p>
            <p className="mb-4 font-sans text-sm leading-relaxed text-foreground/70 sm:text-base">
              We would like to share the arrangements for{" "}
              <a
                href="https://www.facebook.com/jared.hazleton"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-primary underline decoration-secondary/50 underline-offset-4 transition-colors hover:text-secondary"
              >
                Jared Hazleton
              </a>
              &apos;s Celebration of Life.
            </p>
            <time
              dateTime="2026-09-19T16:00:00-05:00"
              className="block font-serif text-xl font-semibold leading-tight text-primary sm:text-2xl"
            >
              Saturday, September 19, 2026. 4:00 p.m.
            </time>
            <address className="mt-2 font-sans text-sm not-italic leading-relaxed text-foreground/80 sm:text-base">
              Celebration Community Church at 908 Pennsylvania Avenue, Fort Worth, Texas 76104
            </address>
            <p className="mt-4 font-sans text-sm leading-relaxed text-foreground/70 sm:text-base">
              A reception will follow the service at the church.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Celebration%20Community%20Church%2C%20908%20Pennsylvania%20Avenue%2C%20Fort%20Worth%2C%20TX%2076104"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 border border-primary/20 bg-background px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:border-secondary hover:text-secondary"
              >
                <MapPin aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
                Map &amp; directions
              </a>
              <a
                href={`${import.meta.env.BASE_URL}jared-hazleton-celebration-of-life.ics`}
                download
                className="inline-flex min-h-11 items-center justify-center gap-2 border border-primary/20 bg-background px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:border-secondary hover:text-secondary"
              >
                <CalendarPlus aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
                Add to calendar
              </a>
            </div>
          </div>
        </div>

        <div className="order-2 flex justify-center lg:justify-end relative">
          <div className="relative w-full max-w-[280px] sm:max-w-[360px] aspect-[4/5] md:max-w-[440px] lg:max-w-lg">
            {/* Elegant framing */}
            <div className="absolute -inset-4 md:-inset-6 border border-primary/10 rounded-sm z-0" />
            <div className="absolute -inset-4 md:-inset-6 border border-secondary/20 rounded-sm z-0 transform translate-x-2 translate-y-2" />

            <div className="w-full h-full relative z-10 overflow-hidden shadow-2xl bg-card">
              <img
                src={`${import.meta.env.BASE_URL}jared-hazleton.png`}
                alt="Portrait of Dr. Jared Earl Hazleton, Texas economist and educator"
                className="w-full h-full object-cover object-top grayscale-[20%] sepia-[10%] contrast-[1.05]"
              />
              {/* Overlay for warmth */}
              <div className="absolute inset-0 bg-[#C29B4F] mix-blend-overlay opacity-10 pointer-events-none" />
            </div>

            {/* Small subtle caption/badge */}
            <div className="absolute -bottom-4 -right-2 sm:-bottom-6 sm:-right-6 md:-right-10 bg-background border border-border p-3 sm:p-4 shadow-xl z-20 flex flex-col gap-1 items-center justify-center min-w-[96px] sm:min-w-[120px]">
              <span className="text-secondary font-serif text-2xl sm:text-3xl leading-none">
                &ldquo;
              </span>
              <span className="text-[10px] uppercase tracking-widest font-sans text-muted">
                TexEcon
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
