import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Images, X } from "lucide-react";
import galleryPhotos from "@/data/memorial-gallery.json";

type GalleryPhoto = (typeof galleryPhotos)[number];

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

function ResponsivePhoto({
  photo,
  eager = false,
  onLoad,
  className = "",
}: {
  photo: GalleryPhoto;
  eager?: boolean;
  onLoad?: () => void;
  className?: string;
}) {
  return (
    <picture>
      <source
        type="image/webp"
        srcSet={`${assetUrl(photo.webpSmall)} 960w, ${assetUrl(photo.webpLarge)} 1600w`}
        sizes="(max-width: 768px) 100vw, 1100px"
      />
      <img
        src={assetUrl(photo.fallback)}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={onLoad}
        className={className}
      />
    </picture>
  );
}

export function MemorialGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedPhoto, setLoadedPhoto] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pointerStartX = useRef<number | null>(null);
  const activePhoto = galleryPhotos[activeIndex];

  const showPhoto = useCallback((index: number) => {
    const nextIndex = (index + galleryPhotos.length) % galleryPhotos.length;
    setLoadedPhoto(null);
    setActiveIndex(nextIndex);
  }, []);

  const showPrevious = useCallback(() => showPhoto(activeIndex - 1), [activeIndex, showPhoto]);
  const showNext = useCallback(() => showPhoto(activeIndex + 1), [activeIndex, showPhoto]);

  useEffect(() => {
    thumbnailRefs.current[activeIndex]?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIndex]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsLightboxOpen(false);
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, showNext, showPrevious]);

  const preloadNeighbors = () => {
    setLoadedPhoto(activePhoto.id);

    for (const offset of [-1, 1]) {
      const neighbor =
        galleryPhotos[(activeIndex + offset + galleryPhotos.length) % galleryPhotos.length];
      const preload = new Image();
      preload.src = assetUrl(neighbor.webpSmall);
    }
  };

  const handleCarouselKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    }
  };

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-title"
      className="scroll-mt-20 overflow-hidden bg-primary py-16 text-primary-foreground sm:py-20 md:py-28"
      data-testid="memorial-gallery"
    >
      <div className="container mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#e0c17c]">
              <Images aria-hidden="true" className="h-4 w-4" /> A life in photographs
            </span>
            <h2 id="gallery-title" className="font-serif text-3xl sm:text-4xl md:text-5xl">
              Memories Through the Years
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-primary-foreground/70 sm:text-right">
            A collection of moments shared with family, friends, and the communities Dr. Hazleton
            touched throughout his life.
          </p>
        </div>

        <div
          className="relative overflow-hidden rounded-sm border border-white/10 bg-black/30 shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-4 focus-visible:ring-offset-primary"
          role="group"
          aria-roledescription="carousel"
          aria-label="Hazleton family memorial photographs"
          tabIndex={0}
          onKeyDown={handleCarouselKeyDown}
          onPointerDown={(event) => {
            pointerStartX.current = event.clientX;
          }}
          onPointerUp={(event) => {
            if (pointerStartX.current === null) return;
            const distance = event.clientX - pointerStartX.current;
            pointerStartX.current = null;
            if (Math.abs(distance) < 50) return;
            if (distance > 0) showPrevious();
            else showNext();
          }}
        >
          <div className="relative aspect-[4/3] max-h-[72vh] min-h-[280px] w-full">
            <img
              src={activePhoto.placeholder}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl"
            />
            <ResponsivePhoto
              key={activePhoto.id}
              photo={activePhoto}
              eager
              onLoad={preloadNeighbors}
              className={`relative z-10 h-full w-full object-contain transition-opacity duration-500 motion-reduce:transition-none ${
                loadedPhoto === activePhoto.id ? "opacity-100" : "opacity-0"
              }`}
            />

            <button
              type="button"
              onClick={showPrevious}
              aria-label="Show previous photograph"
              className="absolute left-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e0c17c] sm:left-5"
            >
              <ChevronLeft aria-hidden="true" className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Show next photograph"
              className="absolute right-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e0c17c] sm:right-5"
            >
              <ChevronRight aria-hidden="true" className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              aria-label="Enlarge current photograph"
              className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e0c17c] sm:right-5 sm:top-5"
            >
              <Expand aria-hidden="true" className="h-4 w-4" />
            </button>
            <div
              className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs tracking-widest text-white backdrop-blur-sm"
              aria-live="polite"
              aria-atomic="true"
            >
              {activeIndex + 1} / {galleryPhotos.length}
            </div>
          </div>
        </div>

        <div
          className="mt-4 flex snap-x gap-2 overflow-x-auto pb-3 [scrollbar-color:rgba(255,255,255,0.35)_transparent]"
          aria-label="Choose a photograph"
        >
          {galleryPhotos.map((photo, index) => (
            <button
              key={photo.id}
              ref={(node) => {
                thumbnailRefs.current[index] = node;
              }}
              type="button"
              onClick={() => showPhoto(index)}
              aria-label={`Show photograph ${index + 1} of ${galleryPhotos.length}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className={`h-16 w-20 shrink-0 snap-center overflow-hidden rounded-sm border-2 transition sm:h-20 sm:w-24 ${
                index === activeIndex
                  ? "border-[#e0c17c] opacity-100"
                  : "border-transparent opacity-55 hover:opacity-90"
              }`}
            >
              <img
                src={assetUrl(photo.thumbnail)}
                alt=""
                width="240"
                height="240"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-primary-foreground/55">
          Use the arrow keys, swipe, or select a thumbnail to explore the collection.
        </p>
      </div>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/95 p-3 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Photograph ${activeIndex + 1} of ${galleryPhotos.length}`}
          onClick={(event) => {
            if (event.currentTarget === event.target) setIsLightboxOpen(false);
          }}
        >
          <ResponsivePhoto
            photo={activePhoto}
            eager
            className="max-h-[92vh] max-w-[94vw] object-contain"
          />
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close enlarged photograph"
            autoFocus
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/60 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e0c17c] sm:right-8 sm:top-8"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      )}
    </section>
  );
}

export default MemorialGallery;
