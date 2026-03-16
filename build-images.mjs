#!/usr/bin/env node
/**
 * Image Optimization Build Script for Itsy Bitsy
 * ================================================
 * Generates web-optimized versions of all journey photos.
 *
 * For each original image, creates:
 *   - A compressed JPEG at 3 sizes (400w thumb, 800w medium, 1600w large)
 *   - A WebP version at the same 3 sizes
 *
 * Output goes to images/journeys/_optimized/ mirroring the folder structure.
 * Originals are NOT modified or deleted.
 *
 * Usage:
 *   node build-images.mjs           # Process all images
 *   node build-images.mjs --force   # Re-process even if output exists
 *
 * After adding new photos, just run this script again — it only processes
 * images that don't already have optimized versions (unless --force is used).
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SOURCE_DIR = 'images/journeys';
const OUTPUT_DIR = 'images/journeys/_optimized';
const FORCE = process.argv.includes('--force');

// Size variants to generate
const SIZES = [
  { suffix: 'thumb', width: 400 },
  { suffix: 'medium', width: 800 },
  { suffix: 'large', width: 1600 },
];

const JPEG_QUALITY = 82;
const WEBP_QUALITY = 80;

// Supported image extensions
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.tiff', '.tif']);

async function findImages(dir) {
  const images = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '_optimized') continue; // Skip output dir
      images.push(...await findImages(fullPath));
    } else if (IMAGE_EXTS.has(path.extname(entry.name).toLowerCase())) {
      images.push(fullPath);
    }
  }
  return images;
}

function getOutputPath(srcPath, size, format) {
  // e.g. images/journeys/hawaii/DSC02644.jpg
  //   -> images/journeys/_optimized/hawaii/DSC02644-large.webp
  const rel = path.relative(SOURCE_DIR, srcPath);
  const dir = path.dirname(rel);
  const base = path.basename(rel, path.extname(rel));
  // Sanitize filename (replace spaces with hyphens)
  const safeName = base.replace(/\s+/g, '-').replace(/[()]/g, '');
  const ext = format === 'webp' ? '.webp' : '.jpg';
  return path.join(OUTPUT_DIR, dir, `${safeName}-${size.suffix}${ext}`);
}

async function processImage(srcPath) {
  const rel = path.relative(SOURCE_DIR, srcPath);
  const metadata = await sharp(srcPath).metadata();
  const originalWidth = metadata.width;

  let processed = 0;
  let skipped = 0;

  for (const size of SIZES) {
    // Don't upscale — if original is smaller than target, use original width
    const targetWidth = Math.min(size.width, originalWidth);

    for (const format of ['jpeg', 'webp']) {
      const outPath = getOutputPath(srcPath, size, format);
      const outDir = path.dirname(outPath);

      // Skip if already exists (unless --force)
      if (!FORCE && fs.existsSync(outPath)) {
        skipped++;
        continue;
      }

      fs.mkdirSync(outDir, { recursive: true });

      let pipeline = sharp(srcPath)
        .resize(targetWidth, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .rotate(); // Auto-rotate based on EXIF

      if (format === 'jpeg') {
        pipeline = pipeline.jpeg({
          quality: JPEG_QUALITY,
          progressive: true,
          mozjpeg: true,
        });
      } else {
        pipeline = pipeline.webp({
          quality: WEBP_QUALITY,
          effort: 4,
        });
      }

      await pipeline.toFile(outPath);
      processed++;
    }
  }

  const total = SIZES.length * 2;
  if (skipped === total) {
    console.log(`  ⏭  ${rel} (all variants exist, use --force to regenerate)`);
  } else {
    console.log(`  ✅ ${rel} → ${processed} variants generated${skipped ? `, ${skipped} skipped` : ''}`);
  }
}

async function main() {
  console.log('🖼  Itsy Bitsy Image Optimizer');
  console.log('=============================\n');

  const images = await findImages(SOURCE_DIR);
  console.log(`Found ${images.length} source images.\n`);

  if (images.length === 0) {
    console.log('No images found. Nothing to do.');
    return;
  }

  console.log('Processing...\n');
  for (const img of images) {
    await processImage(img);
  }

  // Print summary
  console.log('\n--- Summary ---');
  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const img of images) {
    totalOriginal += fs.statSync(img).size;
  }

  // Count optimized files
  let optimizedCount = 0;
  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(full);
      } else {
        totalOptimized += fs.statSync(full).size;
        optimizedCount++;
      }
    }
  }
  walkDir(OUTPUT_DIR);

  console.log(`Original images: ${images.length} files, ${(totalOriginal / (1024 * 1024)).toFixed(1)} MB`);
  console.log(`Optimized output: ${optimizedCount} files, ${(totalOptimized / (1024 * 1024)).toFixed(1)} MB`);
  console.log(`\nDone! Optimized images are in ${OUTPUT_DIR}/`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
