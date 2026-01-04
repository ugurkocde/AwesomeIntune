import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const svgPath = join(publicDir, 'favicon.svg');
const svgBuffer = readFileSync(svgPath);

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-192x192.png', size: 192 },
  { name: 'favicon-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generateFavicons() {
  console.log('Generating favicons from SVG...');

  for (const { name, size } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(publicDir, name));
    console.log(`Created ${name}`);
  }

  // Generate ICO file (contains 16x16, 32x32, and 48x48)
  const ico16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const ico32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const ico48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();

  // Create ICO file manually (simple ICO format)
  const icoBuffer = createIco([
    { buffer: ico16, size: 16 },
    { buffer: ico32, size: 32 },
    { buffer: ico48, size: 48 },
  ]);

  writeFileSync(join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Created favicon.ico');

  console.log('All favicons generated successfully!');
}

function createIco(images) {
  // ICO file format:
  // - ICONDIR header (6 bytes)
  // - ICONDIRENTRY for each image (16 bytes each)
  // - Image data (PNG format)

  const numImages = images.length;
  const headerSize = 6;
  const entrySize = 16;
  const dataOffset = headerSize + numImages * entrySize;

  // Calculate total size
  let totalSize = dataOffset;
  for (const img of images) {
    totalSize += img.buffer.length;
  }

  const buffer = Buffer.alloc(totalSize);
  let offset = 0;

  // ICONDIR header
  buffer.writeUInt16LE(0, offset); offset += 2; // Reserved
  buffer.writeUInt16LE(1, offset); offset += 2; // Type (1 = ICO)
  buffer.writeUInt16LE(numImages, offset); offset += 2; // Number of images

  // ICONDIRENTRY for each image
  let imageOffset = dataOffset;
  for (const img of images) {
    buffer.writeUInt8(img.size === 256 ? 0 : img.size, offset); offset += 1; // Width
    buffer.writeUInt8(img.size === 256 ? 0 : img.size, offset); offset += 1; // Height
    buffer.writeUInt8(0, offset); offset += 1; // Color palette
    buffer.writeUInt8(0, offset); offset += 1; // Reserved
    buffer.writeUInt16LE(1, offset); offset += 2; // Color planes
    buffer.writeUInt16LE(32, offset); offset += 2; // Bits per pixel
    buffer.writeUInt32LE(img.buffer.length, offset); offset += 4; // Size of image data
    buffer.writeUInt32LE(imageOffset, offset); offset += 4; // Offset to image data
    imageOffset += img.buffer.length;
  }

  // Write image data
  for (const img of images) {
    img.buffer.copy(buffer, offset);
    offset += img.buffer.length;
  }

  return buffer;
}

generateFavicons().catch(console.error);
