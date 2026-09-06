import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const sourceDirectory = path.join(projectRoot, "images");
const outputDirectory = path.join(projectRoot, "client", "public", "images", "memorial");
const manifestPath = path.join(projectRoot, "client", "src", "data", "memorial-gallery.json");

const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function sourceHash(filePath) {
  const contents = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(contents).digest("hex");
}

async function readExistingManifest() {
  try {
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    return Array.isArray(manifest) ? manifest : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function optimizeGallery() {
  const existingManifest = await readExistingManifest();
  const sourceNames = (await fs.readdir(sourceDirectory))
    .filter((name) => supportedExtensions.has(path.extname(name).toLowerCase()))
    .sort((left, right) => left.localeCompare(right, "en", { numeric: true }));

  const uniqueSources = [];
  const seenHashes = new Set();

  for (const name of sourceNames) {
    const filePath = path.join(sourceDirectory, name);
    const hash = await sourceHash(filePath);
    if (seenHashes.has(hash)) continue;

    seenHashes.add(hash);
    uniqueSources.push({ filePath, hash });
  }

  // Preserve existing IDs and display order so adding a source image does not
  // invalidate every generated asset URL that follows it alphabetically.
  const sourceByHashPrefix = new Map(
    uniqueSources.map((source) => [source.hash.slice(0, 8), source])
  );
  const existingIdByHashPrefix = new Map();
  const orderedSources = [];
  const orderedHashes = new Set();

  for (const photo of existingManifest) {
    const match = typeof photo.id === "string" ? photo.id.match(/-([a-f0-9]{8})$/) : null;
    const hashPrefix = match?.[1];
    const source = hashPrefix ? sourceByHashPrefix.get(hashPrefix) : undefined;
    if (!source || orderedHashes.has(source.hash)) continue;

    existingIdByHashPrefix.set(hashPrefix, photo.id);
    orderedSources.push(source);
    orderedHashes.add(source.hash);
  }

  for (const source of uniqueSources) {
    if (orderedHashes.has(source.hash)) continue;
    orderedSources.push(source);
    orderedHashes.add(source.hash);
  }

  const previousNumbers = existingManifest
    .map((photo) => (typeof photo.id === "string" ? photo.id.match(/^photo-(\d+)-/) : null))
    .map((match) => Number(match?.[1] ?? 0));
  let nextNumber = Math.max(0, ...previousNumbers) + 1;

  await fs.rm(outputDirectory, { recursive: true, force: true });
  await fs.mkdir(outputDirectory, { recursive: true });

  const photos = [];

  for (const [index, source] of orderedSources.entries()) {
    const hashPrefix = source.hash.slice(0, 8);
    const existingId = existingIdByHashPrefix.get(hashPrefix);
    const number = String(nextNumber).padStart(2, "0");
    const basename = existingId ?? `photo-${number}-${hashPrefix}`;
    if (!existingId) nextNumber += 1;
    const image = sharp(source.filePath, { failOn: "warning" }).rotate();
    const metadata = await sharp(source.filePath).metadata();
    const swapsDimensions = metadata.orientation && metadata.orientation >= 5;
    const width = swapsDimensions ? metadata.height : metadata.width;
    const height = swapsDimensions ? metadata.width : metadata.height;

    if (!width || !height) {
      throw new Error(`Could not determine image dimensions for ${source.filePath}`);
    }

    await Promise.all([
      image
        .clone()
        .resize({ width: 240, height: 240, fit: "cover", withoutEnlargement: true })
        .webp({ quality: 58, effort: 5 })
        .toFile(path.join(outputDirectory, `${basename}-thumb.webp`)),
      image
        .clone()
        .resize({ width: 960, height: 960, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 72, effort: 5 })
        .toFile(path.join(outputDirectory, `${basename}-960.webp`)),
      image
        .clone()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 78, effort: 5 })
        .toFile(path.join(outputDirectory, `${basename}-1600.webp`)),
      image
        .clone()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 82, progressive: true, mozjpeg: true })
        .toFile(path.join(outputDirectory, `${basename}-1600.jpg`)),
    ]);

    const placeholder = await image
      .clone()
      .resize({ width: 32, height: 32, fit: "inside" })
      .blur(0.5)
      .webp({ quality: 24 })
      .toBuffer();

    photos.push({
      id: basename,
      alt: `Memorial photograph ${index + 1} of ${orderedSources.length} from the Hazleton family collection`,
      width,
      height,
      placeholder: `data:image/webp;base64,${placeholder.toString("base64")}`,
      thumbnail: `images/memorial/${basename}-thumb.webp`,
      webpSmall: `images/memorial/${basename}-960.webp`,
      webpLarge: `images/memorial/${basename}-1600.webp`,
      fallback: `images/memorial/${basename}-1600.jpg`,
    });

    process.stdout.write(`Optimized ${index + 1}/${orderedSources.length}\r`);
  }

  await fs.writeFile(manifestPath, `${JSON.stringify(photos, null, 2)}\n`);
  console.log(`\nCreated ${photos.length} responsive gallery images.`);
}

optimizeGallery().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
