const canvas = document.getElementById('gameCanvas');
const scoreEl = document.getElementById('score');
const ctx = canvas.getContext('2d');
const gridSize = 20; // each cell is 20x20 pixels
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

let score = 0;
let snake = [
  { x: 5, y: 5 },
  { x: 4, y: 5 },
  { x: 3, y: 5 }
];

let food = { x: 10, y: 10 };
let gamespeed = 150; // initial speed of the snake

let direction = { x: 1, y: 0 }; // moving right

let gameOver = false;
let gameLoopInterval = null;


// stays in sync with the page's color palette
const SNAKE_HEAD_COLOR = '#00C2A8';    // --teal
const SNAKE_BODY_COLOR_A = '#0aa08c';  // slightly darker teal
const SNAKE_BODY_COLOR_B = '#067563';  // darker still, for the banding effect
const SNAKE_OUTLINE_COLOR = '#1B1B2F'; // --bg
const FOOD_COLOR = '#E0674B';          // --coral

document.addEventListener('DOMContentLoaded', () => {
  startButton.addEventListener('click', () => {
    if (gameLoopInterval != null) {
      clearInterval(gameLoopInterval); // stop the game loop if it's already running
    }
    
    resetGame(); // resets score, snake, direction, speed, and spawns food
    gameOver = false;
    gameLoopInterval = setInterval(gameLoop, gamespeed);
  });

  restartButton.addEventListener('click', () => {
    if (gameLoopInterval != null) {
      clearInterval(gameLoopInterval); // stop the game loop if it's already running
    }
    gameLoopInterval = null;
    resetGame();
    gameOver = true;
    draw(); // draw the initial state of the game after resetting
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' && direction.y === 0) direction = { x: 0, y: -1 };
  else if (e.key === 'ArrowDown' && direction.y === 0) direction = { x: 0, y: 1 };
  else if (e.key === 'ArrowLeft' && direction.x === 0) direction = { x: -1, y: 0 };
  else if (e.key === 'ArrowRight' && direction.x === 0) direction = { x: 1, y: 0 };
});

function checkWallCollision(head) {
  const gridCount = canvas.width / gridSize;
  return head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount;
}

function checkSelfCollision(head) {
  return snake.some(segment => segment.x === head.x && segment.y === head.y);
}

function spawnFood() {
  const gridCount = canvas.width / gridSize;
  const gridCountY = canvas.height / gridSize;

  food = {
    x: Math.floor(Math.random() * gridCount),
    y: Math.floor(Math.random() * gridCountY)
  };
}

function resetGame() {
  score = 0;
  scoreEl.textContent = score;
  snake = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 }
  ];
  direction = { x: 1, y: 0 };
  gamespeed = 150; // back to starting speed, so speed doesn't carry over between games
  spawnFood();
}

function move() {
  const head = snake[0];
  const newHead = { x: head.x + direction.x, y: head.y + direction.y };

  if (checkWallCollision(newHead) || checkSelfCollision(newHead)) {
    gameOver = true;
    clearInterval(gameLoopInterval); // stop the loop before the blocking alert

    const finalScore = score;

    recordGamePlay('snake', 0, finalScore); // record the game play with both moves and score
    alert(`Game Over!, score: ${finalScore}`);
    
    resetGame();
    draw();
    return;
  }

  snake.unshift(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    score++;
    scoreEl.textContent = score;
    spawnFood();
    // increase speed of the snake as it eats food, but not below a certain threshold
    gamespeed = Math.max(gamespeed - 7, 50);
    clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, gamespeed);
  } else {
    snake.pop(); // remove the tail
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // faint grid lines, purely decorative
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  for (let i = 0; i <= canvas.width / gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.stroke();
  }
  for (let j = 0; j <= canvas.height / gridSize; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * gridSize);
    ctx.lineTo(canvas.width, j * gridSize);
    ctx.stroke();
  }

  // snake: rounded circular segments with alternating bands, like a caterpillar
  snake.forEach((segment, index) => {
    const isHead = index === 0;
    const cx = segment.x * gridSize + gridSize / 2;
    const cy = segment.y * gridSize + gridSize / 2;
    const radius = gridSize / 2 - 1;

    // alternate two shades of teal so each segment reads as its own "bump"
    ctx.fillStyle = isHead ? SNAKE_HEAD_COLOR : (index % 2 === 0 ? SNAKE_BODY_COLOR_A : SNAKE_BODY_COLOR_B);
    ctx.strokeStyle = SNAKE_OUTLINE_COLOR; // dark outline separates each segment visually
    ctx.lineWidth = 2;
    ctx.shadowColor = SNAKE_HEAD_COLOR;
    ctx.shadowBlur = isHead ? 14 : 2;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  ctx.shadowBlur = 0;

  // food: glowing coral dot
  const cx = food.x * gridSize + gridSize / 2;
  const cy = food.y * gridSize + gridSize / 2;
  ctx.fillStyle = FOOD_COLOR;
  ctx.shadowColor = FOOD_COLOR;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, gridSize / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function gameLoop() {
  if (gameOver) return;
  move();
  draw();
}

// show the starting board before the player even clicks Start
draw();


