# PIPELINE

**Founder's daily accountability tracker.** Built for Jemima Kibandi — Senior Software Engineer,
co-founder building toward January 2027.

Dark. Cinematic. No fluff.

---

## Setup

```bash
cd startupDiaries
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm start
```

---

## iPhone Install (PWA)

1. Open the deployed URL in **Safari** (not Chrome — iOS PWA install requires Safari)
2. Tap the **Share** button (box with arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"** — PIPELINE appears as an app icon
5. Launch from your home screen — it runs fullscreen, no browser chrome

> The app works offline after first load (service worker caches everything).

---

## Folder Structure

```
startupDiaries/
├── app/
│   ├── layout.tsx          Root layout — fonts, PWA meta tags, BottomNav
│   ├── page.tsx            Today dashboard (countdown, streak, tasks, pause)
│   ├── pipeline/page.tsx   Lead pipeline log — add, view, update, delete
│   ├── weekly/page.tsx     Weekly momentum summary
│   └── settings/page.tsx   Notifications, pause log, data reset
├── components/
│   ├── DailyTasks.tsx      5-task checklist with ring progress + long-press tooltips
│   ├── PipelineLog.tsx     Lead CRUD — swipe-to-delete, status badges
│   ├── WeeklySummary.tsx   7-day grid + momentum score + brutal copy
│   ├── PauseModal.tsx      Pause mode bottom sheet (reason + duration)
│   ├── StreakCounter.tsx   Pulsing streak with countup animation
│   ├── CountdownClock.tsx  Days-to-Jan-2027 countup animation
│   └── BottomNav.tsx       Fixed bottom navigation bar
├── hooks/
│   ├── useTasks.ts         Daily task state + localStorage sync
│   ├── useLeads.ts         Pipeline leads CRUD
│   ├── useStreak.ts        Streak calculation (pause-aware, timezone-safe)
│   ├── usePause.ts         Pause mode state + log
│   └── useNotifications.ts Web Notifications API + morning/evening scheduling
├── types/index.ts          All TypeScript interfaces
├── lib/
│   ├── storage.ts          Typed localStorage helpers (generic getItem<T>)
│   └── copy.ts             All founder copy strings in one place
├── public/
│   ├── manifest.json       PWA manifest
│   └── icons/              PWA icons (192px + 512px)
├── scripts/
│   └── generate-icons.mjs  Regenerate icons from SVG using sharp
└── next.config.ts          next-pwa config
```

---

## Regenerating Icons

Icons are pre-generated. To regenerate from the SVG with higher quality:

```bash
npm install --save-dev sharp
node scripts/generate-icons.mjs
```

---

## Tech Stack

- **Next.js 14** App Router
- **TypeScript** strict mode
- **Tailwind CSS** utility classes
- **@ducanh2912/next-pwa** service worker + manifest
- **DM Serif Display** + **Space Mono** via `next/font/google`
- All data in `localStorage` — no backend, no database

---

## Data

Everything lives in localStorage under these keys:

| Key | Contents |
|-----|----------|
| `pipeline_leads` | All lead objects |
| `pipeline_completions` | Daily task completion records |
| `pipeline_streak` | Current + longest streak |
| `pipeline_pause` | Active pause state |
| `pipeline_pause_log` | All past pauses |
| `pipeline_notifications` | Notification time settings |
| `pipeline_onboarding` | Onboarding completion flag |

Reset all data: **Settings → Reset all data**.
