function isValid(x, y, dims) {
  // Returns whether the coordinates are valid or not
  return 0 <= x && x < dims && 0 <= y && y < dims;
}

function getValidActions(board) {
  // Returns all valid actions (empty positions) on the board
  let validMoves = [];
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === 0) {
        validMoves.push([i, j]);
      }
    }
  }
  return validMoves;
}

function getEdge(vertex, dim) {
  let [i, j] = vertex;
  const mid = Math.floor(dim / 2);
  if (j === 0 && i > 0 && i < mid) return 0;
  if (i === 0 && j > 0 && j < mid) return 1;
  if (i === 0 && j > mid && j < dim - 1) return 2;
  if (j === dim - 1 && i > 0 && i < mid) return 3;
  if (i > mid && i < dim - 1 && i + j === 3 * mid) return 4;
  if (i > mid && i < dim - 1 && i - j === mid) return 5;
  return -1;
}

function getNeighbours(dim, vertex) {
  let [i, j] = vertex;
  const siz = Math.floor(dim / 2);
  let neighbours = [];
  if (i > 0) neighbours.push([i - 1, j]);
  if (i < dim - 1) neighbours.push([i + 1, j]);
  if (j > 0) neighbours.push([i, j - 1]);
  if (j < dim - 1) neighbours.push([i, j + 1]);
  if (i > 0 && j <= siz && j > 0) neighbours.push([i - 1, j - 1]);
  if (i > 0 && j >= siz && j < dim - 1) neighbours.push([i - 1, j + 1]);
  if (j < siz && i < dim - 1) neighbours.push([i + 1, j + 1]);
  if (j > siz && i < dim - 1) neighbours.push([i + 1, j - 1]);
  return neighbours;
}

// Function to return the corner vertices of the board
function getAllCorners(dim) {
  /**
   * Returns vertices on all the corners of the board
   *
   * Parameters:
   * dim (int): Dimension of the board
   *
   * Returns:
   * List of arrays containing the coordinates of the corner vertices of the board
   */
  return [
    [0, 0],
    [0, Math.floor(dim / 2)],
    [0, dim - 1],
    [Math.floor(dim / 2), dim - 1],
    [dim - 1, Math.floor(dim / 2)],
    [Math.floor(dim / 2), 0],
  ];
}

// Function to return the edge vertices of the board (excluding corners)
function getAllEdges(dim) {
  /**
   * Returns vertices on all the edges of the board
   *
   * Parameters:
   * dim (int): Dimension of the board
   *
   * Returns:
   * List of arrays containing the coordinates of the edge vertices of the board
   */
  const siz = Math.floor((dim + 1) / 2);
  const sides = [
    Array.from({ length: siz - 2 }, (_, i) => [0, i + 1]), // Top-left edge (excluding corners)
    Array.from({ length: dim - siz - 1 }, (_, i) => [0, siz + i]), // Top-right edge (excluding corners)
    Array.from({ length: siz - 2 }, (_, i) => [i + 1, dim - 1]), // Right edge (excluding corners)
    Array.from({ length: siz - 2 }, (_, i) => [siz - 1 + i, dim - 1 - i - 1]), // Bottom-right edge
    Array.from({ length: siz - 2 }, (_, i) => [siz - 1 + i, i + 1]), // Bottom-left edge
    Array.from({ length: siz - 2 }, (_, i) => [i + 1, 0]), // Left edge (excluding corners)
  ];

  return sides;
}

function moveCoordinates(direction, half) {
  /**
   * Returns the coordinates of the move in the given direction.
   * @param {string} direction - The direction to which the move is to be made.
   * @param {number} half - The half of the board from which the move is to be made.
   *  - half = 0 => mid-line
   *  - half < 0 => left half
   *  - half > 0 => right half
   * @returns {Array} - Coordinates of the move in the given direction.
   */
  if (direction === "up") {
    return [-1, 0];
  } else if (direction === "down") {
    return [1, 0];
  } else if (direction === "top-left") {
    if (half === 0 || half < 0) {
      return [-1, -1];
    } else if (half > 0) {
      return [0, -1];
    }
  } else if (direction === "top-right") {
    if (half === 0 || half > 0) {
      return [-1, 1];
    } else if (half < 0) {
      return [0, 1];
    }
  } else if (direction === "bottom-left") {
    if (half === 0 || half < 0) {
      return [0, -1];
    } else if (half > 0) {
      return [1, -1];
    }
  } else if (direction === "bottom-right") {
    if (half === 0 || half > 0) {
      return [0, 1];
    } else if (half < 0) {
      return [1, 1];
    }
  }
  return null;
}

