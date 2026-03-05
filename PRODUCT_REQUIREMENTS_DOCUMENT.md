# History Bytes - Product Requirements Document

## For AI Media Generation (Gemini/Veo/Suno)

---

# TABLE OF CONTENTS

1. [Product Overview](#1-product-overview)
2. [Visual Design System](#2-visual-design-system)
3. [App Navigation & Layout](#3-app-navigation--layout)
4. [Journey Tab (Core Experience)](#4-journey-tab-core-experience)
5. [Node Types - Detailed Specs](#5-node-types---detailed-specs)
6. [Arcade Tab (Mini-Games)](#6-arcade-tab-mini-games)
7. [Learn Tab (Courses)](#7-learn-tab-courses)
8. [Watch Tab (Video Feed)](#8-watch-tab-video-feed)
9. [Spirit Guides (NPCs)](#9-spirit-guides-npcs)
10. [Gamification Systems](#10-gamification-systems)
11. [Content Examples](#11-content-examples)
12. [Media Asset Requirements](#12-media-asset-requirements)
13. [ASCII Screen Layouts](#13-ascii-screen-layouts)

---

# 1. PRODUCT OVERVIEW

## What is History Bytes?

**History Bytes** is a gamified history education mobile app inspired by Duolingo. Users learn history through interactive "journeys" that combine video, audio, images, and game mechanics to make learning engaging and memorable.

## Core Value Proposition

- **Bite-sized learning**: 5-10 minute sessions per chapter
- **Multi-format engagement**: Videos, audio clips, interactive images, quizzes, decision games
- **Gamification**: XP, streaks, ranks, badges, leaderboards
- **Personal guides**: Historical figures as AI companions

## Target Audience

- History enthusiasts (16-45 years old)
- Students seeking supplemental education
- Casual learners who enjoy trivia/games
- Anyone who finds traditional history boring

## Platform

- Mobile-first progressive web app (PWA)
- Dark mode only (premium feel)
- Portrait orientation optimized

---

# 2. VISUAL DESIGN SYSTEM

## Color Palette

### Primary Colors
```
OBSIDIAN BACKGROUND SCALE:
- obsidian-900: #0A0A0B  (deepest black, main bg)
- obsidian-850: #0D0E10  (slightly lighter)
- obsidian-800: #111214  (card backgrounds)
- obsidian-750: #15171A  (elevated surfaces)
- obsidian-700: #1A1C1F  (input fields)

CHARCOAL (Secondary surfaces):
- charcoal-650: #23262B
- charcoal-600: #2A2D31
- charcoal-550: #333740

GOLD (Primary accent - CTAs, highlights, rewards):
- gold-primary: #C6A24F    (buttons, icons)
- gold-highlight: #E8C979  (hover states, emphasis)
- gold-deep: #B88A2E       (pressed states)

IVORY (Text):
- ivory: #F5F2EA (primary text on dark)

SEMANTIC COLORS:
- Success: Emerald green (#10B981)
- Error/Destructive: Red (#EF4444)
- Warning: Amber (#F59E0B)
- Info: Blue (#3B82F6)
```

### Visual Mood
- **Premium & Scholarly**: Like a high-end museum app
- **Dark & Cinematic**: Netflix-meets-Duolingo
- **Gold accents**: Rewards feel valuable
- **Subtle gradients**: Depth without gaudiness

## Typography

```
HEADERS (Titles, chapter names):
- Font: Cormorant Garamond (serif)
- Weight: 600-700
- Style: Elegant, editorial, museum-like
- Use: Arc titles, chapter names, celebration text

BODY (Everything else):
- Font: Inter (sans-serif)
- Weight: 400-600
- Style: Clean, modern, highly readable
- Use: Questions, explanations, UI labels

SIZE SCALE:
- xs: 12px (captions, timestamps)
- sm: 14px (secondary text)
- base: 16px (body text)
- lg: 18px (emphasized text)
- xl: 20px (section headers)
- 2xl: 24px (screen titles)
- 3xl: 30px (celebration numbers)
- 4xl+: 36px+ (hero moments)
```

## Iconography

- **Style**: Lucide React icons (consistent stroke weight)
- **Size**: 16px (inline), 20px (buttons), 24px (headers), 40px+ (hero)
- **Node type emojis**:
  - 🎬 Video Lesson
  - 🗺️ Image Explore
  - 🎮 Two Truths
  - 🎧 Found Tape (Audio)
  - 📰 Headlines
  - ⏳ Chrono Order
  - ❓ Quiz Mix
  - 🎯 Decision
  - 👑 Boss

## Spacing & Layout

```
SPACING SCALE (Tailwind):
- 1: 4px
- 2: 8px
- 3: 12px
- 4: 16px (standard gap)
- 6: 24px (section gap)
- 8: 32px (major section)

BORDER RADIUS:
- xs: 8px (small chips)
- sm: 12px (buttons)
- md: 16px (cards)
- lg: 20px (modals)
- xl: 24px (hero cards)
- full: 9999px (pills, avatars)

SAFE AREAS:
- Top: 44px (status bar)
- Bottom: 80px (bottom nav) + 34px (home indicator)
```

## Animation Patterns

```
ENTRANCE ANIMATIONS:
- Cards: Fade up (opacity 0→1, y: 10→0) over 300ms
- Modals: Scale in (scale 0.95→1) over 300ms
- Lists: Stagger children by 50ms

MICRO-INTERACTIONS:
- Buttons: Scale 0.98 on press
- Cards: Subtle hover lift (translateY -2px)
- Success: Confetti burst + bounce

TIMING:
- Quick: 150ms (hovers, toggles)
- Normal: 300ms (modals, cards)
- Slow: 500ms (celebrations)
- Spring: stiffness 200, damping 20
```

---

# 3. APP NAVIGATION & LAYOUT

## Screen Structure

```
┌─────────────────────────────────────────┐
│          STATUS BAR (44px)              │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│                                         │
│            MAIN CONTENT                 │
│         (Scrollable area)               │
│                                         │
│                                         │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│         BOTTOM NAV (80px)               │
│   🏠    🗺️    📚    🎮    📺    👤    │
│  Home Journey Learn Arcade Watch Profile│
└─────────────────────────────────────────┘
```

## Tab Structure

| Tab | Icon | Primary Purpose |
|-----|------|-----------------|
| Home | 🏠 | Dashboard, quick actions, daily content |
| Journey | 🗺️ | Main learning experience (Duolingo-style) |
| Learn | 📚 | Structured courses (Coursera-style) |
| Arcade | 🎮 | Quick mini-games for daily play |
| Watch | 📺 | TikTok-style video feed |
| Profile | 👤 | Stats, settings, study notes |

## Header Component

```
┌─────────────────────────────────────────┐
│ [Guide Avatar]  History Bytes    🔥12 ⭐│
│  👑 Socrates   ═══════════════  1,250 XP│
└─────────────────────────────────────────┘
```

- Left: Selected spirit guide avatar + name
- Center: App logo (hidden on some screens)
- Right: Streak fire icon + XP with progress bar

---

# 4. JOURNEY TAB (CORE EXPERIENCE)

## Information Architecture

```
JOURNEY TAB
├── Arc List (Topics)
│   ├── French Revolution 🇫🇷
│   ├── World War II 🪖
│   ├── Ancient Rome 🏛️
│   ├── American Civil War 🇺🇸
│   └── ... more arcs
│
└── Arc Detail (Selected Arc)
    ├── Arc Overview (intro, host, badge)
    ├── Chapter List
    │   ├── Chapter 1: "The War Begins"
    │   │   ├── Node 1: Video Lesson
    │   │   ├── Node 2: Image Explore
    │   │   ├── Node 3: Two Truths
    │   │   ├── ... 4-8 more nodes
    │   │   └── Node 10: Boss Battle
    │   ├── Chapter 2: "Global Conflict"
    │   └── Chapter 3: "Victory"
    │
    └── Node Player (Active Learning)
        ├── Intro Screen
        ├── Content (varies by type)
        ├── Results Screen
        ├── Transition Screen
        └── Chapter Complete
```

## Arc Selection Screen

```
┌─────────────────────────────────────────┐
│              JOURNEY                    │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │  🇫🇷  French Revolution             │ │
│ │  Liberty, equality, and the fall    │ │
│ │  of the monarchy                    │ │
│ │  ━━━━━━━━━━━━━━░░░░░░  65%         │ │
│ │  3 Chapters • 1,200 XP              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │  🪖  World War II                   │ │
│ │  The war that changed the world     │ │
│ │  forever                            │ │
│ │  ━━━━━░░░░░░░░░░░░░░░  20%         │ │
│ │  3 Chapters • 1,530 XP              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │  🏛️  Ancient Rome                   │ │
│ │  From Republic to Empire            │ │
│ │  🔒 LOCKED - Complete 1 arc first   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Chapter Map Screen

```
┌─────────────────────────────────────────┐
│  ← Back       WORLD WAR II        🪖    │
├─────────────────────────────────────────┤
│                                         │
│    Chapter 1: The War Begins            │
│    ━━━━━━━━━━━━━━━━━━━━  100%          │
│                                         │
│         🎬 ─── 🗺️ ─── 🎮               │
│         ●      ●      ●                │
│              \   /                      │
│               🎧                        │
│               ●                         │
│              / \                        │
│         📰 ─── ⏳ ─── 🎬               │
│         ●      ●      ●                │
│                |                        │
│               🎯                        │
│               ●                         │
│                |                        │
│               ❓                        │
│               ●                         │
│                |                        │
│               👑                        │
│               ★  BOSS                   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ⭐ Chapter Complete!           │   │
│  │  690 XP Earned • 3 Stars        │   │
│  └─────────────────────────────────┘   │
│                                         │
│    Chapter 2: The Global Conflict       │
│    ░░░░░░░░░░░░░░░░░░░░  0%            │
│    [  START CHAPTER  ]                  │
│                                         │
└─────────────────────────────────────────┘
```

## Node Intro Screen

```
┌─────────────────────────────────────────┐
│                                         │
│                 🎬                      │
│            VIDEO LESSON                 │
│                                         │
│    "Storm Clouds Over Europe"           │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  💡 TIP: Videos have a quiz     │   │
│   │     after. Pay attention!       │   │
│   └─────────────────────────────────┘   │
│                                         │
│         ⭐ 80 XP Available              │
│                                         │
│                                         │
│       [    BEGIN    ]                   │
│                                         │
└─────────────────────────────────────────┘
```

---

# 5. NODE TYPES - DETAILED SPECS

## 5.1 Video Lesson Node 🎬

### Purpose
Hook users with dramatic historical footage, then test comprehension.

### Flow
1. Context text (2-3 sentences setup)
2. Full-screen video (30-60 seconds)
3. 1-2 comprehension questions

### Screen Layout

```
PHASE 1: CONTEXT
┌─────────────────────────────────────────┐
│                                         │
│              🎬                         │
│        VIDEO LESSON                     │
│                                         │
│  "Storm Clouds Over Europe"             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ In the summer of 1939, Europe   │   │
│  │ stood on the brink of war.      │   │
│  │ Hitler's armies had already     │   │
│  │ swallowed Austria and           │   │
│  │ Czechoslovakia. Only Poland     │   │
│  │ stood in his path...            │   │
│  └─────────────────────────────────┘   │
│                                         │
│       [    WATCH VIDEO    ]             │
│                                         │
└─────────────────────────────────────────┘

PHASE 2: VIDEO PLAYING
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │                                     │ │
│ │         [VIDEO PLAYER]              │ │
│ │                                     │ │
│ │      Historical footage of          │ │
│ │      Nazi troops, maps showing      │ │
│ │      invasion routes, etc.          │ │
│ │                                     │ │
│ │                                     │ │
│ │      advancement, Churchill speech  │ │
│ │                                     │ │
│ │                                     │ │
│ │   advancement, Churchill speech     │ │
│ │                                     │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│     advancement, Churchill speech       │
│    ▶  ━━━━━━━━━━░░░░░░░░░░  0:45/1:30  │
│                                         │
│              [SKIP →]                   │
└─────────────────────────────────────────┘

PHASE 3: QUESTION
┌─────────────────────────────────────────┐
│                                         │
│  Question 1 of 2                        │
│                                         │
│  What event triggered Britain's         │
│  declaration of war on Germany?         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  A) Germany invaded France      │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  B) Germany invaded Poland  ✓   │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  C) Germany bombed London       │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  D) Germany sank British ships  │   │
│  └─────────────────────────────────┘   │
│                                         │
│       [    SUBMIT ANSWER    ]           │
│                                         │
└─────────────────────────────────────────┘
```

### Video Content Requirements
| Video | Duration | Content Description |
|-------|----------|---------------------|
| Storm Clouds Over Europe | 45-60s | Europe map with shadows spreading, Hitler rally footage, Nazi-Soviet Pact signing, Polish soldiers preparing |
| The Miracle at Dunkirk | 45-60s | Dunkirk beach crowded with soldiers, Little Ships sailing, evacuation footage, Churchill's "We shall fight" audio |
| Pearl Harbor Attack | 30-45s | Japanese planes, explosions, USS Arizona sinking, Roosevelt's "day which will live in infamy" |

---

## 5.2 Image Explore Node 🗺️

### Purpose
Interactive learning through zoomable images with hotspots.

### Flow
1. Full-screen image displayed
2. User taps pulsing hotspots to reveal info
3. Must tap all hotspots before quiz
4. 1-2 questions about the image

### Screen Layout

```
┌─────────────────────────────────────────┐
│  ← Back    MAP OF THE INVASION     🗺️  │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │     [MAP IMAGE OF POLAND]           │ │
│ │                                     │ │
│ │         ● Army                      │ │
│ │         Group    ○                  │ │
│ │         North   /                   │ │
│ │               ◇                     │ │
│ │         POLAND  \                   │ │
│ │                  ● Soviet           │ │
│ │         ● Army     Forces           │ │
│ │         Group                       │ │
│ │         South                       │ │
│ │                                     │ │
│ │   ● = Pulsing hotspot (tap me!)     │ │
│ │   ◇ = Warsaw                        │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  Tap the glowing dots to explore        │
│  ━━━━━━━━━━░░░░  2/4 discovered         │
│                                         │
└─────────────────────────────────────────┘

HOTSPOT POPUP:
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐   │
│  │  ARMY GROUP NORTH               │   │
│  │                                 │   │
│  │  Led by General Fedor von Bock, │   │
│  │  this force attacked from East  │   │
│  │  Prussia, cutting off Polish    │   │
│  │  access to the Baltic Sea.      │   │
│  │                                 │   │
│  │         [GOT IT]                │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Image Types Supported
| Type | Description | Example |
|------|-------------|---------|
| `map` | Geographic/military maps | Poland invasion routes |
| `photo` | Historical photographs | Dunkirk beach |
| `document` | Primary source documents | Declaration of Independence |
| `propaganda` | Period posters/art | WWII recruitment posters |

### Image Requirements
- Resolution: 1200x800 minimum (landscape) or 800x1200 (portrait)
- Format: JPG or WebP
- Hotspots: 3-6 per image, positioned at % coordinates

---

## 5.3 Two Truths and a Lie Node 🎮

### Purpose
Myth-busting game that challenges assumptions about history.

### Flow
1. Show context/learning points
2. Display 3 statements
3. User identifies the false one
4. Reveal with explanation

### Screen Layout

```
┌─────────────────────────────────────────┐
│              🎮                         │
│         TWO TRUTHS                      │
│        AND A LIE                        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📚 CONTEXT                      │   │
│  │ Before WWII, Germany and the    │   │
│  │ Soviet Union signed a secret    │   │
│  │ pact that shocked the world...  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Which statement is FALSE?              │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  1. Hitler and Stalin signed    │   │
│  │     a non-aggression pact       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  2. Poland was invaded from     │   │ ← Selected
│  │     only the west by Germany    │   │    (highlighted)
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  3. The invasion of Poland      │   │
│  │     took only 5 weeks           │   │
│  └─────────────────────────────────┘   │
│                                         │
│       [    THAT'S THE LIE    ]          │
│                                         │
└─────────────────────────────────────────┘

RESULT SCREEN:
┌─────────────────────────────────────────┐
│                                         │
│              ✓ CORRECT!                 │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  THE LIE:                       │   │
│  │  "Poland was invaded from       │   │
│  │   only the west by Germany"     │   │
│  │                                 │   │
│  │  THE TRUTH:                     │   │
│  │  Poland was invaded from BOTH   │   │
│  │  sides! Germany attacked from   │   │
│  │  the west on Sept 1, and the    │   │
│  │  Soviet Union invaded from the  │   │
│  │  east on Sept 17, as secretly   │   │
│  │  agreed in their pact.          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Host says: "The Nazi-Soviet Pact       │
│  was one of history's most cynical      │
│  deals!"                                │
│                                         │
│       [    CONTINUE    ]                │
│                                         │
└─────────────────────────────────────────┘
```

---

## 5.4 Found Tape Node 🎧

### Purpose
Immersive audio experience with primary sources (letters, speeches, recordings).

### Flow
1. Show source context (who, when, where)
2. Play audio with synced transcript
3. User can tap transcript lines to replay
4. Comprehension questions

### Screen Layout

```
┌─────────────────────────────────────────┐
│              🎧                         │
│          FOUND TAPE                     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📜 Chamberlain's Declaration   │   │
│  │     BBC Radio, Sept 3, 1939     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │  [AUDIO WAVEFORM VISUALIZATION] │   │
│  │                                 │   │
│  │    ▶  ━━━━━━━━░░░░░  0:15/0:30 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  TRANSCRIPT:                            │
│  ┌─────────────────────────────────┐   │
│  │ ▸ "I am speaking to you from    │   │ ← Active line
│  │    the Cabinet Room at 10       │   │   (highlighted)
│  │    Downing Street..."           │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   "This morning, the British    │   │
│  │    Ambassador in Berlin handed  │   │
│  │    the German Government a      │   │
│  │    final note..."               │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   "I have to tell you now that  │   │
│  │    no such undertaking has been │   │
│  │    received, and that           │   │
│  │    consequently this country    │   │
│  │    is at war with Germany."     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Tap any line to replay                 │
│                                         │
└─────────────────────────────────────────┘
```

### Audio Content Requirements
| Audio | Duration | Content |
|-------|----------|---------|
| Chamberlain Declaration | 30s | "This country is at war with Germany" |
| Eisenhower D-Day Order | 30s | "You are about to embark upon the Great Crusade" |
| FDR Pearl Harbor | 30s | "A day which will live in infamy" |
| Soldier's Letter | 30s | Dramatic reading of primary source |

---

## 5.5 Headlines Node 📰

### Purpose
Period-appropriate newspaper reading for historical context.

### Flow
1. Display newspaper masthead (publication, date)
2. Show 2-4 headlines with images
3. User reads through articles
4. Quiz on content

### Screen Layout

```
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │    ═══════════════════════════      │ │
│ │       THE LONDON TIMES              │ │
│ │    ═══════════════════════════      │ │
│ │    September 4, 1939                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │    [NEWSPAPER PHOTO]            │ │ │
│ │ │    Chamberlain at BBC mic       │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │                                     │ │
│ │ BRITAIN DECLARES WAR ON GERMANY    │ │
│ │                                     │ │
│ │ Prime Minister Chamberlain         │ │
│ │ addressed the nation this morning  │ │
│ │ via the BBC, confirming that       │ │
│ │ Britain is now at war following    │ │
│ │ Germany's invasion of Poland...    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ CHILDREN EVACUATE LONDON           │ │
│ │                                     │ │
│ │ Operation Pied Piper begins as     │ │
│ │ thousands of children board trains │ │
│ │ for the countryside...             │ │
│ └─────────────────────────────────────┘ │
│                                         │
│       [    CONTINUE TO QUIZ    ]        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 5.6 Chrono Order Node ⏳

### Purpose
Timeline ordering game to reinforce sequence of events.

### Flow
1. Show 4-6 events in scrambled order
2. User drags to reorder chronologically
3. Submit and reveal correct order
4. Show dates for each event

### Screen Layout

```
┌─────────────────────────────────────────┐
│              ⏳                         │
│        CHRONO ORDER                     │
│                                         │
│  Put these events in chronological      │
│  order (earliest to latest):            │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ≡  Germany invades Poland      │ 1 │ ← Drag handle
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ≡  Dunkirk evacuation          │ 2 │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ≡  France surrenders           │ 3 │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ≡  Battle of Britain begins    │ 4 │
│  └─────────────────────────────────┘   │
│                                         │
│  Drag items to reorder                  │
│                                         │
│       [    CHECK ORDER    ]             │
│                                         │
└─────────────────────────────────────────┘

RESULTS:
┌─────────────────────────────────────────┐
│              ✓ CORRECT!                 │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ✓ Germany invades Poland       │   │
│  │    September 1, 1939            │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  ✓ Dunkirk evacuation           │   │
│  │    May 26 - June 4, 1940        │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  ✓ France surrenders            │   │
│  │    June 22, 1940                │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  ✓ Battle of Britain begins     │   │
│  │    July 10, 1940                │   │
│  └─────────────────────────────────┘   │
│                                         │
│       [    CONTINUE    ]                │
│                                         │
└─────────────────────────────────────────┘
```

---

## 5.7 Quiz Mix Node ❓

### Purpose
Traditional multiple-choice quiz for comprehensive review.

### Flow
1. Show questions one at a time
2. 4 answer choices per question
3. Immediate feedback after each
4. Show score at end

### Screen Layout

```
┌─────────────────────────────────────────┐
│              ❓                         │
│          QUIZ MIX                       │
│                                         │
│  Question 2 of 4                        │
│  ━━━━━━━━━━━━░░░░░░░░░░  Score: 1/1    │
│                                         │
│  What was the code name for the         │
│  Allied invasion of Normandy?           │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  A) Operation Barbarossa        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  B) Operation Overlord      ✓   │   │ ← Selected
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  C) Operation Market Garden     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  D) Operation Torch             │   │
│  └─────────────────────────────────┘   │
│                                         │
│       [    SUBMIT ANSWER    ]           │
│                                         │
└─────────────────────────────────────────┘
```

---

## 5.8 Decision Node 🎯

### Purpose
Ethical/strategic choices that reveal historical outcomes.

### Flow
1. Present historical scenario
2. Give 2 choices (A or B)
3. User chooses
4. Reveal historical choice and consequences

### Screen Layout

```
┌─────────────────────────────────────────┐
│              🎯                         │
│          DECISION                       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  THE SCENARIO                   │   │
│  │                                 │   │
│  │  May 1940: The British Army is  │   │
│  │  trapped at Dunkirk. You are    │   │
│  │  Churchill. German tanks are    │   │
│  │  closing in. What do you do?    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  OPTION A                       │   │
│  │                                 │   │
│  │  Use only Royal Navy ships for  │   │
│  │  evacuation. Keep civilians out │   │
│  │  of danger.                     │   │
│  │                                 │   │
│  │         [CHOOSE A]              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  OPTION B                       │   │
│  │                                 │   │
│  │  Call on civilian boat owners   │   │
│  │  to help rescue the soldiers.   │   │
│  │  Risky, but could save more.    │   │
│  │                                 │   │
│  │         [CHOOSE B]              │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘

RESULT:
┌─────────────────────────────────────────┐
│                                         │
│  ✓ You chose the HISTORICAL option!     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  WHAT ACTUALLY HAPPENED:        │   │
│  │                                 │   │
│  │  Churchill called for civilian  │   │
│  │  vessels in Operation Dynamo.   │   │
│  │  Over 800 "Little Ships" -      │   │
│  │  fishing boats, pleasure craft, │   │
│  │  lifeboats - crossed the        │   │
│  │  Channel. Together with the     │   │
│  │  Navy, they rescued 338,226     │   │
│  │  soldiers in just 9 days.       │   │
│  │                                 │   │
│  │  It was called the "Miracle     │   │
│  │  of Dunkirk."                   │   │
│  └─────────────────────────────────┘   │
│                                         │
│       [    CONTINUE    ]                │
│                                         │
└─────────────────────────────────────────┘
```

---

## 5.9 Boss Node 👑

### Purpose
Timed challenge that tests mastery of the chapter.

### Flow
1. Host intro (dramatic)
2. 3-5 questions with timer
3. Questions get harder
4. XP multiplier for fast/accurate answers
5. Victory or defeat screen

### Screen Layout

```
┌─────────────────────────────────────────┐
│              👑                         │
│        BOSS BATTLE                      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      ⏱️ 0:45 remaining          │   │
│  │      ━━━━━━━━━━━░░░░░░░░░       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Question 3 of 5                        │
│                                         │
│  QUICK! What was the nickname           │
│  for the British civilian boats         │
│  at Dunkirk?                            │
│                                         │
│  ┌───────────────┐ ┌───────────────┐   │
│  │ Ghost Fleet   │ │ Little Ships  │   │
│  └───────────────┘ └───────────────┘   │
│                                         │
│  ┌───────────────┐ ┌───────────────┐   │
│  │ Freedom Fleet │ │ Rescue Armada │   │
│  └───────────────┘ └───────────────┘   │
│                                         │
│  2x XP MULTIPLIER ACTIVE!               │
│                                         │
└─────────────────────────────────────────┘

VICTORY:
┌─────────────────────────────────────────┐
│                                         │
│              🏆                         │
│        BOSS DEFEATED!                   │
│                                         │
│         ⭐⭐⭐                          │
│                                         │
│         +300 XP                         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  "Magnifique! You truly         │   │
│  │   understand the forces that    │   │
│  │   shaped this era!"             │   │
│  │                                 │   │
│  │           - Your Guide          │   │
│  └─────────────────────────────────┘   │
│                                         │
│       [    CONTINUE    ]                │
│                                         │
└─────────────────────────────────────────┘
```

---

# 6. ARCADE TAB (MINI-GAMES)

## Game List

| Game | Type | Description | Daily Cap |
|------|------|-------------|-----------|
| History Wordle | word | Guess 5-letter history word | 1 play |
| Guess the Year | timeline | Match event to year | 3 plays |
| Two Truths | trivia | Arcade version of journey node | 5 plays |
| Spot the Anachronism | observation | Find out-of-place detail | 3 plays |
| Connections | matching | 4x4 category matching | 1 play |
| Map Mysteries | geography | Identify empires from shapes | 3 plays |
| Artifact Detective | clues | Guess artifact from clues | 3 plays |
| Cause & Effect | logic | Match causes to effects | 5 plays |

## Arcade Home Layout

```
┌─────────────────────────────────────────┐
│             🎮 ARCADE                   │
├─────────────────────────────────────────┤
│                                         │
│  DAILY GAMES                            │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📝 History Wordle              │   │
│  │  Guess the word in 6 tries      │   │
│  │  🎯 Today: Not played           │   │
│  │         [PLAY]                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🔢 Guess the Year              │   │
│  │  When did this happen?          │   │
│  │  🎯 2/3 plays today             │   │
│  │         [PLAY]                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  CLASSIC GAMES                          │
│                                         │
│  ┌───────────┐ ┌───────────┐           │
│  │  🎭       │ │  🕵️       │           │
│  │ Two       │ │ Spot the  │           │
│  │ Truths    │ │ Anachron. │           │
│  │  5/5 left │ │  3/3 left │           │
│  └───────────┘ └───────────┘           │
│                                         │
│  ┌───────────┐ ┌───────────┐           │
│  │  🔗       │ │  🗺️       │           │
│  │ Connect-  │ │ Map       │           │
│  │ ions      │ │ Mysteries │           │
│  │  1/1 left │ │  3/3 left │           │
│  └───────────┘ └───────────┘           │
│                                         │
└─────────────────────────────────────────┘
```

---

# 7. LEARN TAB (COURSES)

## Course Structure

```
COURSE
├── Course Info (title, description, instructor, outcomes)
├── Units (3-6 per course)
│   ├── Unit 1: "The Old Kingdom"
│   │   ├── Lesson 1: "The First Pyramids" (15 min)
│   │   ├── Lesson 2: "Life on the Nile" (12 min)
│   │   └── Lesson 3: "Pharaoh's Court" (18 min)
│   ├── Unit 2: "The Middle Kingdom"
│   └── Unit 3: "The New Kingdom"
└── Completion Certificate
```

## Course Catalog Layout

```
┌─────────────────────────────────────────┐
│              📚 LEARN                   │
├─────────────────────────────────────────┤
│                                         │
│  CONTINUE LEARNING                      │
│  ┌─────────────────────────────────┐   │
│  │ [THUMBNAIL]  Ancient Egypt      │   │
│  │              Unit 2, Lesson 3   │   │
│  │              ━━━━━━━━░░░  67%   │   │
│  │              [CONTINUE]         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  FEATURED COURSES                       │
│  ◀ ┌─────────┐ ┌─────────┐ ▶           │
│    │ [IMG]   │ │ [IMG]   │             │
│    │ Roman   │ │ Medieval│             │
│    │ Empire  │ │ Europe  │             │
│    │ ⭐ 4.8  │ │ ⭐ 4.6  │             │
│    └─────────┘ └─────────┘             │
│                                         │
│  BROWSE BY CATEGORY                     │
│                                         │
│  [Ancient] [Medieval] [Modern]          │
│  [Warfare] [Culture] [Science]          │
│                                         │
└─────────────────────────────────────────┘
```

---

# 8. WATCH TAB (VIDEO FEED)

## TikTok-Style Video Feed

```
┌─────────────────────────────────────────┐
│  Ancient  Medieval  Modern  Warfare     │
│   ━━━━━                                 │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │                                     │ │
│ │         [FULL SCREEN VIDEO]         │ │
│ │                                     │ │
│ │      "The Fall of Constantinople"   │ │
│ │                                     │ │
│ │                                     │ │
│ │                                     │ │
│ │                                     │ │
│ │                           ❤️ 1.2K   │ │
│ │                           💬 234    │ │
│ │                           ↗️ Share  │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  The Byzantine Empire met its end in    │
│  1453 when Ottoman forces breached...   │
│                                         │
│  @history_professor • 2.3M views        │
│                                         │
└─────────────────────────────────────────┘
```

---

# 9. SPIRIT GUIDES (NPCs)

## Available Guides

| Guide | Era | Personality | Colors | Specialty |
|-------|-----|-------------|--------|-----------|
| Socrates | Ancient Greece | Wise | Blue/Slate | Critical Thinking |
| Abraham Lincoln | 19th Century | Wise | Slate/Amber | Leadership |
| Cleopatra VII | Ptolemaic Egypt | Regal | Amber/Purple | Strategy |
| Leonardo da Vinci | Renaissance | Witty | Amber/Emerald | Innovation |
| Sun Tzu | Ancient China | Wise | Red/Slate | Military Strategy |
| Marie Curie | 20th Century | Scholarly | Emerald/Blue | Scientific Discovery |
| Harriet Tubman | 19th Century | Bold | Amber/Slate | Courage & Justice |
| Elizabeth I | Tudor England | Regal | Purple/Amber | Politics & Power |

## Guide Selection Screen

```
┌─────────────────────────────────────────┐
│                                         │
│  Choose Your Guide                      │
│                                         │
│  A historical figure will accompany     │
│  you on your journey through time.      │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  🏛️    │ │  🎩    │ │  👑    │   │
│  │Socrates │ │Lincoln  │ │Cleopatra│   │
│  │         │ │         │ │         │   │
│  │ "The    │ │ "A      │ │ "I will │   │
│  │ unexam- │ │ house   │ │ not be  │   │
│  │ ined    │ │ divided │ │ triumph-│   │
│  │ life is │ │ against │ │ ed      │   │
│  │ not..." │ │ ..."    │ │ over."  │   │
│  │         │ │         │ │         │   │
│  │ [SELECT]│ │ [SELECT]│ │ [SELECT]│   │
│  └─────────┘ └─────────┘ └─────────┘   │
│                                         │
│  ← Swipe for more guides →              │
│                                         │
└─────────────────────────────────────────┘
```

## Guide Intro Video Requirements

Each guide should have:
1. **Selection Preview** (5-15 seconds): Quick intro clip for guide selection
2. **Welcome Video** (15-30 seconds): Full welcome after selection
3. **Celebration Video** (5-10 seconds): Plays on major achievements

### Video Style Guide
- **Socrates**: Marble columns, Athens Agora, philosophical mood
- **Lincoln**: Log cabin, Civil War era, presidential gravitas
- **Cleopatra**: Egyptian temples, gold, Nile imagery
- **Da Vinci**: Renaissance workshop, inventions, Mona Lisa backdrop
- **Sun Tzu**: Chinese landscapes, ancient military formations
- **Curie**: Laboratory, glowing radium, scientific equipment
- **Tubman**: Underground Railroad imagery, North Star, freedom themes
- **Elizabeth I**: Tudor palace, royal court, powerful queen imagery

---

# 10. GAMIFICATION SYSTEMS

## XP & Ranks

### Rank Progression (17 Tiers)

| Rank | Tier | Min XP | Icon |
|------|------|--------|------|
| Time Tourist | Bronze | 0 | 🎫 |
| Archive Apprentice | Bronze | 300 | 📚 |
| Fact Finder | Bronze | 600 | 🔍 |
| Chronicle Cadet | Silver | 1,200 | 📜 |
| Era Explorer | Silver | 2,000 | 🧭 |
| Timeline Tracker | Silver | 3,500 | ⏳ |
| Historical Detective | Gold | 5,000 | 🕵️ |
| Myth Breaker | Gold | 7,000 | 💡 |
| Primary Source Specialist | Gold | 10,000 | 📰 |
| Master of Eras | Platinum | 15,000 | 🏛️ |
| Archive Architect | Platinum | 20,000 | 🗂️ |
| Cultural Cartographer | Platinum | 25,000 | 🗺️ |
| Historian | Diamond | 30,000 | 🎓 |
| Distinguished Historian | Diamond | 40,000 | ⭐ |
| Grand Historian | Diamond | 55,000 | 👑 |
| Legendary Historian | Legendary | 70,000 | 🏆 |
| Rhodes Scholar | Legendary | 100,000 | 🎖️ |

## Streak System

- **Daily streak**: Consecutive days of activity
- **Visual**: Fire icon 🔥 with number
- **Bonuses**:
  - 3+ streak: +5 XP per correct answer
  - 5+ streak: +10 XP per correct answer
  - 10+ streak: +25 XP per correct answer

## Badge Categories

### Progress Badges
| Badge | Condition | Rarity |
|-------|-----------|--------|
| First Steps | Complete 1 chapter | Common |
| Era Explorer | Complete 1 arc | Uncommon |
| Chapter Collector | Complete 10 chapters | Uncommon |
| Chapter Master | Complete 25 chapters | Rare |
| Arc Conqueror | Complete 3 arcs | Rare |
| History Scholar | Complete 5 arcs | Epic |

### Performance Badges
| Badge | Condition | Rarity |
|-------|-----------|--------|
| Perfectionist | 1 perfect score | Common |
| Flawless Five | 5 perfect scores | Uncommon |
| Accuracy Ace | 90%+ over 20 quizzes | Rare |
| Sharp Shooter | 95%+ over 50 quizzes | Epic |
| Boss Slayer | Defeat 1 boss | Uncommon |
| Boss Hunter | Defeat 5 bosses | Rare |

### Engagement Badges
| Badge | Condition | Rarity |
|-------|-----------|--------|
| Streak Starter | 3-day streak | Common |
| Week Warrior | 7-day streak | Uncommon |
| Fortnight Fighter | 14-day streak | Rare |
| Monthly Master | 30-day streak | Epic |
| Century Champion | 100-day streak | Legendary |

---

# 11. CONTENT EXAMPLES

## World War II Arc - Chapter 1: "The War Begins"

| Node | Type | Title | XP | Duration |
|------|------|-------|-----|----------|
| 1 | video-lesson | Storm Clouds Over Europe | 80 | 60s |
| 2 | image-explore | Map of the Invasion | 60 | 45s |
| 3 | two-truths | War Myths | 60 | 40s |
| 4 | found-tape | Chamberlain's Declaration | 40 | 75s |
| 5 | headlines | The London Times | 60 | 60s |
| 6 | chrono-order | Timeline of Invasion | 60 | 45s |
| 7 | video-lesson | The Miracle at Dunkirk | 80 | 60s |
| 8 | decision | Operation Dynamo | 60 | 50s |
| 9 | quiz-mix | Test Your Knowledge | 100 | 90s |
| 10 | boss | Chapter Boss | 150 | 90s |

**Total: 690 XP, ~10 minutes**

## French Revolution Arc - Chapter 1: "Before the Storm"

| Node | Type | Title | Content Summary |
|------|------|-------|-----------------|
| 1 | two-truths | Royal Myths | Marie Antoinette "cake" myth |
| 2 | found-tape | Voices from Versailles | Servant's account of palace life |
| 3 | headlines | Paris Gazette | Bread prices, Estates-General |
| 4 | quiz-mix | Test Your Knowledge | Financial crisis, Three Estates |
| 5 | decision | Tennis Court Oath | Disperse vs. take the oath |
| 6 | boss | Chapter Boss | Pre-revolution knowledge |

---

# 12. MEDIA ASSET REQUIREMENTS

## Video Assets Needed

### Spirit Guide Videos
| Guide | Type | Duration | Description |
|-------|------|----------|-------------|
| Socrates | intro | 5-15s | Athens setting, philosophical pose |
| Socrates | welcome | 15-30s | Full intro speech |
| Socrates | celebration | 5-10s | Congratulatory moment |
| Lincoln | intro | 5-15s | Log cabin or White House |
| Lincoln | welcome | 15-30s | Leadership speech |
| ... | ... | ... | (Same for all 8 guides) |

### Journey Videos
| Arc | Video | Duration | Description |
|-----|-------|----------|-------------|
| WW2 | Storm Clouds Over Europe | 45-60s | Europe map, Hitler speeches, invasion prep |
| WW2 | Miracle at Dunkirk | 45-60s | Beach evacuation, Little Ships |
| WW2 | Pearl Harbor | 30-45s | Japanese attack, FDR speech |
| WW2 | D-Day | 45-60s | Normandy landing footage |
| French Rev | Fall of the Bastille | 45-60s | Paris mob, storming the prison |
| French Rev | Reign of Terror | 30-45s | Guillotine, revolutionary courts |

### Video Style Guidelines
- **Resolution**: 1080p minimum (4K preferred)
- **Aspect**: 16:9 (will be letterboxed on mobile)
- **Audio**: Clear narration OR dramatic music
- **Subtitles**: Built-in or provided as VTT
- **Mood**: Documentary style, dramatic, educational

## Image Assets Needed

### Map Images (for Image Explore nodes)
| Map | Hotspots | Description |
|-----|----------|-------------|
| Poland Invasion 1939 | 4 | Army Group North, Army Group South, Soviet invasion, Warsaw |
| D-Day Landing Beaches | 5 | Utah, Omaha, Gold, Juno, Sword |
| Roman Empire at Peak | 6 | Major provinces and cities |
| French Revolution Paris | 5 | Bastille, Versailles, Tuileries, etc. |

### Historical Photos
| Photo | Usage | Description |
|-------|-------|-------------|
| Chamberlain at BBC | Headlines node | PM at microphone |
| Dunkirk beach crowds | Image explore | Soldiers waiting on beach |
| Little Ships | Video/Image | Civilian boats sailing |
| Nazi-Soviet Pact signing | Two Truths | Molotov and Ribbentrop |
| Warsaw ruins | Headlines | Bombed city |

### Image Style Guidelines
- **Resolution**: 1200x800 minimum
- **Format**: WebP or high-quality JPG
- **Rights**: Public domain, Creative Commons, or licensed
- **Processing**: Can be colorized, enhanced, or stylized

## Audio Assets Needed

### Primary Source Recordings
| Audio | Duration | Description |
|-------|----------|-------------|
| Chamberlain Declaration | 30s | "This country is at war with Germany" |
| Churchill "Fight on Beaches" | 30s | Dunkirk speech excerpt |
| FDR Pearl Harbor | 30s | "Day which will live in infamy" |
| Eisenhower D-Day Order | 30s | "You are about to embark" |

### Audio Style Guidelines
- **Format**: MP3 or AAC
- **Quality**: Clear, broadcast quality
- **Style**: Can be original recordings OR dramatic recreations
- **Length**: 20-45 seconds typically

---

# 13. ASCII SCREEN LAYOUTS

## Complete Mobile Layouts

### Home Tab
```
┌─────────────────────────────────────────┐
│ 44px Status Bar                         │
├─────────────────────────────────────────┤
│ [👑 Guide]     History Bytes    🔥12 XP │
├─────────────────────────────────────────┤
│                                         │
│  Good evening, Learner!                 │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🎲 LUCKY DICE                  │   │
│  │  Tap to discover a random node  │   │
│  │  from your journeys!            │   │
│  │           [ROLL]                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  📅 THIS DAY IN HISTORY                 │
│  ┌─────────────────────────────────┐   │
│  │  February 26, 1815              │   │
│  │  Napoleon escapes from Elba     │   │
│  │  [READ MORE]                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  QUICK TOPICS                           │
│  [🏛️ Rome] [🇫🇷 France] [🪖 WW2]      │
│                                         │
│  🧩 DAILY PUZZLE                        │
│  ┌─────────────────────────────────┐   │
│  │  What year was it?              │   │
│  │  ● ● ● ●                        │   │
│  │  [PLAY NOW]                     │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│  🏠    🗺️    📚    🎮    📺    👤     │
│  ━━━                                    │
└─────────────────────────────────────────┘
```

### Node Transition Screen
```
┌─────────────────────────────────────────┐
│                                         │
│         ✓ NODE COMPLETE!                │
│                                         │
│           +80 XP                        │
│         🔥 5 STREAK (+10 bonus)         │
│                                         │
│  CHAPTER PROGRESS                       │
│                                         │
│    ●───●───●───○───○───○───○           │
│    1   2   3   4   5   6   7           │
│              ↑                          │
│          You are here                   │
│                                         │
│  SESSION STATS                          │
│  ┌─────────────────────────────────┐   │
│  │  Questions: 8/10 correct (80%)  │   │
│  │  XP Earned: 240 XP              │   │
│  │  Time: 4:32                     │   │
│  │  Streak: 🔥 5                   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  NEXT UP:                               │
│  ┌─────────────────────────────────┐   │
│  │  🎧 Found Tape                  │   │
│  │  "Chamberlain's Declaration"    │   │
│  │  40 XP Available                │   │
│  └─────────────────────────────────┘   │
│                                         │
│       [    CONTINUE    ]                │
│                                         │
└─────────────────────────────────────────┘
```

### Chapter Complete Screen
```
┌─────────────────────────────────────────┐
│                                         │
│                🎉                       │
│        CHAPTER COMPLETE!                │
│                                         │
│      "The War Begins"                   │
│                                         │
│           ⭐ ⭐ ⭐                       │
│                                         │
│  ┌───────────┐ ┌───────────┐           │
│  │  ⚡ 690   │ │  🎯 92%   │           │
│  │  XP Earned│ │  Accuracy │           │
│  └───────────┘ └───────────┘           │
│                                         │
│  ┌───────────┐ ┌───────────┐           │
│  │  ⏱️ 8:45  │ │  💎 7/10  │           │
│  │  Time     │ │  Perfect  │           │
│  └───────────┘ └───────────┘           │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  "Outstanding! You've mastered  │   │
│  │   this chapter!"                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📖 Review Your Mistakes (2)    │   │
│  │                          ▼      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌──────────┐ ┌────────────────────┐   │
│  │  🏠 Home │ │  Next Chapter →    │   │
│  └──────────┘ └────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Wrong Answer Screen
```
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ❌ Not quite!                  │   │
│  │                                 │   │
│  │  Your answer:                   │   │
│  │  "Germany invaded France"       │   │
│  │                                 │   │
│  │  Correct answer:                │   │
│  │  "Germany invaded Poland"       │   │
│  │                                 │   │
│  │  ─────────────────────────────  │   │
│  │                                 │   │
│  │  📚 LEARN MORE:                 │   │
│  │                                 │   │
│  │  Britain declared war on        │   │
│  │  Germany on September 3, 1939,  │   │
│  │  two days after Germany         │   │
│  │  invaded Poland. France         │   │
│  │  wasn't invaded until May 1940. │   │
│  │                                 │   │
│  │  ┌─────────────────────────┐   │   │
│  │  │  📝 Save to Study Notes │   │   │
│  │  └─────────────────────────┘   │   │
│  └─────────────────────────────────┘   │
│                                         │
│       [    CONTINUE    ]                │
│                                         │
└─────────────────────────────────────────┘
```

### Study Notes (Profile)
```
┌─────────────────────────────────────────┐
│  ←          STUDY NOTES                 │
├─────────────────────────────────────────┤
│                                         │
│  📖 Study Notes                         │
│  3 notes saved                          │
│                                 [Clear] │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🎬 Video Lesson • 2h ago       │   │
│  │                                 │   │
│  │  What triggered Britain's       │   │
│  │  declaration of war?            │   │
│  │                          ▼      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ❌ Your answer:                │   │
│  │  Germany invaded France         │   │
│  │                                 │   │
│  │  ✓ Correct answer:              │   │
│  │  Germany invaded Poland         │   │
│  │                                 │   │
│  │  Britain declared war on        │   │
│  │  September 3, 1939, after       │   │
│  │  Germany invaded Poland...      │   │
│  │                                 │   │
│  │  [🔄 Quiz Me Again] [🗑️]       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📰 Headlines • 1d ago          │   │
│  │  What % was the Third Estate?   │   │
│  │                          ▼      │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### First-Time Tooltip Overlay
```
┌─────────────────────────────────────────┐
│                                         │
│                 🎬                      │
│            VIDEO LESSON                 │
│                                         │
│    "Storm Clouds Over Europe"           │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  💡 TIP                         │   │
│   │                                 │   │
│   │  Videos have a quiz after.      │   │
│   │  Pay attention!                 │   │
│   │                                 │   │
│   │          [GOT IT]               │   │
│   └─────────────────────────────────┘   │
│                                         │
│         ⭐ 80 XP Available              │
│                                         │
│                                         │
│       [    BEGIN    ]                   │
│                                         │
└─────────────────────────────────────────┘
```

---

# APPENDIX: QUICK REFERENCE

## Node Type Summary

| Type | Icon | Purpose | Media |
|------|------|---------|-------|
| video-lesson | 🎬 | Watch & learn | Video + Quiz |
| image-explore | 🗺️ | Interactive discovery | Image + Hotspots |
| two-truths | 🎮 | Myth busting | Text |
| found-tape | 🎧 | Primary sources | Audio + Transcript |
| headlines | 📰 | Period reading | Text + Images |
| chrono-order | ⏳ | Timeline ordering | Text/Images |
| quiz-mix | ❓ | Comprehension check | Text |
| decision | 🎯 | Historical choices | Text |
| boss | 👑 | Chapter finale | Timed Quiz |

## Color Quick Reference

```
Background: #0A0A0B (obsidian-900)
Cards: #111214 (obsidian-800)
Gold accent: #C6A24F (gold-primary)
Gold hover: #E8C979 (gold-highlight)
Text: #F5F2EA (ivory)
Success: #10B981 (emerald)
Error: #EF4444 (red)
```

## Font Quick Reference

```
Headers: Cormorant Garamond, serif
Body: Inter, sans-serif
```

---

**Document Version**: 1.0
**Last Updated**: February 2025
**For**: AI Media Generation (Gemini/Veo/Suno)
