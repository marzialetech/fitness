# Logo project moved to its own repo

Logo-related files have been moved into **`logos/`** (its own git repo) and removed from the fitness app root.

## What you need to do

### 1. Move logos to Desktop and push to a new public repo

In Terminal:

```bash
# Move the logos project to Desktop
mv /Users/jjmarzia/Desktop/fitness/logos /Users/jjmarzia/Desktop/

# Create a new public repo on GitHub (e.g. marzialetech/logos)
# Then add remote and push:
cd /Users/jjmarzia/Desktop/logos
git remote add origin https://github.com/YOUR_ORG/logos.git
git push -u origin main
```

Replace `YOUR_ORG` with your GitHub org or username (e.g. `marzialetech`).

### 2. Commit the logo removal in the fitness repo

In the fitness project:

```bash
cd /Users/jjmarzia/Desktop/fitness
git add -A
git status   # should show deleted logo files and .gitignore / LOGO_MOVE_STEPS.md
git commit -m "Move logo assets to separate logos repo; remove from fitness"
git push
```

### 3. Serve pixel-reveal at marziale.tech/logos

Configure your host (GitHub Pages, Vercel, or your main site) so the **logos** repo is served at **marziale.tech/logos**. Then:

- **marziale.tech/logos/** → loads `index.html` (redirects to pixel-reveal)
- **marziale.tech/logos/pixel-reveal.html** → pixel reveal page

You can delete this file (`LOGO_MOVE_STEPS.md`) from fitness after you’re done.
