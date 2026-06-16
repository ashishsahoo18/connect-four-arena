# connect-four-arena

# ⬡ Connect Four Arena

A polished, professional Connect Four game built with pure HTML, CSS, and JavaScript — no frameworks, no dependencies.

---

## Project Description

Connect Four Arena is a two-player strategy game where opponents take turns dropping colored discs into a 7-column × 6-row vertical grid. The first player to connect four discs in a row — horizontally, vertically, or diagonally — wins the match. The game features a modern dark UI with glassmorphism cards, smooth animations, persistent scoring, and a match history log.

---

## Features

### Core Gameplay
- 7 × 6 board with click-to-drop column mechanics
- Gravity-based disc placement
- Smooth disc-drop animation per move
- Column hover preview (see where your disc will land)
- Win detection: horizontal, vertical, diagonal (both directions)
- Winning 4 cells highlighted with pulsing glow animation
- Draw detection when all 42 cells are filled
- Winner popup with play-again or change-players options

### Player Experience
- Name entry screen before the match begins
- Turn indicator with colored disc and player name
- Active player score card highlights during their turn
- Score counter for both players
- Score saved in LocalStorage (persists across browser sessions for same player names)
- Match history log (last 20 matches, timestamped)
- Reset Scores button
- New Game button

### Design
- Deep-space dark theme (`#09090f` base)
- Glassmorphism card components (backdrop-blur + transparent borders)
- Electric accent (`#6c63ff` purple)
- Red (`#ff3b5c`) and Yellow (`#ffd93d`) disc colors with matching glows
- Fully responsive for mobile and desktop
- CSS-only animations (no animation libraries)

---

## Technologies Used

| Layer      | Technology           |
|------------|----------------------|
| Structure  | HTML5                |
| Styling    | CSS3 (custom properties, grid, flexbox, animations) |
| Logic      | Vanilla JavaScript (ES6+) |
| Storage    | Web LocalStorage API |
| Fonts      | System UI stack      |
| Libraries  | **None**             |

---

## File Structure

```
connect-four-arena/
├── index.html    ← Markup: setup screen, game screen, result overlay
├── style.css     ← All styling, tokens, animations
├── script.js     ← Game logic, DOM rendering, LocalStorage
└── README.md     ← This file
```

---

## How to Run

No build tools, no npm install, no server required.

1. **Download** or clone the project folder.
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).
3. Enter two player names and click **Start Match**.

> Works fully offline. No internet connection needed after download.

---

## Game Rules

1. Players alternate turns — Red always goes first.
2. Click any column to drop your disc into the lowest available slot.
3. Connect four of your discs in a line (horizontal, vertical, or diagonal) to win.
4. If all 42 cells fill without a winner, the match is a draw.
5. Scores persist across browser sessions when the same player names are used.

---

## Screenshots

> _Add screenshots here after launching the project._

| Setup Screen | Game Board | Win State |
|---|---|---|
| _(screenshot)_ | _(screenshot)_ | _(screenshot)_ |

To take screenshots: open `index.html` in your browser, press `F12 → ...menu → Screenshot` (Chrome DevTools), or use your OS screenshot tool.

---

## Local Storage Behaviour

- **Scores** are saved under key `c4arena_scores` and restored when the same two player names are entered.
- **Match history** is saved under `c4arena_history` and shown on the game screen.
- To fully reset: click **Reset Scores** in-game, or clear site data from browser settings.

---

## Potential Extensions

- AI opponent (minimax algorithm)
- Sound effects on disc drop and win
- Animated confetti on victory
- Online multiplayer via WebSocket
- Dark/Light theme toggle
- Move undo / replay

---

## License

MIT — free to use, modify, and share.