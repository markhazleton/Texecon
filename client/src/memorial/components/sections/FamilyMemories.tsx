import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookHeart } from "lucide-react";
import { fetchFamilyMemories } from "@/lib/family-memories-api";
import { FadeIn } from "../animations";

const markdownLinkPattern = /\[([^\]]+)]\((https?:\/\/[^)]+)\)/g;

function renderInlineMarkdown(value: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let cursor = 0;

  for (const match of value.matchAll(markdownLinkPattern)) {
    const index = match.index ?? 0;
    const label = match[1];
    const isBold = label.startsWith("**") && label.endsWith("**");
    const linkText = isBold ? label.slice(2, -2) : label;
    if (index > cursor) parts.push(value.slice(cursor, index));

    parts.push(
      <a
        key={`${match[2]}-${index}`}
        href={match[2]}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-primary underline decoration-secondary/50 underline-offset-4 transition-colors hover:text-secondary"
      >
        {isBold ? <strong>{linkText}</strong> : linkText}
      </a>
    );
    cursor = index + match[0].length;
  }

  if (cursor < value.length) parts.push(value.slice(cursor));
  return parts;
}

export default function FamilyMemories() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const {
    data: memories,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["family-memories"],
    queryFn: ({ signal }) => fetchFamilyMemories(signal),
    enabled: shouldLoad,
  });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "600px 0px" }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="mt-14 sm:mt-18 md:mt-24"
      aria-labelledby="family-memories-title"
    >
      <FadeIn>
        <div className="mb-8 text-center sm:mb-10">
          <BookHeart aria-hidden="true" className="mx-auto mb-4 h-7 w-7 text-secondary" />
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            In their own words
          </p>
          <h2
            id="family-memories-title"
            className="font-serif text-3xl text-primary sm:text-4xl md:text-5xl"
          >
            Family Memories
          </h2>
        </div>
      </FadeIn>

      {isPending && (
        <div className="animate-pulse border border-border bg-card p-6 sm:p-10" aria-live="polite">
          <span className="sr-only">Loading family memories</span>
          <div className="mb-3 h-7 w-48 rounded bg-muted/15" />
          <div className="mb-8 h-4 w-36 rounded bg-muted/15" />
          <div className="space-y-3">
            <div className="h-4 rounded bg-muted/10" />
            <div className="h-4 rounded bg-muted/10" />
            <div className="h-4 w-4/5 rounded bg-muted/10" />
          </div>
        </div>
      )}

      {isError && (
        <p
          className="border border-border bg-card p-6 text-center text-foreground/70"
          role="status"
        >
          Family memories are temporarily unavailable. Please try again later.
        </p>
      )}

      {memories?.map((memory, memoryIndex) => (
        <FadeIn key={`${memory.personName}-${memoryIndex}`}>
          <article className="mb-8 border border-border bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-10 md:px-12">
            <header className="mb-7 border-b border-border/70 pb-6">
              <h3 className="font-serif text-2xl text-primary sm:text-3xl">
                {memory.personName}{" "}
                <span className="font-sans text-sm font-normal text-muted">
                  ({memory.personPronouns})
                </span>
              </h3>
              <p className="mt-1 text-sm font-medium uppercase tracking-[0.14em] text-muted">
                {memory.relationshipToJared}
              </p>
            </header>

            <div className="space-y-5 font-serif text-base leading-8 text-foreground/80 sm:text-lg">
              {memory.body.split("\n\n").map((paragraph, paragraphIndex) => (
                <Fragment key={paragraphIndex}>
                  <p>{renderInlineMarkdown(paragraph)}</p>
                </Fragment>
              ))}
            </div>
          </article>
        </FadeIn>
      ))}
    </div>
  );
}
