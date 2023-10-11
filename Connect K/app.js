// Get references to the input elements and the play button
const sizeInput = document.getElementById("size");
const kInput = document.getElementById("k");
const playButton = document.getElementById("play-button");
const gameBoard = document.getElementById("game-board");
let winner = null;

class TreeNode {
    constructor (game) {
        this.game = game;
        this.score = 0;
        this.childs = [];
    }
}

class Board {
    constructor(m, n) {
        this.m = m;
        this.n = n;
        this.values = this.createEmptyValues();
    }

    createEmptyValues() {
        const values = [];
        for (let i = 0; i < this.m; i++) {
          values.push(new Array(this.n).fill(0));
        }
        return values;
    }

    getTotalCells() {
        return this.m*this.n;
    }

    print() {
        let res = ""
        for (let i = 0; i < this.m; i++) {
            let rowString = '';
            for (let j = 0; j < this.n; j++) {
                rowString += this.values[i][j].toString() + " ";
            }
            res += rowString + "\n";
        }
        console.log(res);
    }
}

class ConnectK {
    constructor(board, height, k) {
        this.board = board;
        this.movements = 0;
        this.height = height;
        this.k = k;
    }

    print() {
        console.log("Board", this.board.m, this.board.n, this.k);
    }

    checkWin(player) {
        // Check for a horizontal win
        for (let row = 0; row < this.board.m; row++) {
            for (let i = 0; i < this.board.n - this.k+1; i++) {
                let flag = 0;
                for (let k = i; k < i+this.k; k++) {
                    if (this.board.values[row][k] == player) {
                        flag++;
                    }
                }
                if (flag == this.k) {
                    return true;
                }
            }
        }

        // Check for a vertical win
        for (let col = 0; col < this.board.n; col++) {
            for (let row = 0; row < this.board.m - this.k+1; row++) {
                let flag = 0;
                for (let i = 0; i < this.k; i++) {
                    if (this.board.values[row+i][col] == player) {
                        flag++;
                    }
                }
                if (flag == this.k) {
                    return true;
                }
            }
        }

        // Check for a diagonal win (from bottom-right to top-left)
        for (let row = 0; row < this.board.m - this.k+1; row++) {
            for (let col = 0; col < this.board.n - this.k+1; col++) {
                let flag = 0;
                for (let i = 0; i < this.k; i++) {
                    if (this.board.values[row+i][col+i] == player) {
                        flag++;
                    }
                }
                if (flag == this.k) {
                    return true;
                }
            }
        }

        // Check for a diagonal win (from bottom-left to top-right)
        for (let row = this.board.m - this.k+1; row < this.board.m; row++) {
            for (let col = 0; col < this.board.n - this.k+1; col++) {
                let flag = 0;
                for (let i = 0; i < this.k; i++) {
                    if (row-i >= 0 && this.board.values[row-i][col+i] == player) {
                        flag++;
                    }
                }
                if (flag == this.k) {
                    return true;
                }
            }
        }
    }

    isWinningMove(col) {
        let current_player = 1 + this.movements%2;
        // check for vertical alignments
        if (this.height[col] >= this.k-1) {
            let flag = 0;
            for (let offset = 1; offset <= this.k-1; offset++) {
                if (this.board.values[this.board.m-this.height[col]-1+offset][col] == current_player) {
                    flag++;
                }
            }
            if (flag === this.k-1) {
                return true
            }
        }

        for (let dy = -1; dy <= 1; dy++) {
            let nb = 0
            for (let dx = -1; dx <= 1; dx+=2) {
                let x = col+dx;
                let y = (this.board.m-this.height[col]-1)+dx*dy;
                while (x >= 0 && x < this.board.n && y >= 0 && y < this.board.m && this.board.values[y][x] == current_player) {
                    nb++;
                    x += dx;
                    y += dx*dy;
                }
            }
            if (nb >= this.k-1) {
                return true;
            }
        }
        return false;
    }

    isFull() {
        let flag = 0;
        for (let i = 0; i < this.height.length; i++) {
            if (this.height[i] === this.board.m) {
                flag++;
            }
        }
        return flag === this.board.n ? true : false;
    }

    canPlay(col) {
        return this.height[col] < this.board.m;
    }

    play(col) {
        this.board.values[this.board.m-this.height[col]-1][col] = 1 + this.movements%2;
        this.height[col]++;
        this.movements++;
    }

    play_sequence(sequence) {
        for (let i = 0; i < sequence.length; i++) {
            let col = parseInt(sequence[i], 10)-1;
            if (col < 0 || col >= this.board.n || !this.canPlay(col) || this.isWinningMove(col) || this.isFull()) return null;
            this.play(col);
        }
        return sequence.length;
    }


    clone() {
        let new_board = new Board(this.board.m, this.board.n);
        new_board.values = this.board.values.map(row => [...row])
        let height = this.height.map(row => row)
        let clone = new ConnectK(new_board, height, this.k);
        clone.movements = this.movements;
        return clone;
      }

    run() {
        let flag = true;
        let winner = null;
        let current_player = 1;

        while (!this.isFull()) {
            this.board.print();
            console.log("Player", current_player);

            let col = parseInt(prompt("Enter a number:"));
            if (col < 0 || col >= this.board.n) {
                console.log("Invalid column. Please choose a column between 0 and 6.");
                continue;
            }

            if (!this.canPlay(col)) {
                console.log("Column is full. Try again.");
                continue;
            } else if (this.isWinningMove(col)) {
                this.play(col);
                winner = current_player;
                break;
            }

            this.play(col);

            current_player = current_player == 1 ? 2 : 1;
        }
        this.board.print();
        if (winner !== null) {
            console.log("Winner:", current_player);
        } else {
            console.log("It's a draw!");
        }
    }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

class Solver {

