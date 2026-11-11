/**
 * One-off image crops (run once; outputs are committed).
 *
 *   node scripts/crop-images.mjs
 *
 * Inputs live in `assets-source/` (kept OUT of `public/` so they are never served).
 * Crops are lossless PNG extracts - no resampling, no quality loss.
 *
 * 1. four-step-tutorial.png (1254×1254) is a 2×2 grid with 4px white dividers at
 *    x/y 625–628. Each quadrant is cropped 1px inside its edges to avoid divider
 *    bleed, and the bottom ~16% is trimmed to remove the baked-in step pill
 *    ("Apply Lash Cluster" etc.) so the on-page step titles don't conflict.
 * 2. care-editorial-collage.png (1536×1024) has three panels split by a paler
 *    divider (rows 509–516, cols 760–768): flat-lay, C/D-curl comparison, lifestyle.
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => path.join(root, 'assets-source', f);
const out = (f) => path.join(root, 'public', 'images', f);

async function crop(input, output, region) {
  await sharp(input).extract(region).png({ compressionLevel: 9 }).toFile(output);
  console.log(`✓ ${path.relative(root, output)}  ${region.width}×${region.height}`);
}

// --- 1. Tutorial: 2×2 grid → step-1…4 ---------------------------------------
const tutorial = src('four-step-tutorial.png');
const W = 623; // panel width after 1px inset
const H = 528; // panel height after trimming the label pill strip
const steps = [
  { n: 1, left: 1, top: 1 }, //  top-left
  { n: 2, left: 630, top: 1 }, //  top-right
  { n: 3, left: 1, top: 630 }, //  bottom-left
  { n: 4, left: 630, top: 630 }, //  bottom-right
];
for (const s of steps) {
  await crop(tutorial, out(`sections/steps/step-${s.n}.png`), {
    left: s.left,
    top: s.top,
    width: W,
    height: H,
  });
}

// --- 2. Collage → journal-1/2/3 ---------------------------------------------
const collage = src('care-editorial-collage.png');
await crop(collage, out('journal/journal-1.png'), { left: 0, top: 0, width: 759, height: 508 }); // flat lay
await crop(collage, out('journal/journal-2.png'), { left: 770, top: 0, width: 766, height: 508 }); // C/D curl
await crop(collage, out('journal/journal-3.png'), { left: 0, top: 518, width: 1536, height: 506 }); // lifestyle (wide)
