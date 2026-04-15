# Content Guide — Itsy Bitsy

A step-by-step guide for adding new photos and videos to the site.

---

## Prerequisites (One-Time Setup)

Make sure you have **Node.js** installed. Then run this once in the project folder:

```bash
npm install
```

This installs **Sharp**, the image processing library used by the build script.

---

## Adding New Photos

### Step 1: Add Source Images

Place your original high-resolution photos in the appropriate folder:

```
images/journeys/<trip-name>/
```

- Use an existing folder (e.g., `everglades`, `california`, `hawaii`, `paris`, `canada`)
- Or create a new folder for a new trip

**Recommended file naming**: `YYYY-location-description.jpg`
Example: `2024-everglades-sunset-over-marsh.jpg`

### Step 2: Generate Optimized Images

Run the build script from the project root:

```bash
node build-images.mjs
```

This creates **6 variants** of each photo in `images/journeys/_optimized/<trip-name>/`:

| Size   | Width  | Formats        |
|--------|--------|----------------|
| Thumb  | 400px  | JPEG + WebP    |
| Medium | 800px  | JPEG + WebP    |
| Large  | 1600px | JPEG + WebP    |

To **regenerate all** images (e.g., if you changed quality settings):

```bash
node build-images.mjs --force
```

### Step 3: Add Photo Metadata to Tags Page

Open `tags.html` and find the `photos` array (around line 421). Add a new entry:

```javascript
{
  src: "images/journeys/<trip>/<filename>.jpg",
  alt: "Describe what's in the photo for accessibility",
  caption: "A short poetic caption shown to visitors",
  journey: "Journey Title",
  journeyUrl: "journeys/<trip>.html",
  location: "<trip>",       // hawaii, california, florida, paris, canada
  year: "2024",
  subjects: ["landscapes"], // landscapes, sunsets, wildlife, birding, architecture, city
  notes: ""                 // internal notes, not shown on site
}
```

### Step 4: Add Photo to the Journey Page

Open the journey page (e.g., `journeys/everglades.html`) and add a new photo section using this template:

```html
<div class="photo-entry">
  <picture>
    <source type="image/webp"
      srcset="../images/journeys/_optimized/<trip>/<filename>-thumb.webp 400w,
              ../images/journeys/_optimized/<trip>/<filename>-medium.webp 800w,
              ../images/journeys/_optimized/<trip>/<filename>-large.webp 1600w"
      sizes="(max-width: 768px) 100vw, 80vw">
    <img src="../images/journeys/_optimized/<trip>/<filename>-large.jpg"
      srcset="../images/journeys/_optimized/<trip>/<filename>-thumb.jpg 400w,
              ../images/journeys/_optimized/<trip>/<filename>-medium.jpg 800w,
              ../images/journeys/_optimized/<trip>/<filename>-large.jpg 1600w"
      sizes="(max-width: 768px) 100vw, 80vw"
      alt="Description of the photo"
      loading="lazy">
  </picture>
  <p class="photo-caption">Your caption here</p>
</div>
```

### Step 5 (New Trip Only): Add a Journey Card

If this is a **brand new trip**, you also need to:

1. **Create a new journey page** — copy an existing one (e.g., `journeys/hawaii.html`) and update the content
2. **Add a card to `journeys.html`** — add a new journey card with the featured image, title, location, year, and description

---

## Adding New Videos

### Step 1: Upload to YouTube

Upload your video to YouTube (or another platform). Note the video ID from the URL:

```
https://youtu.be/iqZ5bdFqJSw
                 ^^^^^^^^^^^^ this is the video ID
```

### Step 2: Create a Film Page

Copy an existing film page (e.g., `films/moments-in-motion.html`) and update:

- Page title and metadata
- YouTube embed URL: `https://www.youtube.com/embed/<VIDEO_ID>`
- Film title, location, year
- Description/reflections text

### Step 3: Add a Thumbnail

Pick a frame from your video or use YouTube's auto-generated thumbnail. Save it to:

```
images/journeys/<trip>/<thumbnail-filename>.jpg
```

Then run `node build-images.mjs` to generate optimized versions.

### Step 4: Add a Card to the Films Index

Open `films.html` and add a new film card with the thumbnail, title, duration, and link to the film page.

---

## Deploying to Cloudflare Pages

After making changes, push to GitHub and Cloudflare Pages will auto-deploy:

```bash
git add images/journeys/_optimized/
git add journeys.html tags.html films.html
git add journeys/<new-trip>.html       # if new journey page
git add films/<new-film>.html          # if new film page
git commit -m "Add new photos/videos"
git push
```

**Important notes:**
- Only **optimized images** (`_optimized/` folder) get deployed — source images stay local
- The `.gitignore` excludes source photos, `.mp4` files, and build scripts
- Cloudflare Pages has a **25MB deploy limit** — videos must be hosted externally (YouTube)
- HTML pages have no caching, so updates appear immediately after deploy
- Optimized images are cached for 1 year (immutable), so use new filenames if replacing a photo

---

## Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Optimize new images | `node build-images.mjs` |
| Re-optimize all images | `node build-images.mjs --force` |
| Deploy | `git add . && git commit -m "msg" && git push` |

| File | Purpose |
|------|---------|
| `images/journeys/<trip>/` | Source photos (local only) |
| `images/journeys/_optimized/` | Optimized photos (deployed) |
| `tags.html` | Photo metadata & tag database |
| `journeys.html` | Journey index page |
| `journeys/<trip>.html` | Individual journey pages |
| `films.html` | Films index page |
| `films/<film>.html` | Individual film pages |
| `build-images.mjs` | Image optimization script |
