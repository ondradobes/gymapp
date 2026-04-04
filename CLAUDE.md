# CLAUDE.md — GymLog (Workout Progress App)

## Project Overview

Osobní webová aplikace pro sledování pokroku v posilovně. Uživatel loguje váhy ke každému cviku při každém tréninku. Po otevření aplikace okamžitě vidí váhy z minulé sezení, aby věděl, co má překonat.

**Core use case:** Uživatel přijde do posilovny, otevře appku, vidí předchozí váhy na první pohled, zaloguje dnešní hodnoty, sleduje pokrok v čase přes grafy.

---

## Tréninkový split

| Den | Zaměření |
|-----|----------|
| Pondělí | Nohy |
| Středa | Hruď & Ramena |
| Pátek | Záda, Biceps & Triceps |

---

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4
- **Routing:** React Router v7
- **Grafy:** Recharts
- **Data:** IndexedDB přes knihovnu `idb` — vše lokálně v prohlížeči, žádný backend
- **Deploy:** Git → GitHub → Vercel (auto-deploy)
- **No auth** — single-user osobní appka

---

## Architektura

```
src/
├── pages/
│   ├── Home.tsx               — Domovská obrazovka, výběr dne
│   ├── TrainingDay.tsx        — Logování tréninku
│   ├── History.tsx            — Historie tréninků (edit/delete)
│   └── ExerciseProgress.tsx   — Detail progrese jednoho cviku
├── components/
│   ├── ProgressChart.tsx      — Recharts line chart váhy v čase
│   ├── RestTimer.tsx          — Floating odpočítávač pauzy
│   ├── SessionCard.tsx        — Karta tréninku v historii (inline edit)
│   ├── ExerciseManager.tsx    — Přidání/přejmenování/skrytí cviků
│   ├── ExerciseLibrarySection.tsx — Databáze 25 cviků s fotkami
│   ├── ExerciseDetailModal.tsx    — Bottom sheet detail cviku
│   ├── BackupSection.tsx      — Export/import zálohy dat
│   └── progress/
│       ├── ProgressBadge.tsx         — Badge stavu (pokrok/stagnace/pokles)
│       ├── ExerciseStatsCard.tsx     — Grid statistik (max váha, 1RM…)
│       ├── WeightRecommendation.tsx  — Doporučení váhy na příště
│       └── SessionHistoryTable.tsx   — Tabulka posledních 10 záznamů
├── data/
│   └── exerciseLibrary.ts     — 25 cviků (3 dny), lokální fotky, tipy
├── db/
│   ├── schema.ts              — IndexedDB schema (gymapp, verze 1)
│   └── queries.ts             — Všechny DB operace
├── utils/
│   └── progressLogic.ts       — Epley 1RM, statistiky, doporučení váhy
└── types/
    └── index.ts               — Všechny TypeScript typy
```

---

## Databázové schema (IndexedDB — `gymapp` v1)

| Store | Klíč | Indexy | Co ukládá |
|-------|------|--------|-----------|
| `exercises` | `id` (auto) | `by-day` | Cviky (název, den, pořadí, skrytý) |
| `sessions` | `id` (auto) | `by-day`, `by-date` | Záznamy tréninků (den, datum) |
| `sessionEntries` | `id` (auto) | `by-session`, `by-exercise` | Hodnoty (váha, reps, série, poznámka) |

---

## Implementované funkce

### Domovská obrazovka (`Home`)
- Tři karty tréninků — dnešní zvýrazněna fialově
- U každé karty: počet aktivních cviků + datum poslední sezení (relativně)
- Denní motivační citát (rotuje každý den podle dne v roce)
- Odkaz na historii
- Sekce zálohy dat (export / import)

### Tréninkový den (`TrainingDay`)
- Předvyplněné hodnoty z minulé sezení (váha, reps, série)
- Pole pro váhu, opakování, série a **poznámku** ke každému cviku
- Tlačítko **Graf** — inline chart přímo v kartě cviku
- Tlačítko **Progres** — link na `ExerciseProgress` stránku
- Uložení celého tréninku jedním kliknutím
- **Floating RestTimer** — odpočet pauzy (60/90/120/180s), kruhový progress, vibrace
- Správa cviků: přidat, přejmenovat, skrýt/zobrazit (`ExerciseManager`)
- Databáze inspirace — 25 cviků s lokálními fotkami a technikou

