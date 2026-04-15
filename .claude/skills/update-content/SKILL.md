---
name: update-content
description: Update the Itsy Bitsy photo blog after the user adds new photos or videos. Detects new source images, runs the optimizer, collects captions/metadata from the user, updates all relevant HTML files (journey pages, tags.html, journeys.html, films pages), and offers to commit and push. Invoke whenever the user says they've added new photos, videos, or content to the site.
---

# Update Content Skill

You're updating the Itsy Bitsy photo blog with new photos or videos the user just added. This skill walks you through the entire workflow.

## Step 1: Detect what's new

Run these checks in parallel to identify what's new:

1. **New source images**: Compare `images/journeys/<trip>/` folders against `images/journeys/_optimized/<trip>/`. Look for source files (`.jpg`, `.jpeg`, `.png`) whose basename doesn't have corresponding `<basename>-large.jpg` in `_optimized/`.
2. **Git status**: Run `git status --short` to see everything that's changed.
3. **New trip folders**: Check if any folder in `images/journeys/` has no matching `_optimized/` counterpart.

Report findings to the user concisely (e.g. "Found 3 new photos in hawaii/ and 2 new photos in canada/"). If nothing new is detected, ask the user what they added.

## Step 2: Run the optimizer

If there are new source images, run:

```bash
node build-images.mjs
```

If node isn't in PATH, fall back to the full path: `"/c/Program Files/nodejs/node.exe" build-images.mjs`

After it completes, if the output filenames include suffixes like `-2-` (from watermarked source files named `X-2.jpg`), rename the optimized files to remove the `-2-` so they match the HTML references. Use a bash loop like:

```bash
for f in images/journeys/_optimized/*/*-2-*.{jpg,webp}; do
  mv "$f" "$(echo "$f" | sed 's/-2-/-/')"
done
```

## Step 3: Collect metadata for each new photo

For each new photo, ask the user (batch related questions to avoid ping-ponging):

- **Which journey/trip does this belong to?** (if ambiguous)
- **Caption** — the short poetic text shown under the photo
- **Alt text** — descriptive text for accessibility (can be auto-suggested based on the caption if user wants)
- **Subjects** — pick from: landscapes, sunsets, wildlife, birding, architecture, city (can be multiple)
- **Year** — if not obvious from context
- **Reflections/description paragraphs** (optional) — longer thoughts that go on the journey page

Use the `AskUserQuestion` tool for structured multi-question prompts when it'll save round-trips. For freeform answers like captions, plain text is fine.

If the user has multiple photos, offer to batch them: show all photos in a numbered list and accept answers in the same numbered format.

## Step 4: Update the HTML files

For each new photo, update these files:

### `journeys/<trip>.html` (the detail page)
Add a new photo section using the existing pattern on that page. Match the existing photo-entry structure exactly. Use the optimized image paths with responsive `<picture>` elements:

```html
<picture>
  <source type="image/webp"
    srcset="../images/journeys/_optimized/<trip>/<file>-thumb.webp 400w,
            ../images/journeys/_optimized/<trip>/<file>-medium.webp 800w,
            ../images/journeys/_optimized/<trip>/<file>-large.webp 1600w"
    sizes="(max-width: 768px) 100vw, 80vw">
  <img src="../images/journeys/_optimized/<trip>/<file>-large.jpg"
    srcset="../images/journeys/_optimized/<trip>/<file>-thumb.jpg 400w,
            ../images/journeys/_optimized/<trip>/<file>-medium.jpg 800w,
            ../images/journeys/_optimized/<trip>/<file>-large.jpg 1600w"
    sizes="(max-width: 768px) 100vw, 80vw"
    alt="<alt text>"
    loading="lazy">
</picture>
```

Ask the user where on the page to insert it (top, bottom, after a specific existing photo) if position matters.

### `tags.html` (the metadata database)
Add a new entry to the `photos` array near line 421. Use the existing entry structure:

```javascript
{
  src: "images/journeys/<trip>/<original-filename>.jpg",
  alt: "<alt text>",
  caption: "<caption>",
  journey: "<Journey Title>",
  journeyUrl: "journeys/<trip>.html",
  location: "<trip>",
  year: "<year>",
  subjects: [<subjects>],
  notes: ""
}
```

### `journeys.html` (only if new trip)
If this is a brand new trip, add a journey card in the appropriate spot.

### `index.html` (only if user explicitly requests featuring)
Only touch the landing page if the user asks to feature a new photo there.

## Step 5: Verify

After edits, briefly describe what changed and offer to start the local preview server so the user can verify:

```bash
npx serve . -l 8080
```

Or point them to `node toolkit.js` if they prefer the GUI.

## Step 6: Commit and push

Ask the user if they want to commit and push. If yes:

1. Run `git status --short` to show what'll be committed
2. Ask for a commit message (suggest one based on what changed, e.g. "Add 3 new Hawaii photos")
3. Stage the relevant files (optimized images + modified HTML), NOT source images or node_modules
4. Commit with the message + Claude co-author line
5. Push to origin/main

## Rules

- **Never add unrelated features** — this skill only updates content, not design/code.
- **Always preview changes** — show a brief summary before committing.
- **Match existing HTML style** — look at how existing photos are rendered on each journey page and mirror that structure. Different journey pages may have slightly different layouts.
- **Keep the user in control** — confirm before pushing; confirm before making design decisions (like where to place a photo).
- **Batch questions** — if collecting metadata for 5 photos, don't ask 25 separate questions. Offer a numbered format or a single structured prompt.
- **Check for watermark artifacts** — if new files have `-2` suffixes from watermarking tools, fix those rename issues automatically.
