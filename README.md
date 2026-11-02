# Icon Logistics and Transportation website

A one-page static marketing site: plain HTML, CSS and a small vanilla JS file. There is no framework and no build step, so the `site/` folder can be hosted anywhere as it is.

```
site/
  index.html        the page
  css/styles.css    tokens, layout, animations (mobile-first, desktop from 768 px)
  js/main.js        menu, services toggle, scene pause, reveal fallback
  assets/           images, Figtree font, icons, share image
  favicon.ico, robots.txt, sitemap.xml
tools/
  build-images.cjs  regenerates the image variants (only needed when a photo changes)
```

## Preview locally

Run a static server from the project folder, then open <http://localhost:8080>. On Windows this needs no installs:

```bash
powershell -ExecutionPolicy Bypass -File tools\preview.ps1
```

With Node.js or Python installed, either of these also works:

```bash
npx serve site -l 8080
```

```bash
python -m http.server 8080 --directory site
```

Always preview through a server. Previewers that show a local file as a single snapshot, such as the Claude desktop browser pane, can't load the images, CSS or JS.

## Deploy

All asset paths are relative, so the site also works from a sub-folder.

### Netlify

1. Go to **Add new site > Deploy manually** and drag the `site` folder onto the page.
2. To deploy from Git instead, leave the build command empty and set the publish directory to `site`.
3. Add the custom domain under **Domain management**.

### GitHub Pages

1. Push this project to a GitHub repository.
2. Add `.github/workflows/pages.yml` with the workflow below. GitHub Pages' branch option can only publish the repository root or `/docs`, so a workflow is needed to publish `site/`.
3. In **Settings > Pages**, set **Source** to **GitHub Actions**.
4. Add the custom domain in the same screen.

```yaml
name: Deploy site
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: site
      - id: deployment
        uses: actions/deploy-pages@v4
```

### Vercel or cPanel

- **Vercel:** set the output directory to `site`, with no build command.
- **cPanel:** upload the contents of `site/` to `public_html`.

## If the domain changes

`https://www.icon-logistic.com` is hard-coded. Search and replace it in `site/index.html` (canonical, Open Graph, Twitter, JSON-LD and the visible website link), `site/robots.txt` and `site/sitemap.xml`.

## Things to know when editing

- **Two sets of copy.** The mobile design uses shorter wording, so many items appear twice in the HTML. `.only-d` shows from 768 px up and `.only-m` shows below it. Change both when editing copy.
- **Service order.** The HTML follows the mobile order, which decides the first five shown. `css/styles.css` restores the desktop order with `order` and sets the desktop icon colours.
- **Replacing a photo.** Put the new file in `assets/` under the same name, then run:

  ```bash
  npm install sharp
  ```

  ```bash
  node tools/build-images.cjs
  ```

  The script prints the widths it made. If they changed, or the aspect ratio did, update that image's `srcset`, `width` and `height` in `site/index.html`.
- **Higher-resolution airport photo.** If one arrives, also remove `max-width: 600px` from `.partners__photo`.
