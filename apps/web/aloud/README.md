# Aloud — Homepage

Production-ready Next.js 14 (App Router + TypeScript + Tailwind) homepage for
"Aloud" — a long-form, interruption-free speaking practice platform.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

Fonts (Space Grotesk / Inter / IBM Plex Mono) load from Google Fonts at build
time via `next/font/google`, so the machine running `npm run build` /
`npm run dev` needs normal internet access.

## Structure

```
app/
  layout.tsx        Fonts, metadata, ThemeProvider (dark/light, no-flash)
  page.tsx           Assembles every homepage section in order
  globals.css        ALL color tokens live here (see below)

components/
  navbar.tsx, footer.tsx
  theme-provider.tsx, theme-toggle.tsx
  ui/
    waveform.tsx      The signature animated waveform used across the page
    container.tsx     Layout container + "Eyebrow" section label
  sections/
    hero.tsx
    how-it-works.tsx
    problem.tsx
    product-demo.tsx
    analysis-breakdown.tsx
    progress-tracking.tsx
    use-cases.tsx
    privacy.tsx
    pricing.tsx
    final-cta.tsx

lib/utils.ts          cn() class-merging helper
```

Each homepage section is its own file under `components/sections/`. To
reorder, add, or remove a section, edit the list in `app/page.tsx` — nothing
else needs to change.

## Theme system (dark / light)

Every color is a CSS variable defined once in `app/globals.css`:

```css
:root  { --background: 40 24% 97%; --accent: 38 88% 50%; ... } /* light */
.dark  { --background: 220 18% 7%; --accent: 38 92% 58%;  ... } /* dark  */
```

`tailwind.config.ts` just points token names (`bg-background`, `text-accent`,
`bg-surface`, ...) at those variables. To re-theme the whole product —
rebrand, new accent color, different light/dark balance — edit the two
blocks in `globals.css` only; every component updates automatically.

Theme switching itself is handled by `next-themes`
(`components/theme-provider.tsx`), toggled with `components/theme-toggle.tsx`,
and persisted to `localStorage` with no flash-of-wrong-theme on load
(`suppressHydrationWarning` + class strategy).

## Design tokens quick reference

| Token        | Role                                 |
| ------------ | ------------------------------------ |
| `background` | Page background                      |
| `surface`    | Card / panel background              |
| `surface-2`  | Nested / hovered surface             |
| `foreground` | Primary text                         |
| `muted`      | Secondary text                       |
| `border`     | Hairlines, card borders              |
| `accent`     | Primary brand color (amber "signal") |
| `mint`       | Secondary color (progress, success)  |

Fonts: `font-display` (Space Grotesk, headings), `font-sans` (Inter, body),
`font-mono` (IBM Plex Mono, labels/stats/eyebrows).

## Next steps (not built yet)

This delivers the **homepage only**, per the product spec's section 25–27.
The rest of the spec (auth, recording flow, STT pipeline, AI analysis,
dashboard, billing) is a separate, much larger build — see the spec's
"Build in stages: MVP → V2 → V3 → V4" for suggested sequencing.
