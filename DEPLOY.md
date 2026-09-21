# Deploy EIS demo (Render free)

## Repo
Push this project to GitHub, then connect it on Render.

## Render settings
- **Runtime:** Node
- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Plan:** Free
- Env: `NODE_ENV=production`, `HOST=0.0.0.0`, `NODE_VERSION=22`

Or use Blueprint: Render → New → Blueprint → select this repo (`render.yaml`).

## After deploy
Use the Render URL (e.g. `https://eis-demo.onrender.com`) as the Addis Tech demo link.

Free tier sleeps when idle; first open can take ~30–60s.
