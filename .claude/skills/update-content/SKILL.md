---
name: update-content
description: Run when the user says they've added new photos or videos to the Itsy Bitsy blog. Detects new sources, optimizes them, writes captions by looking at the images, updates journey HTML + tags.html metadata, commits and pushes.
---

# Update Content

## 1. Detect changes

- `git status --short` — see what's new
- List source files in `images/journeys/<trip>/` without matching `<basename>-large.jpg` in `_optimized/<trip>/` → these need optimizing
- Report concisely: "Found N new photos in <trip>/"

## 2. Optimize

```bash
node build-images.mjs
```

If node isn't on PATH, use `"/c/Program Files/nodejs/node.exe"`.

**Watermark filename cleanup** — if the optimizer produced `<name>-2-*` files:
- If non-suffixed variants (`<name>-*`) exist alongside → `-2-` versions are leftover duplicates, delete them
- If only `-2-` versions exist → rename to remove the `-2-` so HTML references resolve

```bash
find images/journeys/_optimized -name "*-2-*" -type f -delete
```

## 3. Generate captions + metadata

For each new photo, read the medium-size optimized variant to see it (e.g. `images/journeys/_optimized/<trip>/<name>-medium.jpg`) and write:

- **caption** — short poetic line matching site voice (see existing captions in `tags.html`)
- **alt** — descriptive sentence of what's in the image
- **subjects** — from: `landscapes, sunsets, wildlife, birding, architecture, city`
- **year, location** — infer from trip folder / context

Show the user the proposed captions in a numbered list before writing files; let them edit. If they say "use your judgment" or similar, proceed without confirmation.

## 4. Update HTML

**`journeys/<trip>.html`** — append new `<div class="photo-item">` blocks at the bottom of `.photo-gallery` (or where user specified). Mirror the exact `<picture>` structure of existing entries on that specific page. Paths are relative (`../images/journeys/_optimized/...`).

**`tags.html`** — add objects to the `photos` array inside the matching `// --- <TRIP> ---` section. Note `src` points to the **original** filename (not `_optimized`) — the runtime derives optimized paths.

**`journeys.html`** — only touch if it's a brand new trip (new folder).
**`index.html`** — only if user asks to feature a photo.

## 5. Commit + push

1. `git add -A` and show `git status --short`
2. Suggest a commit message summarizing the change (e.g. "Add 3 Hawaii photos")
3. Wait for user confirmation
4. Commit with Claude co-author line, then `git push origin main`

## Rules

- Match existing HTML structure on each page exactly — layouts can differ between journeys
- Batch questions; never ask one-per-field
- Never commit source originals or `node_modules` (`.gitignore` handles this but verify)
- Don't redesign; this skill is content-only
