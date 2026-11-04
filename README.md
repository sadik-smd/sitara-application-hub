# Sitara Application Hub

A TI-branded static application hub for browsing Sitara processor demos and reference designs, modeled after the [NXP MCUXpresso Application Code Hub](https://mcuxpresso.nxp.com/appcodehub).

Live site: `https://<your-org>.github.io/sitara-application-hub/`

## Features

- Filter applications by Device Family, OS, Category, Item Type, and Toolchain
- Full-text search across titles and descriptions
- Active filter chips with one-click removal
- "Visit on GitHub" and copy-link buttons on each card
- No build step — Vue.js 3 loaded from CDN, deployed directly as static files

## Repository Structure

```
├── index.html                  # Single-page app (Vue.js 3 CDN)
├── apps.json                   # Application data
├── assets/
│   ├── css/style.css           # TI-branded styles
│   ├── js/app.js               # Vue.js reactive logic
│   └── img/                    # TI logo and favicon
└── .github/workflows/
    └── deploy.yml              # GitHub Pages deployment
```

## Adding an Application

Edit `apps.json` and add an entry following this schema:

```json
{
  "id": "unique-kebab-case-id",
  "title": "Application Title",
  "description": "One or two sentence description of what the app does.",
  "device_families": ["AM62x"],
  "os": ["Linux"],
  "categories": ["AI/ML"],
  "item_type": "Demo",
  "toolchain": ["GCC", "Yocto"],
  "github_url": "https://github.com/TexasInstruments/...",
  "recently_added": true
}
```

**Valid values:**

| Field | Options |
|---|---|
| `device_families` | `AM62x`, `AM62Ax`, `AM62Px`, `AM64x`, `AM65x`, `AM67`, `AM68x`, `AM69x` |
| `os` | `Linux`, `RTOS`, `Android`, `Buildroot`, `Debian` |
| `categories` | `AI/ML`, `Motor Control`, `Industrial`, `Vision`, `HMI`, `Networking`, `Security`, `Audio`, `Graphics`, `IoT` |
| `item_type` | `Demo`, `Reference Design`, `Application Note`, `Application SW Pack` |
| `toolchain` | `GCC`, `TI CCS`, `Yocto`, `CMake` |

Set `recently_added: true` to show the **New** badge on a card.

## Local Development

A local HTTP server is required because the app fetches `apps.json` at runtime:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Deployment

The site deploys automatically to GitHub Pages on every push to `main`.

**First-time setup:**
1. Go to repo **Settings → Pages → Source** and select **GitHub Actions**
2. Push to `main` — the workflow will build and publish the site

## License

Copyright (C) 2024 Texas Instruments Incorporated.
