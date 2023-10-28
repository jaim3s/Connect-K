// Get references of te HTML elements
const sizeInput = document.getElementById("size");
const kInput = document.getElementById("k");
const playButton = document.getElementById("play-button");
const gameBoard = document.getElementById("game-board");
let winner = null;
console.log(Number.POSITIVE_INFINITY - Number.NEGATIVE_INFINITY);

/**
 * Class to simulate the nodes of a tree.  
 */
class TreeNode {
    constructor (game) {
        this.game = game;
        this.score = 0;
        this.childs = [];
        this.col_played = -1;
    }
}

/**
 * Class to store the game board data.
 */
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

/**
 * Class to simulate the game of Connect-k.
 */
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

/**
 * Class to solve the game of Connect-k.
 */
class Solver {

    constructor(game) {
        this.column_order = [];
        let cols = game.board.n;
        for (let i = 0; i < cols; i++) {
            this.column_order.push(Math.floor(cols / 2) + (1 - 2 * (i % 2)) * Math.floor((i + 1) / 2));
        }
        this.one_chip_scores = this.create_one_chip_scores(cols);
    }

    create_one_chip_scores(cols) {
        let one_chip_scores = [];
        let cnt = 40;
        for (let i = 0; i < cols; i++) {
            if (i < cols/2) {
                one_chip_scores.push(cnt*(i+1));
            } else {
                one_chip_scores.push(cnt*(cols-i));
            }
        }
        return one_chip_scores
    }

    generate_offsets(k) {
        let offsets = [];
        for (let i = 0; i < k; i++) {
            let column_offsets = [];
            let row_offsets = [];
            let d1_offsets = [];
            let d2_offsets = [];
            for (let j = 0; j < k; j++) {
                // Column
                column_offsets.push([-j+i, 0]);
                // Row 
                row_offsets.push([0, -j+i]);
                // Right-Left diagonal
                d1_offsets.push([-j+i, -j+i]);
                // Left-Right diagonal
                d2_offsets.push([-j+i, j-i]);
            }
            offsets.push(column_offsets);
            offsets.push(row_offsets);
            offsets.push(d1_offsets);
            offsets.push(d2_offsets);
        }
        return offsets
    }

    get_score(game, offsets, col) {
        let score1 = 0;
        let score2 = 0;
        let start_row = game.board.m-game.height[col];
        for (let k = 0; k < game.board.m-start_row; k++) {
            let row = start_row+k;
            for (let i = 0; i < offsets.length; i++) {
                let flag = 0;
                for (let j = 0; j < offsets[i].length; j++) {
                    let row_offset = offsets[i][j][0];
                    let col_offset = offsets[i][j][1];
                    if (row+row_offset <= game.board.m-1 && row+row_offset >= 0 && col+col_offset <= game.board.n-1 && col+col_offset >= 0) {
                        flag += 1;
                    } else {
                        break;
                    }
                }
                if (flag == offsets[i].length) {
                    let cnt1 = 0;
                    let cnt2 = 0;
                    for (let j = 0; j < offsets[i].length; j++) {
                        let row_offset = offsets[i][j][0];
                        let col_offset = offsets[i][j][1];
                        if (game.board.values[row+row_offset][col+col_offset] == 1) {
                            cnt1 += 1;
                        } else if (game.board.values[row+row_offset][col+col_offset] == 2) {
                            cnt2 += 1;
                        }
                    }
                    if (cnt1 && cnt2 == 0) {
                        if (cnt1 == 1) {
                            let sel_col = -1;
                            for (let j = 0; j < offsets[i].length; j++) {
                                let row_offset = offsets[i][j][0];
                                let col_offset = offsets[i][j][1];
                                if (game.board.values[row+row_offset][col+col_offset] == 1) {
                                    sel_col = col+col_offset;
                                    break;
                                }
                            }
                            score1 += this.one_chip_scores[sel_col];
                        } else if (cnt1 == 2) {
                            let start_col = -1;
                            let end_col = -1;
                            for (let j = 0; j < offsets[i].length; j++) {
                                let row_offset = offsets[i][j][0];
                                let col_offset = offsets[i][j][1];
                                if (game.board.values[row+row_offset][col+col_offset] == 1 && start_col == -1) {
                                    start_col = col+col_offset;
                                } else if (game.board.values[row+row_offset][col+col_offset] == 1) {
                                    end_col = col+col_offset;
                                    break;
                                }
                            }
                            score1 += (game.board.n-(Math.abs(end_col-start_col)+1))*10000;
                        } else if (cnt1 == 3) {
                            score1 += (game.board.n-1)*10000+10000;
                        } else {
                            score1 += 1000000;
                        }
                    }
                    if (cnt2 && cnt1 == 0) {
                        if (cnt2 == 1) {
                            let sel_col = -1;
                            for (let j = 0; j < offsets[i].length; j++) {
                                let row_offset = offsets[i][j][0];
                                let col_offset = offsets[i][j][1];
                                if (game.board.values[row+row_offset][col+col_offset] == 2) {
                                    sel_col = col+col_offset;
                                    break;
                                }
                            }
                            score2 += this.one_chip_scores[sel_col];
                        } else if (cnt2 == 2) {
                            let start_col = -1;
                            let end_col = -1;
                            for (let j = 0; j < offsets[i].length; j++) {
                                let row_offset = offsets[i][j][0];
                                let col_offset = offsets[i][j][1];
                                if (game.board.values[row+row_offset][col+col_offset] == 2 && start_col == -1) {
                                    start_col = col+col_offset;
                                } else if (game.board.values[row+row_offset][col+col_offset] == 2) {
                                    end_col = col+col_offset;
                                    break;
                                }
                            }
                            score2 += (game.board.n-(Math.abs(end_col-start_col)+1))*10000;
                        } else if (cnt2 == 3) {
                            score2 += (game.board.n-1)*10000+10000;
                        } else {
                            score2 += 1000000;
                        }
                    }
                }
            }
        }
        
        return [score1, score2]
    }

