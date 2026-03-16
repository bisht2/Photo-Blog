# Itsy Bitsy Photo Blog

A minimalist photo blog with Material Design aesthetics, featuring a dark editorial theme inspired by WordPress Feature.

## 📁 Project Structure

```
itsy-bitsy/
├── index.html              # Home page
├── about.html              # About page
├── journeys.html           # Journeys listing page
├── films.html              # Films listing page
├── journeys/               # Journey detail pages
│   ├── everglades.html
│   └── paris.html
├── films/                  # Film detail pages
│   └── moments-in-motion.html
└── images/                 # All image assets
    ├── journeys/
    │   ├── everglades/
    │   └── paris/
    ├── films/
    └── about/
```

## 🚀 Hosting Instructions

### Option 1: GitHub Pages (Free)
1. Create a new repository on GitHub
2. Upload all files to the repository
3. Go to Settings > Pages
4. Select "Deploy from branch" and choose "main" branch
5. Your site will be live at `https://yourusername.github.io/repository-name`

### Option 2: Netlify (Free)
1. Sign up at [netlify.com](https://netlify.com)
2. Drag and drop the entire `itsy-bitsy` folder
3. Your site will be live instantly with a custom URL
4. Optional: Add a custom domain

### Option 3: Vercel (Free)
1. Sign up at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm install -g vercel`
3. Run `vercel` in the itsy-bitsy directory
4. Follow the prompts to deploy

### Option 4: Traditional Web Hosting
1. Upload all files via FTP to your web host
2. Ensure `index.html` is in the root directory
3. Set proper file permissions (644 for files, 755 for directories)
4. Your site will be accessible at your domain

## 🎨 Design Features

- **Dark Editorial Theme**: Inspired by WordPress Feature theme
- **Material Design**: Elevation, shadows, and smooth transitions
- **Viewport-Aware Images**: Images automatically fit within browser viewport
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop
- **Modern Typography**: Plus Jakarta Sans font with fluid scaling
- **Interactive Elements**: Hover effects, animated underlines, and elevation changes

## 🖼️ Adding New Content

### Adding a New Journey
1. Create a new HTML file in `/journeys/` folder (e.g., `tokyo.html`)
2. Copy the structure from `everglades.html`
3. Update paths with `../` prefix for navigation and images
4. Add images to `/images/journeys/tokyo/`
5. Update `journeys.html` to add a new card linking to your page

### Adding a New Film
1. Create a new HTML file in `/films/` folder
2. Copy the structure from `moments-in-motion.html`
3. Update video source and poster paths
4. Update `films.html` to add a new card

## 🔧 Technical Notes

- No build process required - pure HTML/CSS
- No JavaScript dependencies
- All styles are embedded in each HTML file
- Images use relative paths
- Fonts loaded from Google Fonts CDN

## 📱 Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile Safari (iOS 12+)
- Chrome Mobile
- Responsive down to 320px width

## 💡 Tips for Hosting

1. **Optimize Images**: Compress images before uploading (use tools like TinyPNG or ImageOptim)
2. **Custom Domain**: Most hosting services allow adding custom domains
3. **HTTPS**: Ensure your host provides SSL/HTTPS for security
4. **CDN**: Consider using a CDN for faster global image loading
5. **SEO**: Add meta descriptions and Open Graph tags for better social sharing

## 📄 License

© 2024 Itsy Bitsy. All rights reserved.
