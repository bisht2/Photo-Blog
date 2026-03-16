#!/usr/bin/env node
/**
 * Updates HTML files to use responsive <picture> elements
 * pointing to optimized image variants.
 *
 * Transforms:
 *   <img src="images/journeys/hawaii/DSC02644.jpg" alt="..." class="...">
 * Into:
 *   <picture>
 *     <source type="image/webp"
 *       srcset="images/journeys/_optimized/hawaii/DSC02644-thumb.webp 400w,
 *               images/journeys/_optimized/hawaii/DSC02644-medium.webp 800w,
 *               images/journeys/_optimized/hawaii/DSC02644-large.webp 1600w"
 *       sizes="...">
 *     <img src="images/journeys/_optimized/hawaii/DSC02644-large.jpg"
 *       srcset="images/journeys/_optimized/hawaii/DSC02644-thumb.jpg 400w,
 *              images/journeys/_optimized/hawaii/DSC02644-medium.jpg 800w,
 *              images/journeys/_optimized/hawaii/DSC02644-large.jpg 1600w"
 *       sizes="..."
 *       alt="..." class="..." loading="lazy">
 *   </picture>
 */

import fs from 'fs';
import path from 'path';

const OPT_DIR = '_optimized';

// Map from original filename (without ext) to sanitized name
function sanitize(basename) {
  return basename.replace(/\s+/g, '-').replace(/[()]/g, '');
}

function getOptPath(originalSrc, suffix, ext) {
  // originalSrc might be relative: "../images/journeys/hawaii/DSC02644.jpg"
  // or root-relative: "images/journeys/hawaii/DSC02644.jpg"
  const prefix = originalSrc.startsWith('../') ? '../' : '';
  const cleaned = originalSrc.replace(/^\.\.\//, '');

  // e.g. "images/journeys/hawaii/DSC02644.jpg"
  const dir = path.dirname(cleaned);     // "images/journeys/hawaii"
  const base = path.basename(cleaned, path.extname(cleaned)); // "DSC02644"
  const safe = sanitize(base);

  // Insert _optimized after "images/journeys/"
  const parts = dir.split('/');
  // parts = ["images", "journeys", "hawaii"]
  // Insert _optimized at index 2
  parts.splice(2, 0, OPT_DIR);

  return `${prefix}${parts.join('/')}/${safe}-${suffix}${ext}`;
}

function transformImg(imgTag, context) {
  // Parse attributes from the img tag
  const srcMatch = imgTag.match(/src="([^"]+)"/);
  const altMatch = imgTag.match(/alt="([^"]*)"/);
  const classMatch = imgTag.match(/class="([^"]*)"/);

  if (!srcMatch) return imgTag;

  const src = srcMatch[1];

  // Only transform journey images
  if (!src.includes('images/journeys/') || src.includes('_optimized')) {
    return imgTag;
  }

  const alt = altMatch ? altMatch[1] : '';
  const cls = classMatch ? classMatch[1] : '';

  // Determine sizes attribute based on context
  let sizes;
  if (context === 'journey-card') {
    // Card images are full-width covers
    sizes = '(max-width: 768px) 100vw, 50vw';
  } else if (context === 'photo-item') {
    // Gallery images are 90% max-width
    sizes = '(max-width: 768px) 100vw, 90vw';
  } else if (context === 'tag-grid') {
    // Tag grid items
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  } else {
    sizes = '100vw';
  }

  const webpSrcset = [
    `${getOptPath(src, 'thumb', '.webp')} 400w`,
    `${getOptPath(src, 'medium', '.webp')} 800w`,
    `${getOptPath(src, 'large', '.webp')} 1600w`,
  ].join(',\n               ');

  const jpgSrcset = [
    `${getOptPath(src, 'thumb', '.jpg')} 400w`,
    `${getOptPath(src, 'medium', '.jpg')} 800w`,
    `${getOptPath(src, 'large', '.jpg')} 1600w`,
  ].join(',\n             ');

  const fallbackSrc = getOptPath(src, 'large', '.jpg');

  return `<picture>
          <source type="image/webp"
            srcset="${webpSrcset}"
            sizes="${sizes}">
          <img src="${fallbackSrc}"
            srcset="${jpgSrcset}"
            sizes="${sizes}"
            alt="${alt}" class="${cls}" loading="lazy">
        </picture>`;
}

function processHtmlFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf-8');
  let changes = 0;

  // Transform journey card images (in journeys.html)
  html = html.replace(
    /<img\s+src="([^"]*images\/journeys\/(?!_optimized)[^"]+)"\s+alt="([^"]*)"\s+class="journey-card__image">/g,
    (match) => {
      changes++;
      return transformImg(match, 'journey-card');
    }
  );

  // Transform photo item images (in individual journey pages)
  html = html.replace(
    /<img\s+src="([^"]*images\/journeys\/(?!_optimized)[^"]+)"\s+alt="([^"]*)"\s+class="photo-item__image">/g,
    (match) => {
      changes++;
      return transformImg(match, 'photo-item');
    }
  );

  if (changes > 0) {
    fs.writeFileSync(filePath, html);
    console.log(`  ✅ ${filePath} — ${changes} images updated`);
  } else {
    console.log(`  ⏭  ${filePath} — no journey images to update`);
  }
}

// Process all HTML files
const files = [
  'journeys.html',
  'journeys/everglades.html',
  'journeys/paris.html',
  'journeys/california.html',
  'journeys/canada.html',
  'journeys/hawaii.html',
];

console.log('📝 Updating HTML files for responsive images\n');

for (const f of files) {
  if (fs.existsSync(f)) {
    processHtmlFile(f);
  } else {
    console.log(`  ⚠️  ${f} not found, skipping`);
  }
}

console.log('\nDone! HTML files now use <picture> with WebP + JPEG srcset.\n');
console.log('Note: tags.html uses JS-rendered images — you\'ll need to');
console.log('update the photo database paths there separately.');
