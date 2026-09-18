import SEOHead from "@/components/seo-head";

const downloadPath =
  "https://github.com/markhazleton/Texecon/releases/latest/download/CollageStudioSetup.exe";

export default function PhotoCollagePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Photo Collage Studio for Windows | TexEcon"
        description="Create cinematic photo collages and family slideshow videos with the free Collage Studio Windows app from TexEcon."
        keywords={[
          "photo collage maker",
          "Windows slideshow maker",
          "family slideshow",
          "Collage Studio",
          "MP4 slideshow",
        ]}
        url="https://texecon.com/photo-collage/"
      />

      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <a
            href={`${import.meta.env.BASE_URL || "/"}`}
            className="font-serif text-xl font-bold text-primary"
          >
            TexEcon
          </a>
          <a
            href="#download"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Download for Windows
          </a>
        </div>
      </header>

      <main>
        <section className="bg-primary px-4 py-20 text-primary-foreground sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-5xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/75">
              Collage Studio
            </p>
            <h1 className="max-w-3xl font-serif text-4xl font-bold tracking-tight sm:text-6xl">
              Turn a folder of photographs into a story worth watching.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-primary-foreground/85">
              Collage Studio is a local Windows app for building cinematic photo collages, adding
              music or narration, previewing motion, and rendering a finished MP4.
            </p>
            <a
              href="#download"
              className="mt-8 inline-flex rounded-md bg-background px-6 py-3 font-semibold text-foreground shadow-sm"
            >
              Get Collage Studio
            </a>
          </div>
        </section>

        <section className="container mx-auto grid max-w-5xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            [
              "Choose your folders",
              "Point a project at your image and audio folders, or let the project keep its own managed copies.",
            ],
            [
              "Shape the story",
              "Arrange scenes, titles, captions, transitions, camera motion, backgrounds, and focal points.",
            ],
            [
              "Render the memory",
              "Preview your work, then create a 1080p MP4 with music, narration, and cinematic transitions.",
            ],
          ].map(([title, text], index) => (
            <article key={title} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <span className="text-sm font-bold text-primary">0{index + 1}</span>
              <h2 className="mt-3 text-xl font-semibold">{title}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{text}</p>
            </article>
          ))}
        </section>

        <section className="bg-muted/40 px-4 py-16 sm:px-6 lg:px-8">
          <div className="container mx-auto grid max-w-5xl gap-12 md:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl font-bold">How to make your first collage</h2>
              <ol className="mt-6 space-y-5 text-muted-foreground">
                <li>
                  <strong className="text-foreground">1. Install and open the app.</strong> Launch
                  Collage Studio from the Windows Start Menu.
                </li>
                <li>
                  <strong className="text-foreground">2. Open or create a project.</strong> Choose a
                  JSON project file, or start a new family story.
                </li>
                <li>
                  <strong className="text-foreground">3. Select your media.</strong> Choose the
                  folders containing your photographs and optional audio.
                </li>
                <li>
                  <strong className="text-foreground">4. Edit and preview.</strong> Build scenes,
                  adjust timing, and press Play to review the flow.
                </li>
                <li>
                  <strong className="text-foreground">5. Render the MP4.</strong> Choose Render
                  Video, wait for completion, and open the finished file.
                </li>
              </ol>
            </div>
            <div>
              <h2 className="font-serif text-3xl font-bold">What you need</h2>
              <ul className="mt-6 space-y-4 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Windows 10 or 11</strong> on a 64-bit
                  computer.
                </li>
                <li>
                  <strong className="text-foreground">Your photographs</strong> in JPG, JPEG, PNG,
                  or WebP format.
                </li>
                <li>
                  <strong className="text-foreground">Optional audio</strong> in MP3, WAV, M4A, AAC,
                  OGG, or FLAC format.
                </li>
                <li>
                  <strong className="text-foreground">Free disk space</strong> for the source media
                  and rendered MP4 files.
                </li>
              </ul>
              <p className="mt-6 rounded-lg border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
                Your photos, projects, and renders stay on your computer. Collage Studio does not
                require an account or upload your family media to TexEcon.
              </p>
            </div>
          </div>
        </section>

        <section
          id="download"
          className="container mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8"
        >
          <h2 className="font-serif text-3xl font-bold">Download Collage Studio for Windows</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted-foreground">
            Install the desktop app once, then launch it like any other Windows application. The
            editor and video generator are included.
          </p>
          <a
            href={downloadPath}
            className="mt-8 inline-flex rounded-md bg-primary px-7 py-3 font-semibold text-primary-foreground shadow-sm hover:opacity-90"
          >
            Download CollageStudioSetup.exe
          </a>
          <p className="mt-4 text-sm text-muted-foreground">
            Windows 10/11 · 64-bit · Local-first · Code-signed release
          </p>
          <p className="mx-auto mt-8 max-w-xl text-sm text-muted-foreground">
            The installer will be published here with each release. Keep this page bookmarked for
            installation instructions and release notes.
          </p>
        </section>
      </main>
    </div>
  );
}