    generateDecisionTree(tree_node, depth) {
        if (depth === 0) {
          return tree_node; // Stop generating tree at this depth
        }
        for (let col = 0; col < tree_node.game.board.n; col++) {
            if (tree_node.game.canPlay(col)) {
                const clone = tree_node.game.clone();
                clone.play(col);
                let new_tree_node = new TreeNode(clone);
                tree_node.childs.push(new_tree_node);
                new_tree_node.game.generateDecisionTree(new_tree_node, depth - 1);
            }
        }
    }

    minimax(tree_node, depth) {
        if (depth === 0 || tree_node.game.isFull()) {
          return tree_node.game.movements; // Stop generating tree at this depth
        }
        let current_player = 1 + tree_node.movements
        if (current_player === 1) {
            let max_eval = Number.NEGATIVE_INFINITY;
            for (let col = 0; col < tree_node.game.board.n; col++) {
                if (tree_node.game.canPlay(col)) {
                    const clone = tree_node.game.clone();
                    clone.play(col);
                    let new_tree_node = new TreeNode(clone);
                    tree_node.childs.push(new_tree_node);
                    let evaluation = this.minimax(new_tree_node, depth - 1);
                    max_eval = Math.max(evaluation, max_eval);
                }
            }
            tree_node.score = max_eval;
        } else {
            let min_eval = Number.POSITIVE_INFINITY;
            for (let col = 0; col < tree_node.game.board.n; col++) {
                if (tree_node.game.canPlay(col)) {
                    const clone = tree_node.game.clone();
                    clone.play(col);
                    let new_tree_node = new TreeNode(clone);
                    tree_node.childs.push(new_tree_node);
                    let evaluation = this.minimax(new_tree_node, depth - 1);
                    min_eval = Math.min(evaluation, min_eval);
                }
            }
            tree_node.score = min_eval;
        }
    }

    negamax(game, alpha, beta, depth) {
        assert(alpha < beta, "alpha is smaller than beta");

        if (game.isFull() || depth==0) {
            return 0;
        }

        // Check if the player can win in the next movement
        for (let col = 0; col < game.board.n; col++) {
            if (game.canPlay(game.board, col) && game.isWinningMove(col)) {
                return (game.board.m*game.board.n+1 - game.movements)/2;
            }
        }

        let max = (game.board.m*game.board.n-1-game.movements)/2;
        if (beta > max) {
            beta = max;
            if (alpha >= beta) return beta;
        }

        for (let col = 0; col < game.board.n; col++) {
            if (game.canPlay(col)) {
                let clone = game.clone();
                clone.play(col);
                let score = -this.negamax(clone, -beta, -alpha, depth-1);
                if (score >= beta) {
                    return score;
                }
                if (score > alpha) {
                    alpha = score;
                }
            }
        }

        return alpha;
    }
}

function setGridSize(rows, cols) {
    gameBoard.style.setProperty('--rows', rows);
    gameBoard.style.setProperty('--cols', cols);
}

function makeMove(event, game, game_cells) {
    const col = parseInt(event.target.dataset.col);
    let current_player = 1 + game.movements%2;
    if (winner !== null) {
        console.log("Winner:", winner);
    } else if (game.isFull()) {
        console.log("It's a draw!");
    } else {
        if (game.canPlay(col)) {
            console.log("Player", current_player);
            if (game.isWinningMove(col)) {
                winner = current_player;
                console.log("Winner:", winner);
            }
            game_cells[game.board.m-game.height[col]-1][col].style.backgroundColor = current_player === 1 ? "red" : "yellow";
            game.play(col);
            game.board.print();
            current_player = current_player == 1 ? 2 : 1;
        } else {
            console.log("Column is full. Try again.");
        }
    }
}

playButton.addEventListener("click", function() {
    // Get the values from the input fields
    const size = parseInt(sizeInput.value);
    const k = parseInt(kInput.value);

    // Check if the values are valid numbers
    if (!isNaN(size) && !isNaN(k) && size > 0) {

        // Clear previos game
        gameBoard.innerHTML = "";
        winner = null;
        setGridSize(size, size);

        const game = new ConnectK(new Board(size, size), new Array(size).fill(0), k);

        game_cells = [];
        for (let row = 0; row < size; row++) {
            cells = [];
            for (let col = 0; col < size; col++) {
                const cell = document.createElement("div");
                cell.classList.add("grid-item");
                cell.dataset.row = row;
                cell.dataset.col = col;
                gameBoard.appendChild(cell);
                cells.push(cell);
            }
            game_cells.push(cells);
        }

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                game_cells[row][col].addEventListener('click', function(event) {
                    makeMove(event, game, game_cells);
                });
            }
        }

        //console.log(game.play_sequence("1122"));
        let root = new TreeNode(game.clone());
        let solver = new Solver();
        let score = solver.minimax(root, 3);
        //game.generateDecisionTree(root, 3);
        console.log(root);
    } else {
        console.log("Please enter a valid positive integer for the grid size.");
    } 
});
