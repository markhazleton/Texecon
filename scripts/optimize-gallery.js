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
const photoContextPath = path.join(projectRoot, "client", "src", "data", "memorial-photo-context.json");

const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const tiffTypeSizes = {
  1: 1,
  2: 1,
  3: 2,
  4: 4,
  5: 8,
  7: 1,
  9: 4,
  10: 8,
};

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

async function readExistingPhotoContext() {
  try {
    const context = JSON.parse(await fs.readFile(photoContextPath, "utf8"));
    return Array.isArray(context) ? context : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function optimizeGallery() {
  const existingManifest = await readExistingManifest();
  const existingPhotoContext = await readExistingPhotoContext();
  const contextById = new Map(
    existingPhotoContext
      .filter((photo) => typeof photo.id === "string")
      .map((photo) => [photo.id, photo])
  );
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
  const extractedContextById = new Map();

  for (const [index, source] of orderedSources.entries()) {
    const hashPrefix = source.hash.slice(0, 8);
    const existingId = existingIdByHashPrefix.get(hashPrefix);
    const number = String(nextNumber).padStart(2, "0");
    const basename = existingId ?? `photo-${number}-${hashPrefix}`;
    if (!existingId) nextNumber += 1;
    const image = sharp(source.filePath, { failOn: "warning" }).rotate();
    const metadata = await sharp(source.filePath).metadata();
    const stats = await fs.stat(source.filePath);
    const swapsDimensions = metadata.orientation && metadata.orientation >= 5;
    const width = swapsDimensions ? metadata.height : metadata.width;
    const height = swapsDimensions ? metadata.width : metadata.height;

    if (!width || !height) {
      throw new Error(`Could not determine image dimensions for ${source.filePath}`);
    }

    extractedContextById.set(basename, {
      date: extractPhotoDate(metadata, stats),
      location: extractPhotoLocation(metadata),
    });

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
  await fs.writeFile(
    photoContextPath,
    `${JSON.stringify(buildPhotoContext(photos, contextById, extractedContextById), null, 2)}\n`
  );
  console.log(`\nCreated ${photos.length} responsive gallery images.`);
}

function buildPhotoContext(photos, contextById, extractedContextById) {
  return photos.map((photo) => {
    const existingContext = contextById.get(photo.id) ?? {};
    const extractedContext = extractedContextById.get(photo.id) ?? {};

    return {
      id: photo.id,
      title: typeof existingContext.title === "string" ? existingContext.title : "",
      content: typeof existingContext.content === "string" ? existingContext.content : "",
      date: textOrFallback(existingContext.date, extractedContext.date),
      location: textOrFallback(existingContext.location, extractedContext.location),
    };
  });
}

function textOrFallback(value, fallback) {
  return typeof value === "string" && value.trim()
    ? value
    : typeof fallback === "string"
      ? fallback
      : "";
}

function extractPhotoDate(metadata, stats) {
  const exif = parseExif(metadata.exif);
  const exifDate =
    exif.dateTimeOriginal || exif.dateTimeDigitized || exif.dateTime || metadata.icc?.dateCreated;

  if (typeof exifDate === "string") {
    const normalizedDate = normalizeExifDate(exifDate);
    if (normalizedDate) return normalizedDate;
  }

  return stats.mtime.toISOString().slice(0, 10);
}

function extractPhotoLocation(metadata) {
  const exif = parseExif(metadata.exif);
  if (typeof exif.latitude !== "number" || typeof exif.longitude !== "number") return "";

  return `${exif.latitude.toFixed(6)}, ${exif.longitude.toFixed(6)}`;
}

function normalizeExifDate(value) {
  const match = String(value).match(/^(\d{4}):(\d{2}):(\d{2})/);
  if (!match) return "";

  return `${match[1]}-${match[2]}-${match[3]}`;
}

function parseExif(exifBuffer) {
  if (!Buffer.isBuffer(exifBuffer) || exifBuffer.length < 14) return {};

  const exifHeader = Buffer.from("Exif\0\0", "ascii");
  const headerIndex = exifBuffer.indexOf(exifHeader);
  const tiffStart = headerIndex >= 0 ? headerIndex + exifHeader.length : 0;

  if (tiffStart + 8 > exifBuffer.length) return {};

  const byteOrder = exifBuffer.toString("ascii", tiffStart, tiffStart + 2);
  const littleEndian = byteOrder === "II";
  if (!littleEndian && byteOrder !== "MM") return {};
  if (readUInt16(exifBuffer, tiffStart + 2, littleEndian) !== 42) return {};

  const firstIfdOffset = readUInt32(exifBuffer, tiffStart + 4, littleEndian);
  const zerothIfd = readIfd(exifBuffer, tiffStart, firstIfdOffset, littleEndian);
  const exifIfdOffset = getIntegerValue(exifBuffer, tiffStart, littleEndian, zerothIfd.get(0x8769));
  const gpsIfdOffset = getIntegerValue(exifBuffer, tiffStart, littleEndian, zerothIfd.get(0x8825));
  const exifIfd = exifIfdOffset ? readIfd(exifBuffer, tiffStart, exifIfdOffset, littleEndian) : new Map();
  const gpsIfd = gpsIfdOffset ? readIfd(exifBuffer, tiffStart, gpsIfdOffset, littleEndian) : new Map();

  const dateTimeOriginal = getAsciiValue(
    exifBuffer,
    tiffStart,
    littleEndian,
    exifIfd.get(0x9003)
  );
  const dateTimeDigitized = getAsciiValue(
    exifBuffer,
    tiffStart,
    littleEndian,
    exifIfd.get(0x9004)
  );
  const dateTime = getAsciiValue(exifBuffer, tiffStart, littleEndian, zerothIfd.get(0x0132));
  const gps = parseGps(exifBuffer, tiffStart, littleEndian, gpsIfd);

  return {
    dateTimeOriginal,
    dateTimeDigitized,
    dateTime,
    ...gps,
  };
}

function readIfd(buffer, tiffStart, ifdOffset, littleEndian) {
  const ifdStart = tiffStart + ifdOffset;
  if (ifdStart < tiffStart || ifdStart + 2 > buffer.length) return new Map();

  const entryCount = readUInt16(buffer, ifdStart, littleEndian);
  const entries = new Map();

  for (let index = 0; index < entryCount; index += 1) {
    const entryStart = ifdStart + 2 + index * 12;
    if (entryStart + 12 > buffer.length) break;

    const tag = readUInt16(buffer, entryStart, littleEndian);
    const type = readUInt16(buffer, entryStart + 2, littleEndian);
    const count = readUInt32(buffer, entryStart + 4, littleEndian);
    const valueOffset = readUInt32(buffer, entryStart + 8, littleEndian);
    entries.set(tag, { type, count, valueOffset, valueStart: entryStart + 8 });
  }

  return entries;
}

function parseGps(buffer, tiffStart, littleEndian, gpsIfd) {
  const latitudeRef = getAsciiValue(buffer, tiffStart, littleEndian, gpsIfd.get(0x0001));
  const latitudeParts = getRationalArray(buffer, tiffStart, littleEndian, gpsIfd.get(0x0002));
  const longitudeRef = getAsciiValue(buffer, tiffStart, littleEndian, gpsIfd.get(0x0003));
  const longitudeParts = getRationalArray(buffer, tiffStart, littleEndian, gpsIfd.get(0x0004));

  if (latitudeParts.length !== 3 || longitudeParts.length !== 3) return {};

  let latitude = degreesMinutesSecondsToDecimal(latitudeParts);
  let longitude = degreesMinutesSecondsToDecimal(longitudeParts);

  if (latitudeRef.toUpperCase().startsWith("S")) latitude *= -1;
  if (longitudeRef.toUpperCase().startsWith("W")) longitude *= -1;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return {};

  return { latitude, longitude };
}

function degreesMinutesSecondsToDecimal([degrees, minutes, seconds]) {
  return degrees + minutes / 60 + seconds / 3600;
}

function getAsciiValue(buffer, tiffStart, littleEndian, entry) {
  if (!entry || entry.type !== 2 || entry.count <= 0) return "";
  const valueBuffer = readEntryBuffer(buffer, tiffStart, littleEndian, entry);
  return valueBuffer.toString("ascii").replace(/\0.*$/, "").trim();
}

function getIntegerValue(buffer, tiffStart, littleEndian, entry) {
  if (!entry) return 0;

  if (entry.type === 3) {
    return entry.count <= 1
      ? readUInt16(buffer, entry.valueStart, littleEndian)
      : readUInt16(buffer, tiffStart + entry.valueOffset, littleEndian);
  }

  if (entry.type === 4) {
    return entry.count <= 1
      ? entry.valueOffset
      : readUInt32(buffer, tiffStart + entry.valueOffset, littleEndian);
  }

  return 0;
}

function getRationalArray(buffer, tiffStart, littleEndian, entry) {
  if (!entry || ![5, 10].includes(entry.type) || entry.count <= 0) return [];
  const valueBuffer = readEntryBuffer(buffer, tiffStart, littleEndian, entry);
  const values = [];

  for (let index = 0; index < entry.count; index += 1) {
    const offset = index * 8;
    if (offset + 8 > valueBuffer.length) break;

    const numerator =
      entry.type === 10
        ? readInt32(valueBuffer, offset, littleEndian)
        : readUInt32(valueBuffer, offset, littleEndian);
    const denominator =
      entry.type === 10
        ? readInt32(valueBuffer, offset + 4, littleEndian)
        : readUInt32(valueBuffer, offset + 4, littleEndian);

    values.push(denominator === 0 ? 0 : numerator / denominator);
  }

  return values;
}

function readEntryBuffer(buffer, tiffStart, littleEndian, entry) {
  const typeSize = tiffTypeSizes[entry.type];
  if (!typeSize) return Buffer.alloc(0);

  const byteLength = typeSize * entry.count;
  const valueStart = byteLength <= 4 ? entry.valueStart : tiffStart + entry.valueOffset;
  const valueEnd = valueStart + byteLength;
  if (valueStart < 0 || valueEnd > buffer.length) return Buffer.alloc(0);

  return buffer.subarray(valueStart, valueEnd);
}

function readUInt16(buffer, offset, littleEndian) {
  if (offset + 2 > buffer.length) return 0;
  return littleEndian ? buffer.readUInt16LE(offset) : buffer.readUInt16BE(offset);
}

function readUInt32(buffer, offset, littleEndian) {
  if (offset + 4 > buffer.length) return 0;
  return littleEndian ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset);
}

function readInt32(buffer, offset, littleEndian) {
  if (offset + 4 > buffer.length) return 0;
  return littleEndian ? buffer.readInt32LE(offset) : buffer.readInt32BE(offset);
}

optimizeGallery().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