function threeForwardMoves(direction) {
  /**
   * Returns the 3 forward moves from the current direction.
   * @param {string} direction - The direction of the last move.
   * @returns {Array} - List of 3 forward moves from the current direction.
   */
  if (direction === "up") {
    return ["top-left", "up", "top-right"];
  } else if (direction === "down") {
    return ["down", "bottom-left", "bottom-right"];
  } else if (direction === "top-left") {
    return ["bottom-left", "top-left", "up"];
  } else if (direction === "top-right") {
    return ["top-right", "up", "bottom-right"];
  } else if (direction === "bottom-left") {
    return ["bottom-left", "down", "top-left"];
  } else if (direction === "bottom-right") {
    return ["bottom-right", "down", "top-right"];
  }
  return null;
}

function moveInDirection(direction, x, y, dim) {
  /**
   * Moves the given coordinates in the specified direction.
   * @param {string} direction - The direction to move in.
   * @param {number} x - Current x coordinate.
   * @param {number} y - Current y coordinate.
   * @param {number} dim - Dimension of the board.
   * @returns {Array} - New coordinates after the move.
   */
  const half = x < Math.floor(dim / 2) ? -1 : x > Math.floor(dim / 2) ? 1 : 0;
  const [dx, dy] = moveCoordinates(direction, half);
  return [x + dx, y + dy];
}

function bfsReachable(board, start) {
  /*
    Returns the set of reachable points accessible from start, via direct neighbors.

    Parameters:
    - board (Array[Array[bool]]): Game board with true values at the positions of the player and false elsewhere.
    - start (Array[int, int]): Starting point for the BFS.

    Returns:
    - Set: Set of reachable points accessible from start, via direct neighbors.
    */

  const dim = board.length;
  const queue = [start]; // Queue to hold cells to visit
  const visited = new Set(); // Set to hold visited cells
  visited.add(`${start[0]},${start[1]}`); // Mark the start cell as visited

  while (queue.length > 0) {
    const current = queue.shift(); // Dequeue the current cell
    const [x, y] = current;

    // Get neighbors of the current cell
    const neighbors = getNeighbours(dim, [x, y]);

    // Visit each neighbor
    for (const [nx, ny] of neighbors) {
      // Check if the neighbor is valid, not visited, and is part of the player's territory (true)
      if (
        isValid(nx, ny, dim) &&
        !visited.has(`${nx},${ny}`) &&
        board[nx][ny]
      ) {
        queue.push([nx, ny]); // Enqueue the neighbor
        visited.add(`${nx},${ny}`); // Mark the neighbor as visited
      }
    }
  }

  return visited; // Return the set of reachable cells
}

