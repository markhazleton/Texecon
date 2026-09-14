# Smith History Photos — Photomyne archive

Retrieved September 14, 2026 from the [shared Photomyne album](https://photomyne.com/share?u=E21C14BE-5AFB-4D2F-ACBC-CC52056DBF4A&s=21518768-f26d-4229-91db-c83b6cdc053d_sub).
The album contributor's name was not supplied in the returned metadata.

## Open the collection

- [Offline searchable gallery](index.html): open in a browser and search captions; click an image for the full-size file.
- [Caption catalog](catalog.md): all captions preserved verbatim in album order.
- [Manifest](manifest.json): all photo metadata, source object paths, local filenames, image dimensions, byte sizes, SHA-256 hashes, and retrieval timestamp.
- [Images](images/): 39 full-size JPEG files delivered by the share page, totaling 33,789,689 bytes. These are the shared image versions; availability of higher-resolution camera/scanner originals is unknown.
- [Source metadata](source/photos-000.json): all returned metadata fields. Temporary signed URL query parameters were removed after downloading; source object paths remain.
- `source/share.html` and `source/gallery.js`: captured page and its gallery implementation, documenting the source's metadata and download behavior.

The API reported 39 photos and no further pages. All 39 downloaded images were fully decoded with Pillow. There are 36 captions and three uncaptioned images (032, 034, 036). No back-side images were exposed. Metadata includes no populated people tags or location fields. Photo 035 has year 1844 and month/day -1; this is retained as source metadata and should not be treated as the photograph's date.

## Family-history leads

These are claims from the album captions, not verified conclusions. See the numbered entries in the caption catalog and their associated images.

- 001 and 020 identify Elizabeth Goode with Jared Hazleton. Caption 001 calls Jared her grandson; verify the generation against other family records.
- 003 describes a Thanksgiving gathering circa the 1950s with O.E. Smith Jr., Al Hazleton, O.E. Smith Sr., and Jared Hazleton.
- 009 identifies Myrtle Frances Smith Hazleton as the daughter of O.E. Smith Sr. and Besse Smith.
- 013 describes Mills Smith and O.E. Smith Jr. sharing an apartment in Blackwell, Oklahoma, during the 1930s.
- 017 describes the Smith family's work converting a service station in Carthage into a dry-cleaning shop; the caption's identification of the photographed location is tentative.
- 019 identifies Jared Hazleton and Jackie Smith Devore as cousins, circa the 1940s.
- 021–024 discuss cemetery locations, family relationships, and a child's grave. Burial identifications and difficult-to-read dates include explicit uncertainty.
- 026–028 identify Jared and Elaine Hazleton wedding/family photographs (028 spells the surname “Hazelton”).
- 035 gives John Goode's dates as 1844–1925 and Susan A. Goode's as 1855–1923, identifying them as Besse Smith's paternal grandparents. The proposed burial location is tentative.
- 012 and 038 contain uncertain identifications; preserve the alternatives until corroborated.

Names and spelling variations are retained exactly in the source metadata and catalog. Text embedded in the photographs has not been separately transcribed or OCR-processed.

## Refresh and verification

`python .knowledge/jared-hazleton/photomyne-smith-history/archive.py` refreshes the images, metadata, catalog, and gallery using Python and Pillow. It overwrites those archive outputs and stops if the album requires additional pagination; it does not refresh the captured HTML/JavaScript. The manifest records the actual retrieval timestamp.

This collection lives only in the knowledge folder. No application, public assets, navigation, SEO, or publishing configuration was changed. No site build is needed for this reference-only addition.