### Progres cviku (`ExerciseProgress`)
- Doporučení váhy na příště (Epley 1RM algoritmus, increment 1/2.5/5 kg)
- `ProgressStatus`: `progress` / `same` / `stagnation` / `decline` / `insufficient_data`
- Statistiky: max váha, odhadované 1RM, celkové série
- Graf vývoje váhy (Recharts), zobrazí se od 2 záznamů
- Tabulka posledních 10 sezení s trendem (↑ ↓ →)

### Historie (`History`)
- Všechny sezení od nejnovějšího
- Celkový objem tréninku (váha × reps × série)
- **Inline edit** záznamu (váha, reps, série)
- **Smazání záznamu** i celého tréninku — oboje s potvrzením
- Klik na název cviku → přechod na jeho `ExerciseProgress`

### Záloha dat (`BackupSection`)
- **Export** → stáhne `gymlog-zaloha-YYYY-MM-DD.json` (exercises + sessions + entries)
- **Import** → zobrazí náhled (počty), varuje před přepsáním, pak provede restore

---

## Public assets

```
public/
├── manifest.json        — PWA manifest
├── icon-192.png         — PWA ikona (činka, tmavě fialové pozadí)
├── icon-512.png         — PWA ikona (činka, tmavě fialové pozadí)
├── favicon.svg
└── exercises/           — 25 lokálních fotek cviků (PNG)
    ├── squat.png
    ├── deadlift.png
    ├── bench-press.png
    └── … (další)
```

---

## PWA

- `manifest.json` s `display: standalone`, `theme_color: #0f0f0f`
- Apple mobile web app meta tagy v `index.html`
- Safe-area insets pro iPhony s notchem / Dynamic Island
- Ikona: bílá činka na tmavě fialovém radial gradient pozadí

---

## Design systém

- **Barvy:** Pozadí `#0f0f0f`, karty `zinc-900`, akcent `violet-600`
- **Typografie:** System font stack, antialiased
- **Komponenty:** Rounded-2xl karty, border zinc-800, hover stavy
- **Mobilní vstup:** `inputMode="decimal"` pro váhu, `inputMode="numeric"` pro reps/série

---

## Klíčové query funkce (`db/queries.ts`)

| Funkce | Popis |
|--------|-------|
| `getExercises(dayId)` | Cviky pro daný den (seřazené) |
| `addExercise / updateExercise / toggleExerciseVisibility` | CRUD cviků |
| `getLastSession(dayId)` | Poslední sezení + entries pro daný den |
| `getLastSessionDate / getSessionCount` | Meta pro Home stránku |
| `createSession / saveSessionEntries` | Uložení tréninku |
| `updateSessionEntry / deleteSessionEntry / deleteSession` | Edit/delete v historii |
| `getExerciseHistory(exerciseId)` | Historie cviku obohacená o 1RM |
| `getExerciseById` | Jeden cvik podle ID |
| `getAllSessionsWithEntries` | Celá historie pro History stránku |
| `exportAllData / importAllData` | Záloha a obnova všech dat |

---

## Global Claude Code Instructions

### Security Baseline

- **No secrets in code or git. Ever.** No API keys, tokens, passwords.
- **Input validation:** Never trust client-side validation alone.
- Proactively suggest `/security-review` for auth, payments, user data.

### Code Standards

- Never use `type: any` in TypeScript. Strict typing, generics, `unknown`.
- Latest stable versions of dependencies.
- Maintain consistency with established visual style and code patterns.

### Version Control & Deploy

- Git author email: `ondradobes93@gmail.com` (required — Vercel rejects commits without it)
- **Never commit or push automatically.** Only on explicit request.
- Commit messages: concise, imperative mood.
- Deploy strategy: Git → GitHub → Vercel (auto-deploy).
