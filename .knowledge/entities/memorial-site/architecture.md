# TexEcon Memorial Site

The application root route (`/`) renders a dedicated memorial page for Dr. Jared
Earl Hazleton. The page owns the memorial navigation, hero, video feature,
biography, legacy, publications, family note, footer, memorial styling, and
profile SEO metadata.

The memorial experience is implemented under `client/src/memorial/` and is
selected by the root route in `client/src/App.tsx`. Other routes continue to
use the WebSpark-driven TexEcon content page.

The standalone family photo gallery is routed at
`/jared-hazleton/gallery/` (with a slashless alias) and renders the shared
`PhotoGallery` section through `PhotoGalleryPage`. The memorial home page does
not render the gallery inline; its gallery CTA and both navbar gallery links
target the standalone route. On the standalone gallery page, the memorial
section navigation uses home-page hash links (`/#tribute`, `/#legacy`, and
`/#publications`) because those sections are not present on the gallery page.
On the home page, those same navigation items use smooth scrolling to the
local sections.

The current dependency baseline keeps TypeScript 6.0.3 while the verified
non-TypeScript updates are recorded in
`.knowledge/npm-upgrade-evidence-2026-09-20.json`. The dependency audit after
those updates reported zero vulnerabilities; TypeScript 7 remains a separate
evaluation because it is a major compiler change.

## Evidence

- `client/src/App.tsx:17-28`
- `client/src/memorial/MemorialHome.tsx:13-44`
- `client/src/memorial/components/sections/`
- `client/src/memorial/PhotoGalleryPage.tsx`
- `client/src/memorial/components/layout/Navbar.tsx`
- `client/src/memorial/components/sections/Hero.tsx`
- `package.json`
- `package-lock.json`
