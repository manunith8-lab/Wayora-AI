# Wayora.ai – Production Deployment & Hosting Guide

Wayora.ai is compiled as a high-performance, deterministic AI travel assistant with all 5 datasets (4,233 records) bundled into the production package. It requires **zero expensive server runtimes**, has **zero cold-starts**, and can be hosted permanently for free with global CDN caching.

---

## 🚀 Option 1: Deploy to Vercel (Recommended • 2 Minutes)

Vercel provides a permanent, lightning-fast public URL (e.g., `https://wayora-ai.vercel.app`) with automatic SSL and zero maintenance.

### Method A: Via GitHub (Continuous Deployment)
1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Complete Wayora dataset integration and public deployment setup"
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/wayora.git
   git push -u origin main
   ```
2. Go to [https://vercel.com/new](https://vercel.com/new).
3. Import your `wayora` repository.
4. Keep the default settings (Framework: Vite, Build: `npm run build`, Output: `dist`).
5. Click **Deploy**.
6. You will receive an instant, permanent public URL (e.g. `https://wayora-ai.vercel.app`) that you can share on WhatsApp, Instagram, or anywhere!

### Method B: Via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 🌐 Option 2: Deploy to Netlify (Drag & Drop or Git)

1. Build your production bundle locally:
   ```bash
   npm run build
   ```
2. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag and drop the `dist/` folder into your browser window.
4. Your website is instantly live with a permanent public link (e.g., `https://wayora.netlify.app`)!

---

## 🐙 Option 3: Deploy to GitHub Pages (Automated Workflow)

Wayora includes a preconfigured GitHub Actions workflow in `.github/workflows/deploy.yml`:
1. Push this repository to GitHub.
2. In your GitHub repository, navigate to **Settings > Pages**.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. The workflow will automatically build and publish your site at `https://<YOUR_USERNAME>.github.io/wayora/`.

---

## 🔒 Security & Environment Variables
- All knowledge bases and dataset indices are compiled directly into the production bundle.
- No private API keys or secrets are exposed in client-side code.
- If you connect optional third-party travel providers in the future, set them in the Vercel/Netlify Environment Variables dashboard under `Settings > Environment Variables`.
