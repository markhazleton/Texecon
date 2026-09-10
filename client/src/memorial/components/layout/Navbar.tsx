import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const navItems = [
    { label: "Obituary", id: "tribute" },
    { label: "Biography", id: "biography" },
    { label: "Academic & Service", id: "legacy" },
    { label: "Published Works", id: "publications" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out border-b",
        scrolled || menuOpen
          ? "bg-background/95 backdrop-blur-md border-border shadow-sm py-3 md:py-4"
          : "bg-background/80 backdrop-blur-sm border-transparent py-4 md:py-6 lg:bg-transparent lg:backdrop-blur-none"
      )}
    >
      <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-12 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="min-w-0 text-primary font-serif font-semibold text-base sm:text-lg md:text-xl tracking-wide flex flex-col items-start transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
          aria-label="Return to the top of the memorial"
        >
          <span className="sm:hidden">Dr. Jared Hazleton</span>
          <span className="hidden sm:inline">Dr. Jared Earl Hazleton</span>
          <span className="text-xs font-sans text-muted tracking-[0.2em] uppercase mt-0.5">
            Memorial
          </span>
        </button>

        <nav className="hidden lg:flex items-center gap-5 xl:gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-xs xl:text-sm font-sans tracking-[0.12em] xl:tracking-widest uppercase text-foreground/70 hover:text-primary transition-colors duration-300 relative group whitespace-nowrap"
            >
              {item.label}
              <span className="absolute -bottom-2 left-1/2 w-0 h-px bg-secondary transition-all duration-300 group-hover:w-full group-hover:left-0" />
            </button>
          ))}
          <a
            href={`${import.meta.env.BASE_URL}texas/`}
            className="text-xs xl:text-sm font-sans tracking-[0.12em] xl:tracking-widest uppercase text-primary border-l border-border pl-5 xl:pl-8 hover:text-secondary transition-colors whitespace-nowrap"
          >
            Explore TexEcon
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="lg:hidden inline-flex h-11 w-11 items-center justify-center text-primary border border-border bg-background/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <nav
        id="mobile-navigation"
        className={cn(
          "lg:hidden absolute top-full left-0 right-0 overflow-hidden bg-background/98 backdrop-blur-md border-b border-border shadow-lg transition-all duration-300",
          menuOpen ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        )}
        aria-hidden={!menuOpen}
      >
        <div className="px-5 sm:px-6 py-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="flex w-full min-h-12 items-center justify-between border-b border-border/70 py-3 text-left text-sm font-sans tracking-[0.14em] uppercase text-foreground/75 last:border-b-0"
            >
              {item.label}
              <span className="text-secondary" aria-hidden="true">
                &rarr;
              </span>
            </button>
          ))}
          <a
            href={`${import.meta.env.BASE_URL}texas/`}
            onClick={() => setMenuOpen(false)}
            className="flex w-full min-h-12 items-center justify-between py-3 text-left text-sm font-sans tracking-[0.14em] uppercase text-primary"
          >
            Explore TexEcon
            <span className="text-secondary" aria-hidden="true">
              &rarr;
            </span>
          </a>
        </div>
      </nav>
    </header>
  );
}