function checkRing(board, move) {
  /*
    Check whether a ring is formed by the move

    Parameters:
    - board (Array[Array[bool]]): Game board with true values at the positions of the player and false elsewhere
    - move (Array[int, int]): Position of the move. Must have already been played (marked on the board)

    Returns:
    - bool: True if a ring is formed by the move, False otherwise
    */

  const dim = board.length; // Get the dimension of the board
  const siz = Math.floor(dim / 2); // Determine the half of the board
  const initMove = move;
  const directions = ["up", "top-left", "bottom-left", "down"];
  const visited = new Set();

  // Get neighbors of the move
  let neighbours = getNeighbours(dim, move);
  neighbours = neighbours.map(([x, y]) => board[x][y]);

  // If less than 2 valid neighbors, return false
  if (neighbours.filter(Boolean).length < 2) {
    return false;
  }

  // Start exploration in 4 contiguous directions
  let exploration = [];
  for (let direction of directions) {
    let [x, y] = move;
    let half = Math.sign(move[1] - siz); // 0 for mid, -1 for left, 1 for right
    const [dx, dy] = moveCoordinates(direction, half);
    const nx = x + dx,
      ny = y + dy;

    if (isValid(nx, ny, dim) && board[nx][ny]) {
      exploration.push([[nx, ny], direction]);
      visited.add(`${nx},${ny},${direction}`);
    }
  }

  let ringLength = 1;
  // Continue exploration in forward directions
  while (exploration.length !== 0) {
    let newExp = [];

    for (const [currentMove, prevDirection] of exploration) {
      let [x, y] = currentMove;
      let half = Math.sign(y - siz);
      const newDirections = threeForwardMoves(prevDirection);

      for (let direction of newDirections) {
        const [dx, dy] = moveCoordinates(direction, half);
        const nx = x + dx,
          ny = y + dy;

        if (
          isValid(nx, ny, dim) &&
          board[nx][ny] &&
          !visited.has(`${nx},${ny},${direction}`)
        ) {
          if (initMove[0] === nx && initMove[1] === ny && ringLength >= 5) {
            return true; // Ring detected
          }
          newExp.push([[nx, ny], direction]);
          visited.add(`${nx},${ny},${direction}`);
        }
      }
    }

    exploration = newExp;
    ringLength += 1;
  }

  return false;
}

function isValid(x, y, dim) {
  return 0 <= x && x < dim && 0 <= y && y < dim;
}

function getCorner(vertex, dim) {
  /**
   * Returns the corner at which the vertex lies
   *
   * @param {Array} vertex - Coordinates of the point whose virtual neighbors are to be found (in the form [i, j])
   * @param {number} dim - Dimension of the board
   *
   * @returns {number} - Number of the corner at which the vertex lies, if it does, else returns -1. Corners are numbered from 0 to 5
   */
  let [i, j] = vertex;

  if (i === 0 && j === 0) {
    return 0;
  }
  if (i === 0 && j === Math.floor(dim / 2)) {
    return 1;
  }
  if (i === 0 && j === dim - 1) {
    return 2;
  }
  if (i === Math.floor(dim / 2) && j === dim - 1) {
    return 3;
  }
  if (i === dim - 1 && j === Math.floor(dim / 2)) {
    return 4;
  }
  if (i === Math.floor(dim / 2) && j === 0) {
    return 5;
  }

  return -1;
}

function checkBridge(board, move) {
  /*
    Check whether a bridge is formed by the move, via direct neighbors.

    Parameters:
    - board (Array[Array[bool]]): Game board with true values at the positions of the player and false elsewhere.
    - move (Array[int, int]): Position of the move. Must have already been played (marked on the board).

    Returns:
    - bool: True if a bridge is formed by the move, False otherwise.
    */

  // Find all reachable points from the move using BFS
  const visited = bfsReachable(board, move);
  const dim = board.length;

  // Get all the corners of the board
  const corners = new Set(getAllCorners(dim).map(([x, y]) => `${x},${y}`));

  // Check how many corners are reachable from the move
  let reachableCorners = 0;
  for (const point of visited) {
    if (corners.has(point)) {
      reachableCorners += 1;
    }
    if (reachableCorners >= 2) {
      return true; // If two or more corners are reachable, a bridge is formed
    }
  }

  return false; // No bridge formed
}

function checkFork(board, move, playerNum) {
  // Run BFS to find all reachable points for the current player
  let visited = bfsReachable(board, move, playerNum);
  let dim = board.length;

  // Get all edges as sets of points (excluding corners)
  let edges = getAllEdges(dim).map(
    (edge) => new Set(edge.map(([x, y]) => `${x},${y}`))
  );

  // Determine reachable edges (only count edges connected by player's path)
  let reachableEdges = edges.filter((edge) =>
    [...visited].some((point) => edge.has(point))
  );

  // A valid fork must connect to at least three distinct edges
  return reachableEdges.length >= 3;
}

