# Client lash photography — October 2026

All eight photographs supplied in the project folder are included in the
collection: Wispy hybrid, Volume, Line effect, Wispy lash lift, Classic,
Fox eye, Anime volume and Brown set. Labels follow the supplied filenames.
The Classic close-up also replaces the product kit in the aftercare section.

Source files are in `assets/lashes`. The HEIC photo was decoded with macOS
`sips -s format png`; the other sources were copied directly. No AI generation,
retouching, sharpening, skin smoothing, background replacement or colour
grading is applied.

`node scripts/prepare-lash-photos.mjs` exports lossless WebP files and verifies
the full-size decoded pixels against each decoded source. Smaller 480px and
900px lossless display copies are generated directly from those same pixels
for responsive loading. Only the three visible carousel images load.

`lib/lash-collection.ts` holds the shared labels, copy, dimensions and crop
positions. CSS crops affect display only; the result view contains the complete
photograph. Production has no AR links or routes.
