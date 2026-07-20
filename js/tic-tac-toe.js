/**
 * ============================================================
 *  Tic-Tac-Toe Game Logic
 * ============================================================
 *
 * This script controls a 3x3 tic-tac-toe game in the browser.
 * It expects the following HTML structure (already in your page):
 *
 *   <p id="status">X's turn</p>
 *   <div class="ttt-board" id="board">
 *     <div class="ttt-cell" data-i="0">c0</div>
 *     ... (9 cells total, data-i = 0 through 8)
 *   </div>
 *   <button id="reset-btn">New Game</button>
 *   <span id="score-x">0</span>
 *   <span id="score-d">0</span>
 *   <span id="score-o">0</span>
 *
 * HOW THE BOARD IS REPRESENTED
 * -----------------------------
 * The 3x3 grid is stored internally as a flat array of length 9.
 * Each index maps to a cell on screen like this:
 *
 *      0 | 1 | 2
 *      ---------
 *      3 | 4 | 5
 *      ---------
 *      6 | 7 | 8
 *
 * Each array slot holds: null (empty), "X", or "O".
 *
 * WHAT THIS FILE DOES
 * --------------------
 * 1. Tracks whose turn it is (X or O).
 * 2. Handles clicks on cells: fills them in, checks for a winner.
 * 3. Highlights the winning 3 cells when someone wins.
 * 4. Updates the running scoreboard (X wins / O wins / Draws).
 * 5. Lets the player start a New Game without losing the scores.
 *
 * CSS HOOKS (classes this script adds/removes)
 * ----------------------------------------------
 *   .taken    -> added to a cell once it has been played (disables further clicks/hover)
 *   .x-mark   -> added when a cell contains "X" (styled pink)
 *   .o-mark   -> added when a cell contains "O" (styled teal)
 *   .win      -> added to the 3 winning cells (styled gold + pop animation)
 * ============================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  // ---- Grab references to the DOM elements we need ----
  const boardEl = document.getElementById("board");
  const cellEls = Array.from(boardEl.querySelectorAll(".ttt-cell"));
  const statusEl = document.getElementById("status");
  const resetBtn = document.getElementById("reset-btn");
  const scoreResetBtn = document.getElementById("score-reset-btn");

  const scoreXEl = document.getElementById("score-x");
  const scoreDEl = document.getElementById("score-d");
  const scoreOEl = document.getElementById("score-o");

  // ---- All possible winning lines, by cell index ----
  // Each inner array is a set of 3 indices that form a win.
  const WIN_LINES = [
    [0, 1, 2], // top row
    [3, 4, 5], // middle row
    [6, 7, 8], // bottom row
    [0, 3, 6], // left column
    [1, 4, 7], // middle column
    [2, 5, 8], // right column
    [0, 4, 8], // diagonal \
    [2, 4, 6], // diagonal /
  ];

  // ---- Game state ----
  let board = Array(9).fill(null); // the 9 cells: null | "X" | "O"
  let currentPlayer = "X";         // whose turn it is
  let gameOver = false;            // true once someone has won or it's a draw

  // Scores persist across "continue" clicks 
  let scores = { X: 0, O: 0, draws: 0 };

  /**
   * Renders the current `board` state and `currentPlayer`
   * onto the page. Called after every move and on reset.
   */
  function render() {
    cellEls.forEach((cell, i) => {
      const value = board[i];

      // Reset classes, then re-apply based on current value
      cell.classList.remove("x-mark", "o-mark", "taken");
      cell.textContent = value || "";

      if (value === "X") {
        cell.classList.add("x-mark", "taken");
      } else if (value === "O") {
        cell.classList.add("o-mark", "taken");
      }
    });

    if (!gameOver) {
      statusEl.textContent = `${currentPlayer}'s turn`;
    }
  }

  /**
   * Checks the board for a winner.
   * @returns {Object|null} { winner: "X"|"O", line: [a,b,c] } or null if no winner yet.
   */
  function getWinner() {
    for (const line of WIN_LINES) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line };
      }
    }
    return null;
  }

  /** @returns {boolean} true if every cell is filled (and no winner) */
  function isBoardFull() {
    return board.every((cell) => cell !== null);
  }

  /**
   * Highlights the winning cells by adding the .win class,
   * which triggers the gold background + pop animation in CSS.
   */
  function highlightWin(line) {
    line.forEach((i) => cellEls[i].classList.add("win"));
  }

  /** Updates the scoreboard numbers in the DOM from the `scores` object. */
  function renderScores() {
    scoreXEl.textContent = scores.X;
    scoreOEl.textContent = scores.O;
    scoreDEl.textContent = scores.draws;
  }
  // Record the number of game plays in the database
  async function recordGamePlay(gameName) {
    try {
      const response = await fetch(`/api/games/${gameName}/played`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Error recording game play:', err);
    }
  } 

  /**
   * Handles a click on a single cell.
   * Ignores the click if the game is over or the cell is already taken.
   */
  function handleCellClick(event) {
    const cell = event.currentTarget;
    const index = Number(cell.dataset.i);

    if (gameOver || board[index] !== null) {
      return; // ignore clicks on filled cells or after game has ended
    }

    // Place the current player's mark
    board[index] = currentPlayer;
    render();

    // Check for a win
    const result = getWinner();
    if (result) {
      gameOver = true;
      highlightWin(result.line);
      statusEl.textContent = `${result.winner} wins! 🎉`;
      scores[result.winner] += 1;
      renderScores();
      recordGamePlay('tic-tac-toe'); // Record the game play in the database
      return;
    }

    // Check for a draw (board full, no winner)
    if (isBoardFull()) {
      gameOver = true;
      statusEl.textContent = "It's a draw!";
      scores.draws += 1;
      renderScores();
      return;
    }

    // Otherwise, switch turns and keep playing
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    render();
  }

  /**
   * Resets the board for a new round.
   * Scores are NOT reset here — only the board and turn state.
   */
  function newGame() {
    board = Array(9).fill(null);
    currentPlayer = "X";
    gameOver = false;

    cellEls.forEach((cell) => {
      cell.classList.remove("win");
    });

    render();
  }

  /** 
   *  Resets the scores to zero and starts a new game.
   */
  function resetScores() {
    scores = { X: 0, O: 0, draws: 0 };
    renderScores();
    newGame();
  }
   

  // ---- Wire up event listeners ----
  cellEls.forEach((cell) => {
    cell.addEventListener("click", handleCellClick);
  });
  resetBtn.addEventListener("click", newGame);
  scoreResetBtn.addEventListener("click", resetScores);
  


  // ---- Initial render on page load ----
  render();
  renderScores();
});