function checkForkAndBridge(board, move) {
  /*
    Check whether a fork or a bridge is formed by the move, via direct neighbors.

    Parameters:
    - board (Array[Array[bool]]): Game board with true values at the positions of the player and false elsewhere.
    - move (Array[int, int]): Position of the move. Must have already been played (marked on the board).

    Returns:
    - Tuple[bool, string or null]: True and "fork" or "bridge" if a fork or bridge is formed by the move, otherwise False and null.
    */

  const visited = bfsReachable(board, move);
  const dim = board.length;
  const corners = new Set(getAllCorners(dim).map(([x, y]) => `${x},${y}`));
  const sides = getAllEdges(dim).map(
    (side) => new Set(side.map(([x, y]) => `${x},${y}`))
  );

  // Check for fork
  const reachableEdges = sides.map((side) =>
    sideHasReachablePoints(side, visited)
  );
  if (reachableEdges.filter((edge) => edge).length >= 3) {
    return [true, "fork"];
  }

  // Check for bridge
  const reachableCorners = [...visited].filter((point) =>
    corners.has(point)
  ).length;
  if (reachableCorners >= 2) {
    return [true, "bridge"];
  }

  return [false, null];
}

function sideHasReachablePoints(side, visited) {
  // Check if any points in the side are in the visited set
  for (const point of visited) {
    if (side.has(point)) return true;
  }
  return false;
}

function checkWin(board, move, playerNum, path = null) {
  /*
    Check if the player has won the game by placing a move at the given position.

    Parameters:
    - board (Array[Array[int]]): Game board.
    - move (Array[int, int]): Position of the move. Must have already been played (marked on the board).
    - playerNum (int): ID of the player who made the move.
    - path (Array or null): Optional path to store the winning path.

    Returns:
    - Tuple[bool, string or null]: True and the winning structure ("ring", "fork", or "bridge") if the player wins, otherwise False and null.
    */

  // Convert the board to a boolean array where the player's positions are `true`
  board = board.map((row) => row.map((cell) => cell === playerNum));

  // Check if a ring is formed
  if (checkRing(board, move)) {
    if (path !== null) {
      path.length = 0; // Clear the path
      path.push(...findRing(board, move));
    }
    return [true, "ring"];
  }

  // Check for fork or bridge
  const [win, way] = checkForkAndBridge(board, move);
  if (win) {
    if (way === "fork" && path !== null) {
      path.length = 0; // Clear the path
      path.push(...findFork(board, move));
    } else if (way === "bridge" && path !== null) {
      path.length = 0; // Clear the path
      path.push(...findBridge(board, move));
    }
    return [true, way];
  }

  return [false, null];
}

function checkWin(board, move, playerNum, path = null) {
  /*
    Check if the player has won the game by placing a move at the given position.

    Parameters:
    - board (Array[Array[int]]): Game board.
    - move (Array[int, int]): Position of the move. Must have already been played (marked on the board).
    - playerNum (int): ID of the player who made the move.
    - path (Array or null): Optional path to store the winning path.

    Returns:
    - Tuple[bool, string or null]: True and the winning structure ("ring", "fork", or "bridge") if the player wins, otherwise False and null.
    */

  console.log("Checking win for player:", playerNum, "at move:", move);

  // Convert the board to a boolean array where the player's positions are `true`
  const playerBoard = board.map((row) => row.map((cell) => cell === playerNum));

  // Check if a ring is formed
  if (checkRing(playerBoard, move)) {
    console.log("Ring detected at move:", move);
    if (path !== null) {
      path.length = 0; // Clear the path
      path.push(...findRing(playerBoard, move));
    }
    return [true, "ring"];
  }

  // Check for fork or bridge
  const [win, way] = checkForkAndBridge(playerBoard, move);
  if (win) {
    console.log(way, "detected at move:", move);
    if (way === "fork" && path !== null) {
      path.length = 0; // Clear the path
      path.push(...findFork(playerBoard, move));
    } else if (way === "bridge" && path !== null) {
      path.length = 0; // Clear the path
      path.push(...findBridge(playerBoard, move));
    }
    return [true, way];
  }

  console.log("No win detected for player:", playerNum);
  return [false, null];
}
