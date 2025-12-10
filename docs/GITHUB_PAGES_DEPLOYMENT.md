# Deploying WSTerm to GitHub Pages

This guide explains how to deploy WSTerm to GitHub Pages, making it accessible via a public URL.

## Overview

GitHub Pages is a free static hosting service that serves files directly from a GitHub repository. WSTerm's static build is fully compatible with GitHub Pages.

## Deployment Methods

There are two main approaches:
1. **Manual Deployment** - Build locally and push to `gh-pages` branch
2. **Automated Deployment** - Use GitHub Actions for CI/CD

---

## Method 1: Manual Deployment

### Prerequisites

- Git installed locally
- Repository cloned and dependencies installed
- Write access to the GitHub repository

### Steps

#### 1. Build the Project

```bash
npm run build
```

#### 2. Deploy to `gh-pages` Branch

**Option A: Using `gh-pages` npm package (Recommended)**

```bash
# Install gh-pages package
npm install --save-dev gh-pages

# Add deploy script to package.json (or run directly)
npx gh-pages -d dist
```

**Option B: Manual Git Commands**

```bash
# Create a new orphan branch for GitHub Pages
git checkout --orphan gh-pages

# Remove all files from staging
git rm -rf .

# Copy built files to root
cp -r dist/* .

# Add and commit
git add .
git commit -m "Deploy to GitHub Pages"

# Push to GitHub
git push origin gh-pages --force

# Switch back to main branch
git checkout main
```

#### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Source", select `gh-pages` branch
4. Click **Save**

Your app will be available at:
```
https://karol-brejna-i.github.io/RemoteDebugApp/
```

---

## Method 2: Automated Deployment with GitHub Actions

This method automatically builds and deploys whenever you push to the main branch.

### Step 1: Create Workflow File

Create the file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:  # Allow manual trigger

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 2: Enable GitHub Pages with Actions

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment" → "Source", select **GitHub Actions**

### Step 3: Trigger Deployment

Push any changes to the `main` branch, or manually trigger the workflow:

1. Go to **Actions** tab in your repository
2. Select "Deploy to GitHub Pages" workflow
3. Click **Run workflow**

---

## Configuration for Subdirectory Deployment

If deploying to a subdirectory (e.g., `https://username.github.io/RemoteDebugApp/`), you may need to update the `base` setting in `vite.config.ts`:

```typescript
export default defineConfig({
  // For root deployment (username.github.io):
  base: './',
  
  // For subdirectory deployment (username.github.io/RemoteDebugApp/):
  // base: '/RemoteDebugApp/',
  
  // ... rest of config
});
```

> **Note:** The current configuration uses `'./'` (relative paths), which works for both root and subdirectory deployments.

---

## Verifying Deployment

After deployment, your app will be accessible at:

| Repository Type | URL Pattern |
|-----------------|-------------|
| User/Org site (`username.github.io`) | `https://username.github.io/` |
| Project site | `https://username.github.io/repository-name/` |

For this project:
```
https://karol-brejna-i.github.io/RemoteDebugApp/
```

---

## Custom Domain (Optional)

To use a custom domain:

1. Go to **Settings** → **Pages**
2. Under "Custom domain", enter your domain (e.g., `wsterm.example.com`)
3. Click **Save**
4. Add a CNAME record in your DNS settings pointing to `username.github.io`
5. (Optional) Create a `CNAME` file in the `dist/` folder with your domain name

For automated deployments, add this step before the "Upload artifact" step:

```yaml
- name: Add CNAME for custom domain
  run: echo "wsterm.example.com" > dist/CNAME
```

---

## Troubleshooting

### 404 Errors on Refresh

GitHub Pages doesn't support client-side routing by default. WSTerm is a single-page application, so this typically isn't an issue. If you experience problems:

- Ensure you're accessing `index.html` directly
- Check that the `base` configuration is correct

### Assets Not Loading

1. Clear browser cache and hard refresh (Ctrl+Shift+R)
2. Check browser console for path errors
3. Verify `base` setting in `vite.config.ts`
4. Ensure all files were properly pushed to the `gh-pages` branch

### Build Failures in GitHub Actions

1. Check the Actions tab for detailed error logs
2. Ensure `package-lock.json` is committed (required for `npm ci`)
3. Verify Node.js version compatibility

### WebSocket Connections on HTTPS

GitHub Pages serves content over HTTPS, so WebSocket connections must use `wss://` protocol. For detailed information about SSL/WSS configuration, see [SSL_WSS_GUIDE.md](./SSL_WSS_GUIDE.md).

---

## Security Considerations

- GitHub Pages sites are public. Don't include sensitive data in the build.
- WebSocket connections from HTTPS pages require `wss://` (secure WebSockets)
- Your ESP device must support SSL/TLS for secure WebSocket connections from GitHub Pages

---

## Useful Links

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Static Deploy Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
