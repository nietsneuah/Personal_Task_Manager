# 📋 Project Scope – Priority Tracker

## 🎯 Objective
Build a self-hosted, local-first priority tracking app for strategic and operational planning.

## 👤 Primary User
Doug Hauenstein (and optionally shared with team members via Docker)

## 📌 Key Features
- Track tasks by **priority category**: Primary, Strategic, Ongoing
- Fields: Title, Impact, Urgency, Tenant, Status, Week, Notes
- Local-only database (IndexedDB) with Dexie.js
- Quick filtering/sorting by priority
- Export and import task sets (future enhancement)
- Visual summary (cards or charts)

## 🧱 Tech Stack
- Vite + React (TypeScript)
- Tailwind CSS
- Dexie.js (IndexedDB wrapper)
- Optional: Tabulator.js or ApexCharts
- Docker for packaging and sharing

## 🗂 Folder Structure (Planned)
```
/priority-tracker/
├── /src/
│   ├── /components/
│   ├── /db/
│   ├── /styles/
│   └── App.tsx
├── public/
├── index.html
├── Dockerfile
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## 🛣 Future Plans
- Import/export task sets
- Optional multi-user sync via Supabase or FileMaker
- PWA version for true installable experience
- Charts for tracking progress by category/time

## 🚀 Deployment Options
- Local machine (localhost via Vite or Docker)
- Portable share via Docker container