# Japan Trip Command Center

A Palantir-style command dashboard for Japan travel — built as a new page on fujiseat.com.

Inspired by [andrewjiang/palantir-for-family-trips](https://github.com/andrewjiang/palantir-for-family-trips).

---

## Stack

- React 19 + Vite
- `@vis.gl/react-google-maps` — official Google Maps React library (React 19 compatible)
- Google Maps JavaScript API

---

## Files

```
src/
  japanTripModel.js          ← All data: cities, checklist, intel, phrases, map style
  CommandMap.jsx             ← Google Maps component (route polyline + city markers)
  JapanTripCommandCenter.jsx ← Main dashboard (drop this into your router)
```

---

## Setup

### 1. Install

```bash
npm install @vis.gl/react-google-maps
```

### 2. .env

```
VITE_GOOGLE_MAPS_API_KEY=your_browser_maps_key_here
VITE_GOOGLE_MAP_ID=your_optional_map_id
```

Get a Maps API key from [Google Cloud Console](https://console.cloud.google.com/).
Enable: **Maps JavaScript API**.

For the Map ID (optional but recommended for custom styles):
Cloud Console → Map Management → Create Map ID → Map type: JavaScript → Raster.

### 3. Add to your router

```jsx
// In your App.jsx or router config
import JapanTripCommandCenter from './JapanTripCommandCenter'

// React Router example:
<Route path="/command-center" element={<JapanTripCommandCenter />} />

// Or as a direct page:
<JapanTripCommandCenter />
```

### 4. Optional: Google Fonts

Add to `index.html` for Geist Mono + Noto Sans JP (Japanese characters):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600&family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
```

---

## Google Maps API key setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create a project → Enable **Maps JavaScript API**
3. Credentials → Create → API Key
4. Restrict to: HTTP referrers → `fujiseat.com/*` and `localhost:*`
5. Paste into `.env` as `VITE_GOOGLE_MAPS_API_KEY`

Without a key, the map shows a "MAP OFFLINE" placeholder — all other panels still work.

---

## Customising the trip

Edit `japanTripModel.js`:

- **`CITIES`** — add/remove destinations, change `status` (`active` / `pending` / `locked`), update intel
- **`MISSION_CHECKLIST`** — your pre-trip checklist items
- **`INTEL_BRIEFINGS`** — global travel tips shown in the right panel
- **`PHRASE_ARSENAL`** — Japanese phrases
- **`SHINKANSEN_ROUTE`** — lat/lng coordinates for the route polyline
- **`MAP_DARK_STYLE`** — Google Maps styling JSON (command-center dark theme)

---

## Klook affiliate links

Each city in `CITIES` has a `klookUrl` field. Replace with your Klook affiliate links:

```js
klookUrl: "https://www.klook.com/en-US/city/17-kyoto-things-to-do/?aid=YOUR_AID"
```

---

## Notes

- The dashboard is **desktop-first** (same approach as the original repo)
- State is stored in React local state — no backend required
- The Shinkansen polyline covers: Tokyo → Shin-Yokohama → Shin-Fuji → Shizuoka → Hamamatsu → Nagoya → Kyoto → Shin-Osaka → Hiroshima → Hakata
- Mt. Fuji viewing zone appears as an amber circle on the map near Shin-Fuji station