    heuristic(game, offsets) {
        let total_score1 = 0;
        let total_score2 = 0;
        for (let col = 0; col < game.board.n; col++) {
            let [x, y] = this.get_score(game, offsets, col);
            total_score1+=x;
            total_score2+=y;
        }
        return total_score1-total_score2;
    }

    generateDecisionTree(tree_node, depth) {
        if (depth === 0) {
          return tree_node; // Stop generating tree at this depth
        }
        for (let col = 0; col < tree_node.game.board.n; col++) {
            if (tree_node.game.canPlay(col)) {
                const clone = tree_node.game.clone();
                clone.play(col);
                let new_tree_node = new TreeNode(clone);
                tree_node.childs.push(this.generateDecisionTree(new_tree_node, depth - 1));
            }
        }
        return tree_node;
    }

    minimax(tree_node, depth, offsets, alpha, beta) {
        if (depth === 0 || tree_node.game.isFull()) {
            // Generate the score of the current board
            let score = this.heuristic(tree_node.game, offsets);
            tree_node.score = score;
            return score;
        }
        let current_player = 1 + (tree_node.game.movements)%2;
        if (current_player === 1) {
            let max_eval = Number.NEGATIVE_INFINITY;
            for (let col = 0; col < tree_node.game.board.n; col++) {
                if (tree_node.game.canPlay(this.column_order[col])) {
                    const clone = tree_node.game.clone();
                    clone.play(this.column_order[col]);
                    let new_tree_node = new TreeNode(clone);
                    new_tree_node.col_played = this.column_order[col];
                    tree_node.childs.push(new_tree_node);
                    let evaluation = this.minimax(new_tree_node, depth - 1, offsets, alpha, beta);
                    max_eval = Math.max(evaluation, max_eval);
                    tree_node.score = max_eval;
                    alpha = Math.max(alpha, evaluation);
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
            return max_eval;
        } else {
            let min_eval = Number.POSITIVE_INFINITY;
            for (let col = 0; col < tree_node.game.board.n; col++) {
                if (tree_node.game.canPlay(this.column_order[col])) {
                    const clone = tree_node.game.clone();
                    clone.play(this.column_order[col]);
                    let new_tree_node = new TreeNode(clone);
                    new_tree_node.col_played = this.column_order[col];
                    tree_node.childs.push(new_tree_node);
                    let evaluation = this.minimax(new_tree_node, depth - 1, offsets, alpha, beta);
                    min_eval = Math.min(evaluation, min_eval);
                    tree_node.score = min_eval;
                    beta = Math.min(beta, evaluation);
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
            return min_eval;
        }
    }
}

function setGridSize(rows, cols) {
    gameBoard.style.setProperty('--rows', rows);
    gameBoard.style.setProperty('--cols', cols);
}

function makeMove(col, game, game_cells, solver, offsets) {
    // reset cells
    for (let i = 0; i < game.board.n; i++) {
        game_cells[game.board.m][i].innerHTML = "";
    }
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
            // Swap current player
            current_player = current_player == 1 ? 2 : 1;
            console.log("movements", game.movements);
            let root = new TreeNode(game.clone());
            root.col_played = col;
            let score = solver.minimax(root, 7, offsets, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
            let best_col = -1;
            // Select the best column
            for (let i = 0; i < root.childs.length; i++) {
                game_cells[game.board.m][root.childs[i].col_played].innerHTML = String(Math.round(root.childs[i].score*100)/100);
                if (score === root.childs[i].score && best_col === -1) {
                    best_col = root.childs[i].col_played;
                }
            }
            console.log("score:", score);
            console.log("column:", best_col);
            console.log(root);
        } else {
            console.log("Column is full. Try again.");
        }
    }
}

class Bot {
    constructor (player) {
        this.player = player;
    }

    select_col (game, solver) {
        let root = new TreeNode(game.clone());
        let score = solver.minimax(root, 5, offsets);
        let best_col = -1;
        for (let i = 0; i < root.childs.length; i++) {
            if (score === root.childs[i].score) {
                best_col = root.childs[i].col_played 
            }
        }
        return best_col;
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
        setGridSize(size+1, size);

        const game = new ConnectK(new Board(size, size), new Array(size).fill(0), k);

        let game_cells = [];
        for (let row = 0; row < size+1; row++) {
            let cells = [];
            for (let col = 0; col < size; col++) {
                const cell = document.createElement("div");
                if (row == size) {
                    cell.classList.add("grid-txt-item");
                } else {
                    cell.classList.add("grid-item");
                }
                cell.dataset.row = row;
                cell.dataset.col = col;
                gameBoard.appendChild(cell);
                cells.push(cell);
            }
            game_cells.push(cells);
        }

        let solver = new Solver(game);
        console.log(solver.create_one_chip_scores(8));
        let offsets = solver.generate_offsets(k);
        
        /**
        game.play_sequence("4444444");
        game.board.print();
        let root = new TreeNode(game.clone());
        let score = solver.minimax(root, 2, offsets);
        console.log(score);
        console.log(root);
        **/
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                game_cells[row][col].addEventListener('click', function(event) {
                    let col = parseInt(event.target.dataset.col);
                    makeMove(col, game, game_cells, solver, offsets);
                });
            }
        }
    } else {
        console.log("Please enter a valid positive integer for the grid size.");
    } 
});
