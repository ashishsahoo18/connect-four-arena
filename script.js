/* ============================================================
   Connect Four Arena — script.js
   Clean, commented game logic. No external libraries.
   ============================================================ */

// ── Constants ───────────────────────────────────────────────
const ROWS = 6;
const COLS = 7;
const EMPTY  = null;
const RED    = 'red';
const YELLOW = 'yellow';

const STORAGE_KEY = 'c4arena_scores';
const HISTORY_KEY = 'c4arena_history';

// ── State ────────────────────────────────────────────────────
let playerNames = { red: 'Player 1', yellow: 'Player 2' };
let scores      = { red: 0, yellow: 0 };
let matchHistory = [];
let board        = [];          // 2D array [row][col] = RED | YELLOW | null
let currentPlayer = RED;
let gameOver      = false;
let matchCount    = 0;          // total matches played this session

// ── DOM refs ─────────────────────────────────────────────────
const setupScreen    = document.getElementById('setup-screen');
const gameScreen     = document.getElementById('game-screen');
const boardEl        = document.getElementById('board');
const colTargetsEl   = document.getElementById('col-targets');
const turnDiscEl     = document.getElementById('turn-disc');
const turnLabelEl    = document.getElementById('turn-label');
const historyListEl  = document.getElementById('history-list');
const resultOverlay  = document.getElementById('result-overlay');
const resultIcon     = document.getElementById('result-icon');
const resultTitle    = document.getElementById('result-title');
const resultBody     = document.getElementById('result-body');
const scoreValP1     = document.getElementById('score-val-p1');
const scoreValP2     = document.getElementById('score-val-p2');
const scoreNameP1    = document.getElementById('score-name-p1');
const scoreNameP2    = document.getElementById('score-name-p2');
const scoreCardP1    = document.getElementById('score-p1');
const scoreCardP2    = document.getElementById('score-p2');

// ── Setup Screen ─────────────────────────────────────────────
document.getElementById('start-btn').addEventListener('click', () => {
  const n1 = document.getElementById('p1-name').value.trim() || 'Player 1';
  const n2 = document.getElementById('p2-name').value.trim() || 'Player 2';
  playerNames.red    = n1;
  playerNames.yellow = n2;

  loadScores();
  updateScoreDisplay();
  loadHistory();
  showScreen('game');
  startNewGame();
});

// Allow Enter key to start
document.getElementById('p2-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('start-btn').click();
});

// ── Screen Switcher ──────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(name + '-screen').classList.add('active');
}

// ── Header Buttons ───────────────────────────────────────────
document.getElementById('new-game-btn').addEventListener('click', () => {
  closeResult();
  startNewGame();
});

document.getElementById('reset-scores-btn').addEventListener('click', () => {
  scores = { red: 0, yellow: 0 };
  saveScores();
  updateScoreDisplay();
});

// Result overlay buttons
document.getElementById('play-again-btn').addEventListener('click', () => {
  closeResult();
  startNewGame();
});

document.getElementById('change-players-btn').addEventListener('click', () => {
  closeResult();
  showScreen('setup');
});

// ── LocalStorage ─────────────────────────────────────────────
function saveScores() {
  // Store scores keyed by player names so they persist across sessions
  const data = { names: playerNames, scores };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadScores() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    // Only restore if same player names
    if (data.names.red === playerNames.red && data.names.yellow === playerNames.yellow) {
      scores = data.scores;
    }
  } catch (e) {
    // Corrupted data — ignore
  }
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(matchHistory));
}

function loadHistory() {
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return;
  try {
    matchHistory = JSON.parse(raw);
    renderHistory();
  } catch (e) {
    matchHistory = [];
  }
}

// ── Score Display ─────────────────────────────────────────────
function updateScoreDisplay() {
  scoreNameP1.textContent = playerNames.red;
  scoreNameP2.textContent = playerNames.yellow;
  scoreValP1.textContent  = scores.red;
  scoreValP2.textContent  = scores.yellow;
}

