# CLAUDE.md - Itsy Bitsy Photography Portfolio

## Project Overview
Building a personal photography and video portfolio website for "Itsy Bitsy" with a dramatic dark theme inspired by the WordPress "Feature" theme by Automattic.

## Design Direction
- **Theme**: Dark, dramatic, magazine-style (like WordPress Feature theme)
- **Background**: Deep black (#0a0a0a) with subtle golden gradient accents
- **Accent Color**: Warm gold (#c9a962)
- **Typography**: 
  - Display: Cormorant Garamond (elegant serif, italic for titles)
  - Body: Source Sans 3
  - Mono: JetBrains Mono (for labels, tags, navigation)
- **Aesthetic**: Bold imagery, sizable typography, focus on photos. Clean, editorial feel.

## Site Structure

```
itsy-bitsy/
├── index.html          # Landing page (DONE - needs refinement)
├── about.html          # About the blog (TO BUILD)
├── journeys.html       # Photo journeys index (TO BUILD)
├── films.html          # Short films index (TO BUILD)
├── css/
│   └── styles.css      # Main stylesheet
├── js/
│   └── main.js         # Interactivity
├── images/
│   ├── journeys/
│   │   ├── everglades/ # Trip photos
│   │   ├── paris/      # Trip photos
│   │   └── [more trips...]
│   └── films/          # Video thumbnails
└── pages/
    ├── journeys/       # Individual journey pages
    │   ├── everglades.html
    │   └── paris.html
    └── films/          # Individual film pages
```

## Pages to Build

### 1. About Page (about.html)
- About the blog introduction
- Space for user to add their intro text later
- Photo of the photographer (placeholder for now)

### 2. Journeys Page (journeys.html)
- Gallery index of all trips
- Subdivided by trip (Everglades, Paris, etc.)
- Each journey card shows: featured image, title, location, year, brief description
- User wants space for intro notes at the top (placeholder text for now)
- Links to individual journey pages

### 3. Individual Journey Pages (pages/journeys/[trip].html)
- Photo gallery for that specific trip
- Each photo should display:
  - The image (large)
  - Tags: Year, Location
  - Title
  - Space for thoughts/reflections (can be multiple paragraphs)
- Searchable/filterable by Year and Location tags

### 4. Films Page (films.html)
- Video gallery
- Each film card shows: thumbnail with play button overlay, title, duration, tags
- User wants space for intro notes at the top
- Links to individual film pages or embedded video players

### 5. Individual Film Pages (pages/films/[film].html)
- Embedded video player
- Title, year, location tags
- Space for description/thoughts

## Key Features Required
- **Tagging system**: Every photo tagged with Year/Location for search/filtering
- **Reflections space**: Each photo/video should have room for thoughts and reflections
- **Easy to add content**: Clear structure so user can add photos/videos later
- **Responsive**: Works on mobile, tablet, desktop
- **Intro sections**: Journeys and Films pages need space for intro text at the top

## Current Progress
- ✅ Landing page (index.html) - basic structure done with embedded CSS
- ✅ Dark theme styling established
- ✅ Card component for photos/videos
- ✅ Navigation structure
- ⏳ About page - not started
- ⏳ Journeys page - not started  
- ⏳ Films page - not started
- ⏳ Individual journey/film page templates - not started
- ⏳ Search/filter functionality - not started

## User Preferences
- Name: "Itsy Bitsy"
- Tagline: "Capturing Life's Beautiful Moments"
- Prefers dark themes for dramatic, bold look that lets photos stand out
- Not familiar with coding - needs clean, easy-to-edit structure
- Wants to add photos/videos and content later
- Sections: About, Journeys (subdivided by trip), Films

## Technical Notes
- Pure HTML/CSS/JS (no frameworks required)
- Google Fonts loaded from CDN
- Should work when opened directly in browser (no server required for basic viewing)
- For local development: can use any simple server (Live Server, python -m http.server, etc.)

## File Naming Convention for Photos
Suggest user names photos like: `YYYY-location-description.jpg`
Example: `2024-everglades-sunset-over-marsh.jpg`

## Next Steps for Claude Code
1. Review the existing index.html and styles
2. Build out About page
3. Build Journeys index page with filtering capability
4. Build Films index page
5. Create templates for individual journey/film pages
6. Add search/filter JavaScript functionality
7. Test responsive design
8. Add placeholder content and clear comments showing where user adds their content
