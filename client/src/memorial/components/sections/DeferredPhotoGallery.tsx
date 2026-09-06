import { lazy, Suspense, useEffect, useRef, useState } from "react";

const PhotoGallery = lazy(() => import("./PhotoGallery"));

function GalleryPlaceholder() {
  return (
    <section
      aria-label="Photo gallery loading"
      className="min-h-[560px] bg-primary py-16 text-primary-foreground sm:py-20"
    >
      <div className="container mx-auto max-w-6xl animate-pulse px-5 sm:px-6">
        <div className="mb-8 h-10 w-72 max-w-full rounded bg-white/10" />
        <div className="aspect-[4/3] max-h-[72vh] w-full rounded bg-white/10" />
      </div>
    </section>
  );
}

export default function DeferredPhotoGallery() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger || !("IntersectionObserver" in window)) {
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

    observer.observe(trigger);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={triggerRef}>
      {shouldLoad ? (
        <Suspense fallback={<GalleryPlaceholder />}>
          <PhotoGallery />
        </Suspense>
      ) : (
        <GalleryPlaceholder />
      )}
    </div>
  );
}
