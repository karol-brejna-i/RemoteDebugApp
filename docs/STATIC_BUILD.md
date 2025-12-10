# Building WSTerm as a Static Page

This guide explains how to build WSTerm so it can be run as a static page directly from the filesystem or any static web server.

## Overview

WSTerm is built with Vite and configured to output static assets that work with relative paths. This means the built application can be:

- Opened directly from the filesystem (`file://` protocol)
- Hosted on any static web server (Apache, Nginx, etc.)
- Deployed to static hosting services (GitHub Pages, Netlify, Vercel, etc.)

## Prerequisites

- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- **npm** - Comes bundled with Node.js

## Build Steps

### 1. Clone the Repository

```bash
git clone https://github.com/karol-brejna-i/RemoteDebugApp.git
cd RemoteDebugApp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build for Production

```bash
npm run build
```

This command:
1. Runs TypeScript compilation to check for type errors
2. Bundles and minifies all TypeScript and CSS files
3. Outputs optimized static files to the `dist/` directory

### 4. Verify the Build

After a successful build, you'll have the following structure in `dist/`:

```
dist/
├── index.html
└── assets/
    ├── index.[hash].js
    ├── index.[hash].css
    └── ... (other assets)
```

## Running the Static Build

### Option 1: Open Directly in Browser

The build is configured with `base: './'` in `vite.config.ts`, which generates relative paths. This means you can open the `dist/index.html` file directly in your browser:

```bash
# Linux/macOS
xdg-open dist/index.html  # Linux
open dist/index.html       # macOS

# Windows
start dist/index.html
```

> **Note:** Some browser features may be limited when using the `file://` protocol. WebSocket connections should still work.

### Option 2: Preview with Vite

Use Vite's built-in preview server to test the production build:

```bash
npm run preview
```

This starts a local server at http://localhost:4173 serving the contents of `dist/`.

### Option 3: Serve with a Static Web Server

You can use any static web server. Here are some examples:

**Using Python (built-in):**
```bash
cd dist
python3 -m http.server 8080
```
Then open http://localhost:8080

**Using Node.js `serve` package:**
```bash
npx serve dist
```

**Using Node.js `http-server` package:**
```bash
npx http-server dist
```

## Deploying to a Web Server

Simply copy the contents of the `dist/` directory to your web server's document root:

```bash
# Example: Copy to Apache's htdocs
cp -r dist/* /var/www/html/wsterm/

# Example: Copy to Nginx's html folder
cp -r dist/* /usr/share/nginx/html/wsterm/
```

## Build Configuration

The build is configured in `vite.config.ts` with the following key settings:

| Setting | Value | Description |
|---------|-------|-------------|
| `base` | `'./'` | Uses relative paths, enabling `file://` protocol support |
| `outDir` | `'../dist'` | Output directory relative to `src/` |
| `sourcemap` | `true` | Generates source maps for debugging |
| `assetsInlineLimit` | `4096` | Inlines assets smaller than 4KB |

## Troubleshooting

### Build Fails with TypeScript Errors

Run `npm run typecheck` to see detailed TypeScript errors, then fix them before building.

### Assets Not Loading

If assets don't load when opening from `file://`:
1. Ensure you're opening `dist/index.html`, not `src/index.html`
2. Check browser console for specific errors
3. Try using a local web server instead

### WebSocket Connection Issues

When running as a static page:
- Ensure your ESP device is on the same network
- Use `ws://` for HTTP pages, `wss://` for HTTPS pages (see [SSL_WSS_GUIDE.md](./SSL_WSS_GUIDE.md))
- Check firewall settings on both your computer and the ESP device

## Distribution

To distribute WSTerm as a standalone static application:

1. Build the project: `npm run build`
2. Create a zip archive of the `dist/` folder:
   ```bash
   cd dist && zip -r ../wsterm-static.zip . && cd ..
   ```
3. Share the zip file - users just need to extract and open `index.html`
