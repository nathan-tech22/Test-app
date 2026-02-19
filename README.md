# Bourbon Vault 🥃

A full-stack premium bourbon/spirits collection tracking web application.

## Features

- **Collection Management** — Track bottles with distillery, mashbill, age, proof, status, fill level, and more
- **Tasting Notes** — Log structured nose/palate/finish notes with 1–100 scoring and flavor tags
- **Inventory & Value** — Track purchase price vs MSRP vs secondary market value with gain/loss dashboard
- **Wishlist** — Maintain a hunt list with priority ratings
- **Analytics** — Charts for spending trends, collection breakdown, flavor profile cloud, cost-per-pour
- **Export** — Download your collection to CSV
- **Premium Dark UI** — Amber/whiskey-themed dark mode with Playfair Display typography

## Quick Start

```bash
# Install all dependencies
cd backend && npm install
cd ../frontend && npm install

# Start backend (port 3001)
cd backend && node server.js

# Start frontend (port 3000) in a second terminal
cd frontend && npm start
```

Then open http://localhost:3000

## Tech Stack

- **Frontend**: React 19, React Router, Recharts, Lucide React, React Hot Toast
- **Backend**: Node.js, Express
- **Database**: SQLite (via better-sqlite3) — fully self-contained, no setup needed
- **Styling**: CSS custom properties with Playfair Display + Inter fonts

## Sample Data

The app launches with 10 pre-loaded bottles including Pappy Van Winkle, Buffalo Trace, Blanton's, Elijah Craig Barrel Proof, Nikka From the Barrel, and more — plus 5 tasting sessions and a wishlist.
