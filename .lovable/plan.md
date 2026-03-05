
# Explore Entry — Full Rebuild Plan

## Current State Assessment

The `ActSelectView` component inside `ExploreTab.tsx` (lines 332–422) is functional but bare. It renders a list of simple bordered cards with:
- Act number + difficulty signal bars
- Title + subtitle text
- A thin progress bar or difficulty bar
- A "Continue ▸" or "Start ▸" text link

It lacks cinematic weight, visual hierarchy, host personality, era theming, and the narrative gravitas the PRD demands. The entry is the **first impression of Story Mode** — it needs to feel like opening a campaign, not browsing a list.

---

## What We're Building

### Layer 1 — Hero Header (Story Mode Identity)

Replace the current plain text header with a full cinematic hero banner:

```text
┌──────────────────────────────────────┐
│  [gold top accent line]              │
│                                      │
│  STORY MODE          [noise texture] │
│  Your Historical Campaign            │
│                                      │
│  XP: 1,240  ·  Rank: Scholar  ·  🔥7 │
└──────────────────────────────────────┘
```

- Pull live rank + XP + streak from `AppContext` using `getRank(user.xp)`
- Show a thin gold XP progress bar toward next rank threshold using `getNextRankXP`
- Archival card container with noise texture overlay matching the design system

---

### Layer 2 — Act Cards — Full Redesign

Each act card becomes a richer, more cinematic unit:

```text
┌──────────────────────────────────────┐
│ ACT I          [Beginner ● ●]        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ THE ANCIENT WORLD                    │
│ Mesopotamia, Egypt & Early Civs      │
│                                      │
│ HOST: Cleopatra                      │
│ "Egypt did not fall to Rome..."      │
│                                      │
│ [▓▓▓▓░░░] 3 of 7 · 2 Crowned        │
│                              [▸]     │
└──────────────────────────────────────┘
```

**New elements per card:**
- **Act number as large decorative type** — `ACT I` in Cinzel uppercase, spaced out
- **Ornamental divider line** between act label and title
- **Host teaser** — show `hostName` + truncated `hostQuote` from the first level in `allLevelsByAct[act.id][0]`
- **Mastery-aware progress** — count nodes with mastery `!== 'unplayed'` from `nodeMastery` context, plus a "X Crowned" sub-stat
- **Lock state treatment** — locked acts get a frosted/dimmed overlay with a lock icon and unlock requirement text ("Complete Act I Boss to unlock")
- **Active act** gets a gold left border accent and slightly elevated card

---

### Layer 3 — Visual Theming Per Era

Each act card gets a subtle era accent color tint on the left border to differentiate them visually:

| Acts | Era Theme | Border Accent |
|------|-----------|---------------|
| 1–3 | Ancient | Gold (`primary`) |
| 4–6 | Medieval/Exploration | Amber (`secondary`) |
| 7–9 | Revolution/Industrial | Warm orange |
| 10–12 | Modern Wars | Red (`destructive`) |
| 13–15 | Contemporary | Muted green (`success`) |

This is a CSS border-left color only — no background changes, keeping the dark card aesthetic.

---

### Layer 4 — "In Progress" Act Spotlight

If the user has a partially completed act (Act I in the demo), show a **"Continue Campaign"** spotlight card at the top ABOVE the full list:

```text
┌──────────────────────────────────────┐
│ CONTINUE WHERE YOU LEFT OFF          │
│                                      │
│ Act I — The Ancient World            │
│ Next: Hammurabi · Level 2            │
│                                      │
│          [ Resume ▸ ]                │
└──────────────────────────────────────┘
```

This uses `animated pulsing gold border` to draw the eye — similar to the current node's pulsing ring treatment.

---

### Layer 5 — Empty State / First-Time UX

For a true first-time user with zero progress, replace the campaign list with a brief onboarding moment:

