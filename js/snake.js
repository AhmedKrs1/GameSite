const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20; // each cell is 20x20 pixels

let snake = [
  { x: 5, y: 5 },
  { x: 4, y: 5 },
  { x: 3, y: 5 }
];
ctx.fillStyle = 'lime';
ctx.fillRect(100, 100, 20, 20);

let direction = { x: 1, y: 0 }; // moving right

let gameOver = false;

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

function move() {
    const head = snake[0];
    const newHead = {x: head.x + direction.x, y: head.y + direction.y};
    if (checkWallCollision(newHead) || checkSelfCollision(newHead)) {
        gameOver = true;
        alert('Game Over!');
        return;
    }
    snake.unshift(newHead);
    snake.pop(); // remove the tail
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'lime';

  for( const segment of snake) {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
  }
}

function gameLoop() {
    if (gameOver) {return;}
  move();
  draw();
}



setInterval(gameLoop, 150);

