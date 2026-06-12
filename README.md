# SOLZI Field Log — Setup Guide

A mobile web app for logging can usage in the field. Logs directly to the
"Field Log" tab in SOLZI Inventory Tracker (Auto).

---

## What you'll need

- GitHub account (free) → github.com
- Vercel account (free) → vercel.com
- Access to the SOLZI Inventory Tracker Google Sheet (you already have this)

---

## Step 1 — Set up the Google Apps Script (5 min)

1. Open **SOLZI Inventory Tracker (Auto)** in Google Sheets
2. Click **Extensions → Apps Script**
3. Delete everything in the editor (the default `myFunction` code)
4. Open `google-apps-script.js` from this folder and paste the entire contents
5. Click **Save** (floppy disk icon)
6. Click **Run** → select `testPost` → click Run again
   - First time: Google will ask for permissions → click "Review permissions" → Allow
   - Check the Logs (View → Logs) — you should see `{"status":"ok"}`
   - Check your sheet — a "Field Log" tab should have appeared with a test row
7. Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
8. Copy the **Web app URL** — it looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`
   Keep this handy for Step 3.

---

## Step 2 — Push code to GitHub (3 min)

1. Go to **github.com** → click **New** (top left) → name it `solzi-field-log` → **Create repository**
2. Open Terminal in this folder and run:

```bash
git init
git add .
git commit -m "SOLZI Field Log v1"
git remote add origin https://github.com/YOUR_USERNAME/solzi-field-log.git
git push -u origin main
```

---

## Step 3 — Deploy to Vercel (3 min)

1. Go to **vercel.com** → sign up / log in with GitHub
2. Click **Add New → Project** → import your `solzi-field-log` repo
3. Before clicking Deploy, expand **Environment Variables** and add:
   - Name: `VITE_APPS_SCRIPT_URL`
   - Value: paste your Web app URL from Step 1
4. Click **Deploy**
5. Vercel gives you a URL like `solzi-field-log.vercel.app` ← that's your app

---

## Step 4 — Add to iPhone home screen (1 min — do on both phones)

1. Open **Safari** on iPhone (must be Safari, not Chrome)
2. Go to your Vercel URL
3. Tap the **Share** button (box with arrow at bottom)
4. Tap **"Add to Home Screen"**
5. Name it `Field Log` → tap **Add**

Opens full-screen like a native app.

---

## How it works

Every time David or Sophy logs an entry, a new row is appended to the
**Field Log** tab in the inventory sheet with:

| DATE | TIME | SUBMITTED BY | MOVEMENT TYPE | CASES | CANS | TOTAL CANS | NOTES |

Later you can build a process (or a script) to copy reviewed rows from
Field Log into the main Ledger tab.

---

## Updating the app

Edit `src/App.jsx`, push to GitHub — Vercel auto-redeploys in ~30 seconds.

- Movement types: edit the `MOVEMENT_TYPES` object at the top of App.jsx
- Colors: edit the `B` object
- Cans per case: change `CANS_PER_CASE` (currently 12)
