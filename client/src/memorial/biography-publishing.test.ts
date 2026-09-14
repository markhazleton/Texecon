import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import biography from "@/data/jared-biography.json";

describe("biography static publishing", () => {
  it.each(["/", "/Texecon/"])("preserves the story, metadata, and API URL with base %s", (base) => {
    const tempRoot = realpathSync(tmpdir());
    const fixture = mkdtempSync(path.join(tempRoot, "texecon-biography-"));
    try {
      for (const directory of ["scripts", "client/src/data", "client/public", "target"]) {
        mkdirSync(path.join(fixture, directory), { recursive: true });
      }
      writeFileSync(path.join(fixture, "package.json"), JSON.stringify({ type: "module" }));
      for (const script of ["generate-static-pages.js", "generate-sitemap.js"]) {
        copyFileSync(path.resolve("scripts", script), path.join(fixture, "scripts", script));
      }
      copyFileSync(path.resolve("client/index.html"), path.join(fixture, "target/index.html"));
      writeFileSync(
        path.join(fixture, "client/src/data/jared-biography.json"),
        JSON.stringify(biography)
      );
      const rawContent = JSON.stringify({
        data: {
          menu: [
            {
              id: 1,
              title: "Jared Hazleton",
              url: biography.url.replace(/\/$/, ""),
              content: "OUTDATED API PROFILE 1961",
              display_navigation: true,
              order: 1,
            },
            {
              id: 2,
              title: "Texas",
              url: "/texas",
              content: "Preserved archive content",
              display_navigation: true,
              order: 2,
            },
          ],
        },
      });
      const rawPath = path.join(fixture, "client/src/data/webspark-raw.json");
      writeFileSync(rawPath, rawContent);
      const env = { ...process.env, VITE_BASE_PATH: base, SITE_BASE_URL: "https://texecon.com" };
      for (const script of ["generate-static-pages.js", "generate-sitemap.js"]) {
        execFileSync(process.execPath, [path.join(fixture, "scripts", script)], {
          env,
          cwd: fixture,
          stdio: "pipe",
        });
      }

      const parse = (file: string) =>
        new DOMParser().parseFromString(
          readFileSync(path.join(fixture, file), "utf8"),
          "text/html"
        );
      const page = parse(`target${biography.url}index.html`);
      expect(page.title).toBe(`${biography.title} | TexEcon`);
      expect(page.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
        `https://texecon.com${biography.url}`
      );
      expect(page.querySelector('meta[property="og:url"]')?.getAttribute("content")).toBe(
        `https://texecon.com${biography.url}`
      );
      expect(page.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
        biography.description
      );
      const root = page.getElementById("root")!;
      expect(root.textContent).not.toContain("OUTDATED API PROFILE");
      expect(root.textContent).toContain(biography.introduction);
      biography.sections.forEach((section) => {
        const rendered = page.getElementById(section.id)!;
        section.paragraphs.forEach((paragraph) =>
          expect(rendered.textContent).toContain(paragraph)
        );
      });
      page.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
        expect(page.getElementById(link.getAttribute("href")!.slice(1))).not.toBeNull();
      });
      expect(root.querySelector("header a")?.getAttribute("href")).toBe(base);
      expect(root.querySelector("img")?.getAttribute("src")).toBe(`${base}jared-hazleton.png`);
      expect(page.querySelector("#source-family-memories a")?.getAttribute("href")).toBe(
        `${base}#tribute`
      );
      const schemas = [...page.querySelectorAll('script[type="application/ld+json"]')].map(
        (script) => JSON.parse(script.textContent!)
      );
      const profile = schemas.find((schema) => schema["@type"] === "ProfilePage");
      expect(profile.url).toBe(`https://texecon.com${biography.url}`);
      expect(profile.mainEntity["@id"]).toBe("https://texecon.com/#jared-hazleton");

      for (const file of ["target/index.html", "target/memorial/jared-earl-hazleton/index.html"]) {
        const home = parse(file);
        expect(home.body.textContent).toContain(biography.tribute.opening);
        biography.tribute.paragraphs.forEach((paragraph) =>
          expect(home.body.textContent).toContain(paragraph)
        );
        expect(home.body.textContent).not.toContain("Rice University in 1961");
        expect(home.querySelector(`a[href="${base}${biography.url.slice(1)}"]`)).not.toBeNull();
      }
      expect(parse("target/texas/index.html").body.textContent).toContain(
        "Preserved archive content"
      );
      expect(readFileSync(rawPath, "utf8")).toBe(rawContent);
      const sitemap = new DOMParser().parseFromString(
        readFileSync(path.join(fixture, "client/public/sitemap.xml"), "utf8"),
        "application/xml"
      );
      const locations = [...sitemap.querySelectorAll("loc")].map((loc) => loc.textContent);
      expect(locations.filter((url) => url === `https://texecon.com${biography.url}`)).toHaveLength(
        1
      );
      expect(locations).toContain("https://texecon.com/texas/");
      expect(readFileSync(path.join(fixture, "client/public/robots.txt"), "utf8")).toContain(
        "Sitemap: https://texecon.com/sitemap.xml"
      );
    } finally {
      const resolved = realpathSync(fixture);
      if (
        path.dirname(resolved) !== tempRoot ||
        !path.basename(resolved).startsWith("texecon-biography-")
      ) {
        throw new Error("Refusing to remove a fixture outside the intended temporary directory");
      }
      rmSync(resolved, { recursive: true, force: true });
    }
  });
});