```text
┌──────────────────────────────────────┐
│        🏛                             │
│  Begin Your Historical Journey       │
│  Start with the Ancient World and    │
│  work your way through 15 eras.      │
│                                      │
│     [ Start Act I ▸ ]                │
└──────────────────────────────────────┘
```

This only shows if ALL nodes are `unplayed`.

---

## Technical Implementation

### Files to Modify

**`src/components/tabs/ExploreTab.tsx`** — primary change target

1. **Replace `ActSelectView` entirely** — keep the same function signature `({ onSelectAct })` so the parent `ExploreTab` component wiring stays identical
2. **Import additions needed:**
   - `useApp` — already imported ✓
   - `getNextRankXP` from `@/types` — needs to be imported (function already exists in `src/types/index.ts`)
   - `allLevelsByAct` from `@/data/levelData` — already imported ✓
   - `Progress` from `@/components/ui/progress`
   - `Lock`, `Flame`, `BookOpen` from `lucide-react` — Lock already imported ✓

3. **New internal helpers inside `ActSelectView`:**
   - `getActEraColor(actNumber: number): string` — returns the border-left color class based on act group
   - `getActMasteryStats(act: Act): { played: number; crowned: number; total: number }` — reads from `nodeMastery` context
   - `getInProgressAct(acts: Act[]): Act | null` — finds the first act with partial progress (some played, not all)
   - `getActHostTeaser(act: Act): { name: string; quote: string } | null` — reads from `allLevelsByAct[act.id][0]`

4. **Lock logic:**
   - Act 1 always unlocked
   - Acts 2+ locked unless `crownedCount > 0` for the previous act's boss node (using a simple check: `getNodeMastery('act{n-1}-boss') === 'crowned'` or at least `!== 'unplayed'`)
   - For demo purposes: Act 1 always open, Acts 2–15 show locked state with the "Complete Act I to unlock" message

### New Component Structure Inside `ActSelectView`

```text
ActSelectView
├── StoryModeHeader          (user rank + XP progress bar)
├── ContinueBanner (conditional — if in-progress act exists)
├── ScrollableActList
│   └── ActCard × 15
│       ├── ActCardHeader    (Act number + difficulty)
│       ├── ActCardTitle     (era title + subtitle)
│       ├── ActCardHost      (host name + truncated quote)
│       ├── ActCardProgress  (progress bar + mastery stats)
│       └── ActCardCTA       (Continue / Start / Locked)
└── (optional) FirstTimeOnboarding (if all nodes unplayed)
```

All implemented as inline sub-components within `ExploreTab.tsx` — no new files needed.

---

## Animation Plan

- **Card stagger**: Each act card animates in with `delay: i * 0.06` (already existing, keep)
- **Continue banner**: Pulses gold border with `animate={{ borderColor: ['hsl(53,91%,65%,0.3)', 'hsl(53,91%,65%,0.8)', 'hsl(53,91%,65%,0.3)'] }}`
- **Progress bars**: Animate from 0 to final value on mount with `transition={{ delay: 0.3 + i * 0.06, duration: 0.7 }}`
- **Lock overlay**: `opacity-50` + blur filter on locked cards — `filter: blur(0.5px)` applied via inline style
- **Host quote**: Appears with `delay: 0.2` after card title, in italic Cormorant Garamond

---

## What Does NOT Change

- The `NodeBoardView` and `ExploreTab` parent component — zero changes there
- The `LevelFlow` wiring — untouched
- The `actsData` array — untouched
- All 15 act definitions — untouched

---

## Build Order

1. Add `getNextRankXP` import to `ExploreTab.tsx`
2. Write the `StoryModeHeader` sub-component (rank + XP bar)
3. Write the `ContinueBanner` sub-component
4. Rewrite `ActCard` internals with host teaser, era color, lock state, mastery stats
5. Assemble in the new `ActSelectView`
6. Test all states: locked, in-progress, completed acts

This is a **single file change** (`ExploreTab.tsx`) — clean, surgical, high-impact.
