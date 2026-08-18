# HoH Voting System

A simple voting application built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Zustand**. Voters enter their name, pick a candidate, and submit one vote each. Results — including tie detection — are shown in a modal, and all state persists to `localStorage` so votes survive page refreshes. Live at: [voting-app](https://voting-app-ui-react.vercel.app/)
 
This is a React port of the original vanilla TypeScript [voting-app-ui](https://github.com/Austin-Deccentric/voting-app-ui), keeping the same core voting logic while moving state management into a persistent Zustand store.

## Features

- **Vote submission form** — controlled inputs with inline, per-field validation errors
- **One vote per voter** — duplicate names are rejected (case/whitespace-normalized)
- **Live vote counter** — total votes update in real time
- **Results modal** — winner, winning vote count, and total votes, with explicit tie handling
- **Reset with confirmation** — clears all votes and the persisted `localStorage` state
- **Persistent state** — Zustand `persist` middleware saves the voting record automatically
- **Toast notifications** — success/error feedback that fades out automatically
- **Accessible UI** — labelled fields, `aria-invalid` / `role="alert"` errors, native `<dialog>` modals with `Esc` and backdrop-click dismissal

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Language | TypeScript (strict) |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 + daisyUI 5 (custom `hoh` dark theme) |
| State | Zustand 5 (`persist` → `localStorage`) |
| Package manager | Bun |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed

### Install & run

```bash
bun install
bun run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

### Other scripts

| Command | Purpose |
|---|---|
| `bun run dev` | Start the Vite dev server |
| `bun run build` | Type-check and produce a production build |
| `bun run typecheck` | Type-check only (`tsc -b`) |
| `bun run lint` | Run ESLint |
| `bun run preview` | Preview the production build |

## Project Structure

```
src/
├── main.tsx                  # React entry point
├── App.tsx                   # UI coordinator: modals, toasts, reset flow
├── index.css                 # Tailwind v4 + daisyUI theme + component classes
├── types.ts                  # Shared domain types (Tvoter, Tcandidate, Result, ...)
├── store/
│   └── useVoteStore.ts       # Zustand store with localStorage persistence
└── components/
    ├── VoteForm.tsx          # Controlled form with inline validation
    ├── VoteCount.tsx         # Live total-votes display
    ├── ResultModal.tsx       # Results dialog (winner / tie / totals)
    └── ConfirmModal.tsx      # Generic confirmation dialog (used for reset)
```

## State Management

The store keeps a **single source of truth** — the `votingRecord` map of voter name → candidate:

```ts
votingRecord: Record<Tvoter, Tcandidate>
```

Everything else (poll tally, total votes, winner, tie status) is **derived** via selectors (`selectResult`, `selectTotalVotes`) rather than stored, so there is no duplicated state to keep in sync.

Persistence is handled by Zustand's `persist` middleware:

- Only `votingRecord` is written to `localStorage` (via `partialize`), under the key `vote-store`.
- `reset()` sets `votingRecord` back to `{}`, which overwrites the persisted entry — effectively wiping saved state.

## Voting Rules

`castVote(voter, candidate)` enforces the same validation chain as the original app, returning a typed result union:

1. Empty voter name → `{ success: false, reason: "empty-name" }`
2. Name already voted → `{ success: false, reason: "already-voted" }`
3. Unknown candidate → `{ success: false, reason: "invalid-candidate" }`
4. Otherwise the vote is recorded → `{ success: true }`

Ties are first-class: when two or more candidates share the top count, the result reports `isTied: true` and the UI flags it instead of silently picking a winner.

## Candidates

The candidate list is currently hardcoded in the store:

```ts
candidates: ["lillian", "victor", "ifeanyi"] as const
```

Update that array (and the `Tcandidate` union in `src/types.ts`) to change the ballot.