// Highlight the active player's score card
function updateActiveCard() {
  scoreCardP1.classList.toggle('active-card', currentPlayer === RED);
  scoreCardP2.classList.toggle('active-card', currentPlayer === YELLOW);
}

// ── Turn Indicator ────────────────────────────────────────────
function updateTurnIndicator() {
  turnDiscEl.className = 'turn-disc ' + currentPlayer;
  turnLabelEl.textContent = playerNames[currentPlayer] + "'s turn";
}

// ── Game Init ─────────────────────────────────────────────────
function startNewGame() {
  // Reset board data
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
  currentPlayer = RED;  // Red always starts
  gameOver = false;

  buildBoard();
  buildColTargets();
  updateTurnIndicator();
  updateActiveCard();
}

// ── Build DOM Board ───────────────────────────────────────────
function buildBoard() {
  boardEl.innerHTML = '';
  // Rows go top-to-bottom visually, but row 0 is the BOTTOM in our data array.
  // We render visual row 0 (top) = data row (ROWS-1) so gravity works naturally.
  for (let vRow = 0; vRow < ROWS; vRow++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.vrow = vRow;   // visual row (0 = top)
      cell.dataset.col  = col;
      boardEl.appendChild(cell);
    }
  }
}

// Build invisible column click zones that span full column height
function buildColTargets() {
  colTargetsEl.innerHTML = '';
  for (let col = 0; col < COLS; col++) {
    const div = document.createElement('div');
    div.classList.add('col-target');
    div.dataset.col = col;

    // Click — drop a disc
    div.addEventListener('click', () => handleColumnClick(col));

    // Hover — show preview in top cell of column
    div.addEventListener('mouseenter', () => showPreview(col));
    div.addEventListener('mouseleave', clearPreview);

    colTargetsEl.appendChild(div);
  }
}

// ── Column Click ──────────────────────────────────────────────
function handleColumnClick(col) {
  if (gameOver) return;

  // Find the lowest empty row in this column
  const row = getAvailableRow(col);
  if (row === -1) return;  // Column full

  clearPreview();

  // Place disc in data board
  board[row][col] = currentPlayer;

  // Animate and render disc
  renderDisc(row, col, currentPlayer, true);

  // Check for win or draw
  const winCells = checkWin(row, col, currentPlayer);
  if (winCells) {
    handleWin(winCells);
    return;
  }

  if (checkDraw()) {
    handleDraw();
    return;
  }

  // Switch player
  currentPlayer = currentPlayer === RED ? YELLOW : RED;
  updateTurnIndicator();
  updateActiveCard();
}

// Returns the lowest available row index for a column (-1 if full).
// Row 0 is the BOTTOM of our data array (gravity fills from bottom).
function getAvailableRow(col) {
  for (let row = 0; row < ROWS; row++) {
    if (board[row][col] === EMPTY) return row;
  }
  return -1;
}

// ── Render a Disc ─────────────────────────────────────────────
// Data row 0 = visual bottom row (vRow = ROWS - 1)
function dataRowToVisual(row) {
  return ROWS - 1 - row;
}

function getCellEl(dataRow, col) {
  const vRow = dataRowToVisual(dataRow);
  return boardEl.querySelector(`.cell[data-vrow="${vRow}"][data-col="${col}"]`);
}

function renderDisc(dataRow, col, color, animate) {
  const cell = getCellEl(dataRow, col);
  if (!cell) return;
  cell.className = 'cell ' + color;  // set color class
  if (animate) {
    cell.classList.add('dropping');
    cell.addEventListener('animationend', () => cell.classList.remove('dropping'), { once: true });
  }
}

// ── Column Preview (hover effect) ────────────────────────────
function showPreview(col) {
  if (gameOver) return;
  const row = getAvailableRow(col);
  if (row === -1) return;  // Full column — no preview

  // Show a dim disc in the topmost filled position for this column
  const topVisualRow = dataRowToVisual(row);
  const cell = boardEl.querySelector(`.cell[data-vrow="${topVisualRow}"][data-col="${col}"]`);
  if (cell && !cell.classList.contains(RED) && !cell.classList.contains(YELLOW)) {
    cell.classList.add('preview', currentPlayer);
  }
}

