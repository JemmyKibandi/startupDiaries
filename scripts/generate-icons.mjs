/**
 * Generates icon-192.png and icon-512.png from the SVG icon.
 * Run: node scripts/generate-icons.mjs
 * Requires: npm install sharp (one-time, dev only)
 */
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const svgPath = path.join(__dirname, '../public/icons/icon.svg')
const svg = readFileSync(svgPath)

let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  console.error('Install sharp first: npm install --save-dev sharp')
  process.exit(1)
}

const sizes = [192, 512]
for (const size of sizes) {
  const out = path.join(__dirname, `../public/icons/icon-${size}.png`)
  await sharp(svg).resize(size, size).png().toFile(out)
  console.log(`Generated icon-${size}.png`)
}

console.log('Done. Icons ready in public/icons/')
