# Deploy EIS demo (Render free)

## Repo
Push this project to GitHub, then connect it on Render.

## Render settings
- **Runtime:** Node
- **Build command:** `npm ci --include=dev && npm install @rolldown/binding-linux-x64-gnu && npm run build`
- **Start command:** `npm start`
- **Plan:** Free
- Env: `NODE_ENV=production`, `HOST=0.0.0.0`, `NODE_VERSION=22`, `NPM_CONFIG_OPTIONAL=true`

`--include=dev` is required because Vite/Tailwind/Nitro live in `devDependencies` and Render sets `NODE_ENV=production` during build.

Or use Blueprint: Render → New → Blueprint → select this repo (`render.yaml`).

## After deploy
Use the Render URL (e.g. `https://eis-demo-7446.onrender.com`) as the Addis Tech demo link.

Free tier sleeps when idle; first open can take ~30–60s.
