/**
 * Derives web-ready logo variants from the supplied artwork (run once; outputs are committed):
 *
 *   node scripts/make-logo-variants.mjs
 *
 * Source:  public/images/lash_globar_logo.webp  (dark plum on transparent, with ~11% padding)
 * Outputs (public/images/logo/, lossless WebP - pixels are never re-compressed):
 *   logo-primary.webp        full lockup (swoosh + LASH GLOBAR + LASH & EXTENSIONS), padding trimmed
 *   logo-compact.webp        swoosh + LASH GLOBAR only (tagline removed) - legible at navbar size
 * Also: src/app/icon.png and src/app/apple-icon.png (swoosh on plum) for the favicon / touch icon.
 *
 * The artwork itself is not redrawn: variants are crops and a flat recolour of its own alpha channel.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'public/images/lash_globar_logo.webp');
const OUT = path.join(root, 'public/images/logo');
fs.mkdirSync(OUT, { recursive: true });

const ALPHA_MIN = 24; // ignore faint anti-alias fuzz when measuring ink
const LIGHT = { r: 0xe6, g: 0xdd, b: 0xf4 }; // --color-lilac-100
const PLUM = '#3B2E55'; // --color-plum

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const alphaAt = (x, y) => data[(y * W + x) * 4 + 3];

// Rows that contain ink, grouped into vertical bands separated by empty rows.
const rowHasInk = Array.from({ length: H }, (_, y) => {
  for (let x = 0; x < W; x++) if (alphaAt(x, y) > ALPHA_MIN) return true;
  return false;
});
const bands = [];
for (let y = 0; y < H; y++) {
  if (rowHasInk[y]) {
    if (bands.length && bands.at(-1).end === y - 1) bands.at(-1).end = y;
    else if (bands.length && y - bands.at(-1).end <= 8)
      bands.at(-1).end = y; // bridge hairline gaps
    else bands.push({ start: y, end: y });
  }
}
console.log('ink bands (rows):', bands.map((b) => `${b.start}-${b.end}`).join('  |  '));
if (bands.length !== 3)
  throw new Error(`Expected 3 bands (swoosh, wordmark, tagline), found ${bands.length}`);
const [swoosh, wordmark, tagline] = bands;

/** Horizontal ink extent within rows [y0, y1]. */
function colExtent(y0, y1) {
  let min = W,
    max = -1;
  for (let y = y0; y <= y1; y++)
    for (let x = 0; x < W; x++)
      if (alphaAt(x, y) > ALPHA_MIN) {
        if (x < min) min = x;
        if (x > max) max = x;
      }
  return { min, max };
}
const PAD = 6; // breathing room so antialiased edges are never clipped
const region = (y0, y1) => {
  const { min, max } = colExtent(y0, y1);
  const left = Math.max(0, min - PAD),
    top = Math.max(0, y0 - PAD);
  return {
    left,
    top,
    width: Math.min(W, max + PAD) - left + 1,
    height: Math.min(H, y1 + PAD) - top + 1,
  };
};

const full = region(swoosh.start, tagline.end);
const compact = region(swoosh.start, wordmark.end);
const markOnly = region(swoosh.start, swoosh.end);

/** Flat recolour: keep the alpha channel, replace RGB. */
async function recolour(buffer, { r, g, b }) {
  const { data: px, info: i } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let n = 0; n < px.length; n += 4) {
    px[n] = r;
    px[n + 1] = g;
    px[n + 2] = b;
  }
  return sharp(px, { raw: { width: i.width, height: i.height, channels: 4 } });
}

const write = async (name, pipeline) => {
  const file = path.join(OUT, name);
  await pipeline.webp({ lossless: true, effort: 6 }).toFile(file);
  const m = await sharp(file).metadata();
  console.log(
    `✓ ${path.relative(root, file)}  ${m.width}×${m.height}  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`,
  );
};

const crop = (r) => sharp(SRC).extract(r);
await write('logo-primary.webp', crop(full));
await write('logo-compact.webp', crop(compact));

// ---- Favicon / touch icon: light swoosh centred on a plum rounded square -------------------------
const markBuf = await crop(markOnly).png().toBuffer();
const lightMark = await (await recolour(markBuf, LIGHT)).png().toBuffer();
async function icon(size, radiusRatio, file) {
  // The swoosh is ~2.7:1, so fit it by width - it should fill the tile, not float in it.
  const inner = Math.round(size * 0.86);
  const mark = await sharp(lightMark).resize({ width: inner }).png().toBuffer();
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${Math.round(size * radiusRatio)}" fill="${PLUM}"/></svg>`,
  );
  await sharp(bg)
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toFile(file);
  console.log(`✓ ${path.relative(root, file)}  ${size}×${size}`);
}
await icon(512, 0.22, path.join(root, 'src/app/icon.png'));
await icon(180, 0, path.join(root, 'src/app/apple-icon.png')); // iOS applies its own rounding
