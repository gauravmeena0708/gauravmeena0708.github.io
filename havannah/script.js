let canvas = document.getElementById("gameCanvas");
let context = canvas.getContext("2d");
let layers;
let currentPlayer = 0; // 0 -> Player 1, 1 -> Player 2
let playerTime = [300, 300]; // 5 minutes for each player in seconds
let gameOver = false;
let board;
let intervalId;
let hexSize;
let aiPlayer2 = null; // AI for Player 2
let isPlayer2AI = false; // To check if Player 2 is AI

document.getElementById("startGameBtn").addEventListener("click", startGame);

function startGame() {
  layers = parseInt(document.getElementById("sizeSelect").value);
  adjustCanvasSize(layers); // Adjust canvas size dynamically based on board size
  board = createInitialBoard(layers);
  currentPlayer = 0;
  gameOver = false;
  playerTime = [300, 300];
  document.getElementById("winner").textContent = "";
  document.getElementById("currentTurn").textContent = "Current Turn: Player 1";
  drawBoard(board);
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(updateTimer, 1000); // Update timer every second

  // Determine if Player 2 is AI or human/AI2
  let player2Type = document.getElementById("player2Type").value;
  if (player2Type === "human") {
    aiPlayer2 = null; // Player 2 is human
    isPlayer2AI = false;
  } else if (player2Type === "ai") {
    aiPlayer2 = new AIPlayer(2); // Initialize AI for Player 2
    isPlayer2AI = true;
  } else if (player2Type === "ai2") {
    aiPlayer2 = new AIPlayer2(2); // Initialize AI2 for Player 2
    isPlayer2AI = true;
  }
}

let particles = []; // Array to store sparkles for celebration effect

function adjustCanvasSize(layers) {
  const screenHeight = window.innerHeight; // Get the screen height
  const maxCanvasSize = screenHeight - 100; // Max canvas size should be 200px less than screen height
  const canvasPadding = 10; // Extra padding around the canvas
  hexSize = Math.floor(maxCanvasSize / (3 * layers)); // Dynamically calculate hex size based on layers and max canvas size
  const canvasSize = hexSize * 3 * layers + canvasPadding; // Adjust canvas size dynamically

  canvas.width = canvasSize;
  canvas.height = canvasSize;
}

function createInitialBoard(layers) {
  const board = [];
  for (let i = 0; i < 2 * layers - 1; i++) {
    const row = [];
    for (let j = 0; j < 2 * layers - 1; j++) {
      row.push(0); // 0 represents empty cell
    }
    board.push(row);
  }
  return board;
}

function drawBoard(board) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let j = 0; j < 2 * layers - 1; j++) {
    const colSize = j < layers ? layers + j : layers + 2 * layers - 2 - j;
    for (let i = 0; i < colSize; i++) {
      const hexCoords = calculateHexagon(i, j);
      const color =
        board[i][j] === 1 ? "yellow" : board[i][j] === 2 ? "red" : "white";
      drawHexagon(hexCoords, color, i, j);
    }
  }
  // Draw particles (sparkles)
  drawParticles();
}

function calculateHexagon(i, j) {
  const sqrt3 = Math.sqrt(3);
  const offsetX = (j * hexSize * 3) / 2;
  const offsetY = ((Math.abs(j - layers + 1) + 2 * i) * hexSize * sqrt3) / 2;
  return [
    { x: hexSize / 2 + offsetX, y: offsetY },
    { x: (hexSize * 3) / 2 + offsetX, y: offsetY },
    { x: hexSize * 2 + offsetX, y: (hexSize * sqrt3) / 2 + offsetY },
    { x: (hexSize * 3) / 2 + offsetX, y: hexSize * sqrt3 + offsetY },
    { x: hexSize / 2 + offsetX, y: hexSize * sqrt3 + offsetY },
    { x: offsetX, y: (hexSize * sqrt3) / 2 + offsetY },
  ];
}

function drawHexagon(coords, fillColor, row, col) {
  context.beginPath();
  context.moveTo(coords[0].x, coords[0].y);
  coords.forEach((point) => context.lineTo(point.x, point.y));
  context.closePath();
  context.fillStyle = fillColor || "white";
  context.fill();
  context.stroke();

  const centroid = calculateCentroid(coords);
  context.fillStyle = "black";
  context.font = "12px Arial";
  context.fillText(`(${row},${col})`, centroid.x - 10, centroid.y + 4);
}

