# 🛠 Build Guide – Priority Tracker (Vite + React + Tailwind + Dexie + Docker)

## 📦 STEP 1: Project Setup

1. Create a new Vite project with React and TypeScript:

```bash
npm create vite@latest priority-tracker -- --template react-ts
cd priority-tracker
```

2. Install dependencies:

```bash
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install dexie
```

3. Tailwind Configuration:

- Update `tailwind.config.js`:

```js
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
```

- In `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- In `src/main.tsx`:

```ts
import './index.css';
```

## 🧠 STEP 2: Dexie Setup

Create `src/db/priorityDB.ts`:

```ts
import Dexie, { Table } from 'dexie';

export interface PriorityTask {
  id?: number;
  title: string;
  category: 'Primary' | 'Strategic' | 'Ongoing';
  impact: number;
  urgency: number;
  tenant: string;
  status: 'Planned' | 'In Progress' | 'Done';
  weekOf: string;
  notes?: string;
}

export class PriorityDB extends Dexie {
  tasks!: Table<PriorityTask>;
  constructor() {
    super('PriorityDatabase');
    this.version(1).stores({
      tasks: '++id, weekOf, category, tenant, status'
    });
  }
}

export const db = new PriorityDB();
```

## 🧩 STEP 3: UI Components

Use Tailwind + React to build:

- `TaskList.tsx` – table of tasks
- `TaskForm.tsx` – add/edit task modal
- `SummaryCards.tsx` – show priority breakdown (use ApexCharts if desired)

Use `useEffect` + `useState` to fetch from Dexie and display.

## 🐳 STEP 4: Dockerize the Project

Add `Dockerfile`:

```Dockerfile
FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t priority-tracker .
docker run -p 3000:80 priority-tracker
```

Visit: http://localhost:3000