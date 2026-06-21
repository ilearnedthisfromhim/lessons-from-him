# Lessons I Learned From Him
### A Father's Day Campaign — The Yellow Clinic

A 3-step interactive web experience where users:
1. Choose a lesson they learned from their father/father figure
2. Upload a photo of their dad
3. Get a beautiful branded digital card to download & share

When users consent, their card image is automatically saved to **Google Drive** and logged in **Google Sheets** for your team.

---

## Brand Colours

| Token | Hex | Use |
|-------|-----|-----|
| Navy (primary) | `#1B2F6B` | Background, card |
| Yellow (accent) | `#F5C518` | Highlights, CTA, borders |
| Green (secondary) | `#4CAF50` | Success states, accents |
| White | `#ffffff` | Text |

---

## Project Structure

```
lessons-from-him/
├── pages/
│   ├── index.js              ← Main campaign page (3-step flow)
│   └── api/
│       └── submit.js         ← API route → Google Sheets
├── styles/
│   ├── globals.css           ← Global styles + brand fonts
│   └── Home.module.css       ← All component styles
├── google-apps-script/
│   └── Code.gs               ← Paste into script.google.com
├── public/                   ← Add your logo files here
├── .env.example              ← Copy to .env.local
├── vercel.json               ← Vercel config
└── package.json
```

---

## Deployment Guide

### Step 1 — Set up Google Sheets + Drive

1. Create a new **Google Sheet** at [sheets.google.com](https://sheets.google.com)
2. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/THIS_IS_YOUR_SHEET_ID/edit
   ```
3. Go to [script.google.com](https://script.google.com) → **New Project**
4. Paste the contents of `google-apps-script/Code.gs`
5. Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your actual Sheet ID
6. Click **Deploy → New Deployment**:
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Click **Deploy** → Authorize → Copy the **Web App URL**

---

### Step 2 — Deploy to Vercel

**Option A: Via GitHub (recommended)**

1. Push this project to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub
3. Select your repo — Vercel auto-detects Next.js
4. Under **Environment Variables**, add:
   ```
   GOOGLE_SCRIPT_URL = https://script.google.com/macros/s/YOUR_ID/exec
   ```
5. Click **Deploy** — you'll get a live URL in ~2 minutes

**Option B: Via Vercel CLI**

```bash
npm install -g vercel
cd lessons-from-him
npm install
vercel
# Follow prompts, add env variable when asked
```

---

### Step 3 — Add Your Logo (Optional)

Place your logo files in the `/public` folder:
- `public/logo.png` — The Yellow Clinic logo
- `public/favicon.ico` — Browser tab icon

Then update `pages/index.js` to reference the image:
```jsx
// Replace the SVG logo icon with:
<img src="/logo.png" alt="The Yellow Clinic" style={{height: 32}} />
```

---

## How the Data Flow Works

```
User consents + clicks Download
        ↓
Browser generates card image (html2canvas)
        ↓
Image downloaded locally to user's device
        ↓
POST /api/submit  (Next.js API route)
        ↓
Google Apps Script webhook receives:
  - lesson text
  - card image (base64)
  - timestamp
  - consent: true
        ↓
Image saved to Google Drive folder: "Lessons From Him — Cards"
Row added to Google Sheet:
  | Timestamp | Lesson | Card Image URL | Consented |
```

---

## Local Development

```bash
cd lessons-from-him
npm install
cp .env.example .env.local
# Edit .env.local with your GOOGLE_SCRIPT_URL
npm run dev
# Open http://localhost:3000
```

---

## Customisation

### Change the campaign lessons
Edit the `LESSONS` array in `pages/index.js`:
```js
const LESSONS = [
  { id: 1, text: 'that everyone deserves kindness' },
  // ... add or change lessons here
]
```

### Change the card design
All card styles are in `styles/Home.module.css` under `/* ── Step 3: Digital Card ── */`

### Change brand colours
Edit `styles/globals.css`:
```css
:root {
  --navy: #1B2F6B;
  --yellow: #F5C518;
  --green: #4CAF50;
}
```

---

## Support

For questions about this campaign site, contact your web team.
The Yellow Clinic · Excellent Medical & Healthcare Services