function calculateCentroid(coords) {
  let centroidX = 0,
    centroidY = 0;
  coords.forEach((point) => {
    centroidX += point.x;
    centroidY += point.y;
  });
  return { x: centroidX / coords.length, y: centroidY / coords.length };
}

function updateTimer() {
  if (gameOver) return;
  playerTime[currentPlayer]--;
  if (playerTime[currentPlayer] <= 0) {
    gameOver = true;
    document.getElementById("currentTurn").textContent = `Game Over! Player ${
      currentPlayer + 1
    } ran out of time.`;
    clearInterval(intervalId);
    return;
  }
  updatePlayerTime();
}

function updatePlayerTime() {
  const player1Min = Math.floor(playerTime[0] / 60);
  const player1Sec = playerTime[0] % 60;
  const player2Min = Math.floor(playerTime[1] / 60);
  const player2Sec = playerTime[1] % 60;
  document.getElementById("player1Time").textContent = `${player1Min}:${
    player1Sec < 10 ? "0" : ""
  }${player1Sec}`;
  document.getElementById("player2Time").textContent = `${player2Min}:${
    player2Sec < 10 ? "0" : ""
  }${player2Sec}`;
}

canvas.addEventListener("click", (event) => {
  if (gameOver || (currentPlayer === 1 && isPlayer2AI)) return; // Skip human clicks if it's AI's turn

  const x = event.offsetX;
  const y = event.offsetY;

  const [row, col] = getHexagonAtCoords(x, y);
  if (row !== null && col !== null && board[row][col] === 0) {
    makeMove(row, col);
  }
});

function getHexagonAtCoords(x, y) {
  for (let r = 0; r < 2 * layers - 1; r++) {
    for (let c = 0; c < 2 * layers - 1; c++) {
      const hexCoords = calculateHexagon(r, c);
      if (isPointInHexagon(x, y, hexCoords)) {
        return [r, c];
      }
    }
  }
  return [null, null];
}

function isPointInHexagon(x, y, coords) {
  let inside = false;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const xi = coords[i].x,
      yi = coords[i].y;
    const xj = coords[j].x,
      yj = coords[j].y;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function switchPlayer() {
  currentPlayer = 1 - currentPlayer;
  document.getElementById("currentTurn").textContent = `Current Turn: Player ${
    currentPlayer + 1
  }`;
  if (currentPlayer === 1 && isPlayer2AI && !gameOver) {
    handleAITurn(); // AI makes a move
  }
}

function makeMove(row, col) {
  board[row][col] = currentPlayer + 1; // Player 1 is Yellow, Player 2 is Red
  drawBoard(board);

  const [win, structure] = checkWin(board, [row, col], currentPlayer + 1);
  if (win) {
    endGame(currentPlayer + 1, structure);
  } else {
    switchPlayer();
  }
}

function handleAITurn() {
  setTimeout(() => {
    if (aiPlayer2) {
      const aiMove = aiPlayer2.getMove(board); // Use the selected AI for Player 2
      makeMove(aiMove[0], aiMove[1]);
    }
  }, 500); // Slight delay to mimic AI thinking
}

function endGame(winner, structure) {
  gameOver = true;
  const winnerColor = winner === 1 ? "yellow" : "red";
  canvas.style.border = `5px solid ${winnerColor}`; // Change canvas border to winning player's color
  document.getElementById(
    "currentTurn"
  ).textContent = `Game Over! Player ${winner} wins by ${structure}!`;

  // Trigger the celebration (sparkle effect)
  triggerCelebration();
  alert(`Player ${winner} won!!`); // Alert the winner
}

// Sparkle/celebration effect
function triggerCelebration() {
  for (let i = 0; i < 100; i++) {
    // Create 100 particles
    particles.push(createParticle());
  }
  animateParticles();
}

function createParticle() {
  return {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: Math.random() * 4 + 2, // Random radius
    color: `hsl(${Math.random() * 360}, 100%, 50%)`, // Random color
    speedX: Math.random() * 5 - 2.5, // Random speed X
    speedY: Math.random() * 5 - 2.5, // Random speed Y
    life: 100, // Lifespan of the particle
  };
}

function drawParticles() {
  particles.forEach((particle, index) => {
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fillStyle = particle.color;
    context.fill();
    context.closePath();

    // Update particle position and reduce life
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    particle.life--;

    // Remove particle if life is over
    if (particle.life <= 0) {
      particles.splice(index, 1);
    }
  });
}

function animateParticles() {
  if (particles.length > 0) {
    drawBoard(board); // Redraw the board
    requestAnimationFrame(animateParticles);
  }
}
