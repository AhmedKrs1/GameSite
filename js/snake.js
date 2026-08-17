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
let gamespeed = 150; // Inital speed of the snake

ctx.fillStyle = 'lime';
ctx.fillRect(100, 100, 20, 20);

let direction = { x: 1, y: 0 }; // moving right

let gameOver = false;
let gameLoopInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  startButton.addEventListener('click', () => {
    if(gameLoopInterval!=null){
        clearInterval(gameLoopInterval); // Stop the game loop if it's already running
    }
    resetGame(); // Reset the game state before starting
    score = 0;
    scoreEl.textContent = score;
    
    direction = { x: 1, y: 0 };
    gameOver = false;
    spawnFood();
    gameLoopInterval = setInterval(gameLoop, 150); // Start the game loop immediately after clicking start
  });
});
document.addEventListener('DOMContentLoaded', () => {
  restartButton.addEventListener('click', () => {
     if (gameLoopInterval != null) clearInterval(gameLoopInterval); gameLoopInterval = null; // Stop the game loop if it's already runnin
    resetGame();
    gameOver = true;
    draw(); // Draw the initial state of the game after resetting
    
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
    gameOver = true;
   
   spawnFood();
  
} 

function move() {
    const head = snake[0];
    const newHead = {x: head.x + direction.x, y: head.y + direction.y};
    if (checkWallCollision(newHead) || checkSelfCollision(newHead)) {
        gameOver = true;
        alert('Game Over!');
        resetGame();
        clearInterval(gameLoopInterval); // Stop the game loops
        return;
    }
    
    snake.unshift(newHead);
    if(newHead.x === food.x && newHead.y === food.y) {
        score++;
        scoreEl.textContent = score;
        spawnFood();
        // Increase speed of the snake as it eats food, but not below a certain threshold
        gamespeed = Math.max(gamespeed -7, 50)
        clearInterval(gameLoopInterval)
        gameLoopInterval = setInterval(gameLoop, gamespeed)

    } else {
        snake.pop(); // remove the tail
    }
     
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'lime';

  for( const segment of snake) {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
  }

  ctx.fillStyle = 'red';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function gameLoop() {
    if (gameOver) {return;}
  move();
  draw();
}


