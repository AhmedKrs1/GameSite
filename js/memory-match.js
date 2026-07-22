document.addEventListener("DOMContentLoaded", () => {
    const boardEl = document.getElementById("memory-board");
    const statusEl = document.getElementById("status");
    const movesEl = document.getElementById("moves-count");
    const pairsEl = document.getElementById("pairs-count");
    const resetBtn = document.getElementById("reset-btn");

    const EMOJIS = ["🍎", "🍌", "🍇", "🍉", "🍓", "🍒"];

    let cards = [];
    let flipped = [];
    let moves = 0;
    let pairsFound = 0;
    let boardLocked = false;

    function createShuffledCards() {
        const doubledEmojis = [...EMOJIS, ...EMOJIS];
        for (let i = doubledEmojis.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // Math.random() returns a float between 0 and 1, multiply by (i + 1) to get a range from 0 to i, then floor it to get an integer index
            [doubledEmojis[i], doubledEmojis[j]] = [doubledEmojis[j], doubledEmojis[i]]; // Swap the elements at indices i and j
        }
        return doubledEmojis.map((emoji, index) => ({ id: index, emoji })); // Create card objects with unique IDs
    }

    // Render the game
    function render() {
    boardEl.innerHTML = ""; // clear and rebuild every time state changes

    cards.forEach((card) => {
      const cardEl = document.createElement("div");
      cardEl.classList.add("memory-card");
      cardEl.dataset.id = card.id;

      const isFaceUp = flipped.includes(card.id) || matched.includes(card.id);

      if (isFaceUp) {
        cardEl.classList.add("flipped");
        cardEl.textContent = card.emoji;
      } else {
        cardEl.textContent = "❓";
      }

      if (matched.includes(card.id)) {
        cardEl.classList.add("matched");
      }

      cardEl.addEventListener("click", () => handleCardClick(card.id));
      boardEl.appendChild(cardEl);
    });
  }

  // Handle card click

  function handleCardClick(id) {
    if (boardLocked) return;
    if (flipped.includes(id) || matched.includes(id)) return; // already up

    flipped.push(id);
    render();

    if (flipped.length === 2) {
      moves++;
      movesEl.textContent = moves;
      boardLocked = true;

      const [firstId, secondId] = flipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard.emoji === secondCard.emoji) {
        matched.push(firstId, secondId);
        flipped = [];
        boardLocked = false;
        pairsEl.textContent = `${matched.length / 2} / 6`;
        render();

        if (matched.length === cards.length) {
          statusEl.textContent = "You found them all! 🎉";
        }
      } else {
        setTimeout(() => {
          flipped = [];
          boardLocked = false;
          render();
        }, 800);
      }
    }
  }

    // Reset the game
    function newGame() {
    cards = createShuffledCards();
    flipped = [];
    matched = [];
    moves = 0;
    boardLocked = false;

    movesEl.textContent = 0;
    pairsEl.textContent = "0 / 6";
    statusEl.textContent = "Find all the pairs!";

    render();
  }

  resetBtn.addEventListener("click", newGame);

  newGame(); // start the first game on page load
});