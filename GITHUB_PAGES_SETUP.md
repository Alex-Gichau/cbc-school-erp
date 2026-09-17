# Deploying Edura School Management System to GitHub Pages

This project is fully configured for automated deployment to **GitHub Pages** using **GitHub Actions**.

---

## 🚀 Quick Setup (3 Simple Steps)

### 1. Push your Code to GitHub
Create a new GitHub repository (public or private) and push this codebase to the `main` (or `master`) branch:

```bash
git init
git add .
git commit -m "Initial commit of Edura SMS"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPOSITORY-NAME>.git
git push -u origin main
```

---

### 2. Enable GitHub Pages via GitHub Actions
1. Open your repository on **GitHub.com**.
2. Go to **Settings** (top right tab of your repository).
3. In the left sidebar under *Code and automation*, click **Pages**.
4. Under **Build and deployment** > **Source**, select:
   👉 **GitHub Actions** (do *not* select "Deploy from a branch").

---

### 3. Automatic Deployment
1. As soon as you select **GitHub Actions** or push a new commit, GitHub will automatically trigger the workflow in `.github/workflows/deploy.yml`.
2. You can track deployment progress under the **Actions** tab.
3. Once completed (usually ~1 minute), your live school system will be available at:
   `https://<YOUR-USERNAME>.github.io/<YOUR-REPOSITORY-NAME>/`

---

## 🛠 Pre-Configured Features for GitHub Pages

- **Relative Asset Paths (`base: './'`)**: Configured in `vite.config.ts` so all assets (CSS, JS, fonts, images) resolve properly whether deployed at the root domain or in a repository sub-path.
- **Automated CI/CD Workflow (`.github/workflows/deploy.yml`)**: Builds the Vite single-page application and uploads it directly to GitHub Pages on every push.
- **Jekyll Bypass (`.nojekyll`)**: Located in `/public/.nojekyll` to ensure Vite output bundles and underscored assets are served without Jekyll interference.
- **Client-Side Routing Fallback (`404.html`)**: Located in `/public/404.html` to automatically redirect 404s back to `index.html` if direct URLs or deep links are refreshed.
- **Local Testing**: You can test the GitHub Pages static build locally anytime:
  ```bash
  npm run build:pages
  npx vite preview
  ```
