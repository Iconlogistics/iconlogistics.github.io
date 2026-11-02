// Regenerates everything under site/assets/img, the share image and the icons
// from the originals in assets/. Only needed when a photo changes; the site itself has no build step.
//   npm install sharp
//   node tools/build-images.cjs
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'assets');
const out = path.join(root, 'site', 'assets');
const imgOut = path.join(out, 'img');
const NAVY = '#131C2E';
const TARGET_WIDTHS = [480, 960, 1600, 2400];

// Widths at or below the original, plus the original itself when it is
// noticeably wider than the last step. Nothing is ever upscaled.
function widthsFor(original) {
  const widths = TARGET_WIDTHS.filter((w) => w <= original);
  if (original > widths[widths.length - 1] * 1.1) widths.push(original);
  return widths;
}

async function photos() {
  fs.rmSync(imgOut, { recursive: true, force: true });
  fs.mkdirSync(imgOut, { recursive: true });
  const files = fs.readdirSync(src).filter((f) => f.endsWith('.jpg'));
  for (const file of files) {
    const name = path.basename(file, '.jpg');
    const input = path.join(src, file);
    const { width } = await sharp(input).metadata();
    const widths = widthsFor(width);
    for (const w of widths) {
      const base = path.join(imgOut, `${name}-${w}`);
      const resized = () => sharp(input).rotate().resize({ width: w, withoutEnlargement: true });
      await resized().avif({ quality: 50, effort: 4 }).toFile(`${base}.avif`);
      await resized().webp({ quality: 74, effort: 5 }).toFile(`${base}.webp`);
      await resized().jpeg({ quality: 76, mozjpeg: true }).toFile(`${base}.jpg`);
    }
    console.log(name, widths.join(' '));
  }
}

async function shareImage() {
  await sharp(path.join(src, 'airport-lounge-takeoff.jpg'))
    .resize(1200, 630, { fit: 'cover', position: 'top' })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(path.join(out, 'og-image.jpg'));
}

// The mark on a navy square, with padding as a share of the square's width.
async function icon(size, padding) {
  const inner = Math.round(size * (1 - padding * 2));
  const mark = await sharp(path.join(src, 'logo-icon-mark.png'))
    .resize({ width: inner, fit: 'inside' })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: NAVY } })
    .composite([{ input: mark, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// A one-image .ico holding a PNG payload, which every current browser reads.
function ico(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  return Buffer.concat([header, png]);
}

async function icons() {
  const dir = path.join(out, 'icons');
  fs.mkdirSync(dir, { recursive: true });
  const small = await icon(32, 0.06);
  fs.writeFileSync(path.join(dir, 'favicon-32.png'), small);
  fs.writeFileSync(path.join(root, 'site', 'favicon.ico'), ico(small, 32));
  fs.writeFileSync(path.join(dir, 'apple-touch-icon.png'), await icon(180, 0.14));
  fs.copyFileSync(path.join(src, 'logo-icon-mark.png'), path.join(out, 'logo-icon-mark.png'));
}

(async () => {
  await photos();
  await shareImage();
  await icons();
})();
