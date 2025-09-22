# Website Chatbot — Minimal DIY Starter (Web-only)

This starter gives you a **simple website chatbot** with:
- Floating chat widget (vanilla JS)
- FAQ answers (SQLite; simple keyword search)
- Lead capture endpoint (stores to SQLite)
- Optional Calendly link for booking

## Quick Start

1) Install deps
```
npm install
```

2) Initialize database
```
npm run db:init
```

3) Run locally
```
npm run dev
# open http://localhost:3000
```

## Files
- public/index.html — demo page
- public/chatbot.js — floating chat widget
- server/server.js — Node + Express API
- server/db/init.sql — DB schema
- server/db/seed_faqs.json — sample FAQs
- package.json — scripts & deps

## Safety
Keep it simple: do not collect sensitive info.
