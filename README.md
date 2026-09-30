# Matie Port — Business Vault

A calm, local-first business vault for freelancers: clients, projects, payments, attendance → salary, money, files, notes and savings goals. Everything lives in the browser (`localStorage`, key `matieeport-storage`, persist version 3). Nothing is uploaded.

## Scripts

```bash
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build
npm run lint     # oxlint
npm run preview  # serve the production build
```

`VITE_API_SYNC=true npm run dev` + `npm run dev:db` re-enables the legacy json-server mirror (dev only, off by default and always off in production builds).

## Routes

| Path | What |
| --- | --- |
| `/` | Landing page for browsers with no vault yet; browsers that already have data (or the installed app) go straight to `/app` |
| `/welcome` | Landing page, always |
| `/app` … `/app/{clients,projects,attendance,money,files,knowledge,insights,savings}` | The vault |
| `/clients`, `/money`, … | Old top-level URLs redirect to `/app/…` |

## Stack

React 19 · Vite · Tailwind 4 · framer-motion (UI motion) · GSAP + ScrollTrigger + Lenis (landing story) · Three.js (landing hero, lazy-loaded) · Recharts · zustand (persisted store — **unchanged**) · Geist / Instrument Serif

## Layout of `src/`

```
ui/          design-system primitives (Card, Button, Modal, Field, Segmented, Money, Progress, …)
app/         shell: sidebar, top bar, ⌘K command palette, notifications, backup menu, mobile nav
pages/       one file per route (+ dashboard/ and client/ sub-components)
landing/     marketing page (Three.js vault dial, GSAP pinned "how it works", interactive demos)
components/  shared forms + PrivateText
lib/         format, finance rollups, motion tokens, backup, image resize, privacy helpers
store/       zustand store — do not change shape/key/version without a migration
```

## Design system (v2)

Warm paper canvas `#F4F2EB`, brand green `#1C6F45` (`brand-600`), hairline rings, double-bezel cards, 22px card radius, pill buttons, easing `cubic-bezier(0.16, 1, 0.3, 1)`. Tokens live in `src/index.css` (`@theme`). Amounts render through `<Money>` and names through `<PrivateText>` so **privacy mode** masks them everywhere; use `usePrivacy()` for labels/titles/axes. `prefers-reduced-motion` is honoured (MotionConfig, GSAP `matchMedia`, Lenis and the 3D scene all stand down).
