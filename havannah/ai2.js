class AIPlayer2 {
  constructor(player_number, timer, simulations = 100) {
    this.size = null;
    this.dim = null;
    this.player_number = player_number;
    this.type = "ai2";
    this.player_string = `Player ${player_number}: ai2`;
    this.timer = timer;
    this.opponent_number = player_number === 1 ? 2 : 1;
    this.simulations = simulations;
    this.move_counter = 0;
    this.counter3_adjacent_nodes = null;
  }

  getMove(state) {
    if (this.move_counter > 15) {
      this.simulations = 50;
    }

    if (this.move_counter === 0) {
      this.size = (state.length + 1) / 2;
      this.dim = state.length;
      if (this.size === 6) {
        this.simulations = 70;
      }

      this.init_adjacent_nodes(this.size);
    }

    this.move_counter++;

    let valid_actions = getValidActions(state);

    // Check if there's a winning move for the AI
    for (let action of valid_actions) {
      state[action[0]][action[1]] = this.player_number;
      if (checkWin(state, action, this.player_number)[0]) {
        state[action[0]][action[1]] = 0;
        return [action[0], action[1]];
      }
      state[action[0]][action[1]] = 0;
    }

    // Block opponent's winning move
    for (let action of valid_actions) {
      state[action[0]][action[1]] = this.opponent_number;
      if (checkWin(state, action, this.opponent_number)[0]) {
        state[action[0]][action[1]] = 0;
        return [action[0], action[1]];
      }
      state[action[0]][action[1]] = 0;
    }

    if (this.move_counter <= 3) {
      let openingMove = this.get_opening_moves(state, valid_actions);
      if (openingMove) return [openingMove[0], openingMove[1]];
    }

    // Use a heuristic scoring method to choose the best move
    let best_actions = [];
    let best_score = -Infinity;

    for (let action of valid_actions) {
      state[action[0]][action[1]] = this.player_number;

      let opponent_moves = getValidActions(state);
      let max_opponent_threat_score = this.evaluate_opponent_threat(
        state,
        opponent_moves
      );

      let current_score = this.assign_heuristic_score(state, action);
      if (this.move_counter > 3) {
        current_score += this.run_monte_carlo_simulations(state, action);
      }

      current_score -= max_opponent_threat_score;
      state[action[0]][action[1]] = 0;

      if (current_score > best_score) {
        best_score = current_score;
        best_actions = [action];
      } else if (current_score === best_score) {
        best_actions.push(action);
      }
    }

    let chosen_action =
      best_actions[Math.floor(Math.random() * best_actions.length)];
    return [chosen_action[0], chosen_action[1]];
  }

  init_adjacent_nodes(size) {
    if (size === 6) {
      this.counter3_adjacent_nodes = {
        // (omitting the same size-6 logic for brevity)
      };
    } else {
      // Counter-adjacent nodes for the size 4 board
      this.counter3_adjacent_nodes = {
        "((0, 0), (0, 3))": [
          [0, 1],
          [0, 2],
          [1, 2],
          [1, 1],
        ],
        "((0, 0), (3, 0))": [
          [1, 0],
          [2, 0],
          [2, 1],
          [1, 1],
        ],
        "((0, 3), (3, 3))": [
          [1, 3],
          [2, 3],
          [1, 2],
          [2, 2],
        ],
        "((3, 0), (3, 3))": [
          [3, 1],
          [3, 2],
          [2, 1],
          [2, 2],
        ],
        "((0, 0), (3, 3))": [
          [1, 1],
          [2, 2],
        ],
        "((0, 3), (3, 0))": [
          [1, 2],
          [2, 1],
        ],
      };
    }
  }

  evaluate_opponent_threat(state, opponent_moves) {
    let max_opponent_threat_score = 0;

    for (let move of opponent_moves) {
      state[move[0]][move[1]] = this.opponent_number;

      for (let key of Object.keys(this.counter3_adjacent_nodes)) {
        const corners = key.match(/\((\d+),\s*(\d+)\),\s*\((\d+),\s*(\d+)\)/);
        if (corners) {
          const corner1 = [parseInt(corners[1]), parseInt(corners[2])];
          const corner2 = [parseInt(corners[3]), parseInt(corners[4])];

          if (
            state[corner1[0]][corner1[1]] === this.opponent_number &&
            state[corner2[0]][corner2[1]] === this.opponent_number
          ) {
            let adjacent_moves = this.counter3_adjacent_nodes[key];
            for (let adj of adjacent_moves) {
              if (
                getValidActions(state).some(
                  (action) => action[0] === adj[0] && action[1] === adj[1]
                )
              ) {
                // Assign a high score for strategic blocking positions
                max_opponent_threat_score = Math.max(
                  max_opponent_threat_score,
                  1000 // Increased score for strategic blocks
                );
              }
            }
          }
        }
      }

      state[move[0]][move[1]] = 0;
    }

    return max_opponent_threat_score;
  }

  assign_heuristic_score(state, action) {
    let score = 0;
    let dim = state.length;

    state[action[0]][action[1]] = this.player_number;

    if (getEdge(action, dim) !== -1) score += 5;
    if (getCorner(action, dim) !== -1) score += 10;

    let [win, structure] = checkWin(state, action, this.player_number);
    if (win) {
      if (structure === "fork") score += 200;
      if (structure === "bridge") score += 150;
      if (structure === "ring") score += 200;
    }

    if (this.creates_strategic_connection(state, action, dim)) score += 100;
    if (this.detect_potential_bridge(state, action, dim)) score += 100;

    state[action[0]][action[1]] = 0;
    return score;
  }

  run_monte_carlo_simulations(state, action) {
    let win_count = 0;
    let loss_count = 0;

    for (let i = 0; i < this.simulations; i++) {
      let simulation_state = JSON.parse(JSON.stringify(state)); // Deep copy state
      simulation_state[action[0]][action[1]] = this.player_number;

      let winner = this.simulate_random_game(simulation_state);
      if (winner === this.player_number) win_count++;
      else if (winner === this.opponent_number) loss_count++;
    }

    return (win_count - loss_count) * 10;
  }

  simulate_random_game(state) {
    let current_player = this.opponent_number;
    while (true) {
      let valid_actions = getValidActions(state);
      if (valid_actions.length === 0) return 0; // Draw

      let action =
        valid_actions[Math.floor(Math.random() * valid_actions.length)];
      state[action[0]][action[1]] = current_player;

      let [win] = checkWin(state, action, current_player);
      if (win) return current_player;

      current_player =
        current_player === this.player_number
          ? this.opponent_number
          : this.player_number;
    }
  }

  creates_strategic_connection(state, action, dim) {
    let edges_connected = new Set();
    let neighbors = getNeighbours(dim, action);
    for (let neighbor of neighbors) {
      if (state[neighbor[0]][neighbor[1]] === this.player_number) {
        let edge = getEdge(neighbor, dim);
        if (edge !== -1) edges_connected.add(edge);
      }
    }
    return edges_connected.size > 1;
  }

  detect_potential_bridge(state, action, dim) {
    let edges_connected = new Set();
    let neighbors = getNeighbours(dim, action);
    for (let neighbor of neighbors) {
      if (state[neighbor[0]][neighbor[1]] === this.opponent_number) {
        let edge = getEdge(neighbor, dim);
        if (edge !== -1) edges_connected.add(edge);
      }
    }
    return edges_connected.size > 1;
  }

  get_opening_moves(state, valid_actions) {
    const size = this.size;
    const dim = state.length;

    if (this.move_counter === 1 && size === 6) {
      if (valid_actions.some((action) => action[0] === 5 && action[1] === 5)) {
        return [5, 5]; // Center hexagon move for size 6
      }
      if (valid_actions.some((action) => action[0] === 5 && action[1] === 10)) {
        return [5, 10]; // Another center move for size 6
      }
    }

    // No specific opening move found
    return null;
  }
}