function clearPreview() {
  boardEl.querySelectorAll('.preview').forEach(c => {
    c.classList.remove('preview', RED, YELLOW);
  });
}

// ── Win Detection ─────────────────────────────────────────────
// Returns array of {row, col} winning cells, or null if no win.
function checkWin(lastRow, lastCol, color) {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal ↘
    [1, -1],  // diagonal ↙
  ];

  for (const [dr, dc] of directions) {
    // Collect all consecutive cells of this color in both directions
    const line = [{ row: lastRow, col: lastCol }];

    for (const sign of [1, -1]) {
      let r = lastRow + dr * sign;
      let c = lastCol + dc * sign;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === color) {
        line.push({ row: r, col: c });
        r += dr * sign;
        c += dc * sign;
      }
    }

    if (line.length >= 4) return line.slice(0, 4);  // Return exactly 4 winning cells
  }

  return null;  // No win
}

// Returns true if all cells are filled (draw)
function checkDraw() {
  return board[ROWS - 1].every(cell => cell !== EMPTY);  // Top row is full
}

// ── Handle Win ────────────────────────────────────────────────
function handleWin(winCells) {
  gameOver = true;

  // Highlight the 4 winning cells
  winCells.forEach(({ row, col }) => {
    const cell = getCellEl(row, col);
    if (cell) cell.classList.add('win');
  });

  // Update score
  scores[currentPlayer]++;
  saveScores();
  updateScoreDisplay();

  // Log match
  addMatchToHistory(currentPlayer, false);

  // Show popup after brief pause (let animation play)
  setTimeout(() => {
    showResult(
      '🏆',
      playerNames[currentPlayer] + ' wins!',
      `Dropped the winning disc. ${playerNames[currentPlayer]} takes the round.`
    );
  }, 600);
}

// ── Handle Draw ───────────────────────────────────────────────
function handleDraw() {
  gameOver = true;
  addMatchToHistory(null, true);
  setTimeout(() => {
    showResult('🤝', "It's a draw!", 'All 42 discs placed. No winner this round.');
  }, 400);
}

// ── Result Popup ──────────────────────────────────────────────
function showResult(icon, title, body) {
  resultIcon.textContent   = icon;
  resultTitle.textContent  = title;
  resultBody.textContent   = body;
  resultOverlay.classList.remove('hidden');
}

function closeResult() {
  resultOverlay.classList.add('hidden');
}

// ── Match History ─────────────────────────────────────────────
function addMatchToHistory(winner, isDraw) {
  matchCount++;
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  matchHistory.unshift({
    num:    matchCount,
    winner: isDraw ? null : winner,
    name:   isDraw ? 'Draw' : playerNames[winner],
    time,
  });

  // Keep only last 20 entries
  if (matchHistory.length > 20) matchHistory.pop();

  saveHistory();
  renderHistory();
}

function renderHistory() {
  historyListEl.innerHTML = '';

  if (matchHistory.length === 0) {
    historyListEl.innerHTML = '<li class="history-empty">No matches played yet.</li>';
    return;
  }

  matchHistory.forEach((entry, i) => {
    const li = document.createElement('li');
    li.className = 'history-item';

    const colorClass = entry.winner ? entry.winner : 'draw';
    const label      = entry.winner ? `${entry.name} wins` : 'Draw';
    const badge      = entry.winner ? (entry.winner === RED ? '🔴' : '🟡') : '🤝';

    li.innerHTML = `
      <span class="match-num">#${entry.num}</span>
      <span class="match-winner ${colorClass}">${badge} ${label}</span>
      <span class="match-time">${entry.time}</span>
    `;

    historyListEl.appendChild(li);
  });
}

// ── Boot ──────────────────────────────────────────────────────
// Focus first input on load
document.getElementById('p1-name').focus();