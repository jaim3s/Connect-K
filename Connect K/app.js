// Get references of te HTML elements
const sizeInput = document.getElementById("size");
const kInput = document.getElementById("k");
const playButton = document.getElementById("play-button");
const gameBoard = document.getElementById("game-board");
const MAX_SCORE = 1000000;
const MIN_SCORE = -1000000;
let winner = null;

/**
 * Class to create the transposition table.
 */
class TranspositionTable {
    constructor(size) {
        this.size = size;
        this.table = new Array(size);
        for (let i = 0; i < size; i++) {
        this.table[i] = { hash: null, data: null };
        }
    }

    hash(key) {
        // Implement a suitable hash function for your use case
        // Example: Convert the key to a string and hash it using a simple hash function
        return key.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % this.size;
    }

    store(key, score) {
        const index = this.hash(key);
        this.table[index] = { hash: key, value:score };
    }

    retrieve(key) {
        const index = this.hash(key);
        const entry = this.table[index];

        if (entry.hash === key) {
          return entry.value;
        }

        return null; // Entry not found
    }
}

/**
 * Class to simulate the nodes of a tree.  
 */
class TreeNode {
    constructor (game) {
        this.game = game;
        this.score = 0;
        this.childs = [];
        this.colPlayed = -1;
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
        // BigInt position and Mask
        this.position = 0n;
        this.mask = 0n;
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

    getKey() {
        return this.position + this.mask;
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
        let currentPlayer = 1 + this.movements%2;
        // check for vertical alignments
        if (this.height[col] >= this.k-1) {
            let flag = 0;
            for (let offset = 1; offset <= this.k-1; offset++) {
                if (this.board.values[this.board.m-this.height[col]-1+offset][col] == currentPlayer) {
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
                while (x >= 0 && x < this.board.n && y >= 0 && y < this.board.m && this.board.values[y][x] == currentPlayer) {
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

    playBitCode(col) { 
        const new_mask = this.board.mask | (this.board.mask + (1n << BigInt(col) * BigInt(this.board.n)));
        const new_position = this.board.position ^ this.board.mask;
        return [new_position, new_mask];
    }

    play(col) {
        this.board.values[this.board.m-this.height[col]-1][col] = 1 + this.movements%2;
        this.height[col]++;
        this.movements++;
        [this.board.position, this.board.mask] = this.playBitCode(col);

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
        let newBoard = new Board(this.board.m, this.board.n);
        newBoard.values = this.board.values.map(row => [...row]);
        newBoard.position = this.board.position;
        newBoard.mask = this.board.mask;
        let height = this.height.map(row => row);
        let clone = new ConnectK(newBoard, height, this.k);
        clone.movements = this.movements;
        return clone;
      }
}

/**
 * Class to solve the game of Connect-k.
 */
class Solver {

    constructor(game) {
        this.columnOrder = [];
        let cols = game.board.n;
        for (let i = 0; i < cols; i++) {
            this.columnOrder.push(Math.floor(cols / 2) + (1 - 2 * (i % 2)) * Math.floor((i + 1) / 2));
        }
        this.oneChipScores = this.createOneChipScores(cols);
        this.transTable = new TranspositionTable(80000);
    }

    createOneChipScores(cols) {
        let oneChipScores = [];
        let cnt = 40;
        for (let i = 0; i < cols; i++) {
            if (i < cols/2) {
                oneChipScores.push(cnt*(i+1));
            } else {
                oneChipScores.push(cnt*(cols-i));
            }
        }
        return oneChipScores
    }

    generate_offsets(k) {
        let offsets = [];
        for (let i = 0; i < k; i++) {
            let columnOffsets = [];
            let rowOffsets = [];
            let d1Offsets = [];
            let d2Offsets = [];
            for (let j = 0; j < k; j++) {
                // Column
                columnOffsets.push([-j+i, 0]);
                // Row 
                rowOffsets.push([0, -j+i]);
                // Right-Left diagonal
                d1Offsets.push([-j+i, -j+i]);
                // Left-Right diagonal
                d2Offsets.push([-j+i, j-i]);
            }
            offsets.push(columnOffsets);
            offsets.push(rowOffsets);
            offsets.push(d1Offsets);
            offsets.push(d2Offsets);
        }
        return offsets
    }

    get_score(game, offsets, col) {
        let score1 = 0;
        let score2 = 0;
        let startRow = game.board.m-game.height[col];
        for (let k = 0; k < game.board.m-startRow; k++) {
            let row = startRow+k;
            for (let i = 0; i < offsets.length; i++) {
                let flag = 0;
                for (let j = 0; j < offsets[i].length; j++) {
                    let rowOffset = offsets[i][j][0];
                    let colOffset = offsets[i][j][1];
                    if (row+rowOffset <= game.board.m-1 && row+rowOffset >= 0 && col+colOffset <= game.board.n-1 && col+colOffset >= 0) {
                        flag += 1;
                    } else {
                        break;
                    }
                }
                if (flag == offsets[i].length) {
                    let cnt1 = 0;
                    let cnt2 = 0;
                    for (let j = 0; j < offsets[i].length; j++) {
                        let rowOffset = offsets[i][j][0];
                        let colOffset = offsets[i][j][1];
                        if (game.board.values[row+rowOffset][col+colOffset] == 1) {
                            cnt1 += 1;
                        } else if (game.board.values[row+rowOffset][col+colOffset] == 2) {
                            cnt2 += 1;
                        }
                    }
                    if (cnt1 && cnt2 == 0) {
                        if (cnt1 == 1) {
                            let sel_col = -1;
                            for (let j = 0; j < offsets[i].length; j++) {
                                let rowOffset = offsets[i][j][0];
                                let colOffset = offsets[i][j][1];
                                if (game.board.values[row+rowOffset][col+colOffset] == 1) {
                                    sel_col = col+colOffset;
                                    break;
                                }
                            }
                            score1 += this.oneChipScores[sel_col];
                        } else if (cnt1 == 2) {
                            let start_col = -1;
                            let end_col = -1;
                            for (let j = 0; j < offsets[i].length; j++) {
                                let rowOffset = offsets[i][j][0];
                                let colOffset = offsets[i][j][1];
                                if (game.board.values[row+rowOffset][col+colOffset] == 1 && start_col == -1) {
                                    start_col = col+colOffset;
                                } else if (game.board.values[row+rowOffset][col+colOffset] == 1) {
                                    end_col = col+colOffset;
                                    break;
                                }
                            }
                            score1 += (game.board.n-(Math.abs(end_col-start_col)+1))*10000;
                        } else if (cnt1 == game.k-1) {
                            // Column
                            if (i == 0) {

                            }
                            score1 += (game.board.n-1)*10000+10000;

                        } else if (cnt1 == game.k) {
                            score1 += 10000000;
                        } else if (cnt1 == 3) {

                        } else if (cnt1 == 4) {

                        }
                    }
                    if (cnt2 && cnt1 == 0) {
                        if (cnt2 == 1) {
                            let sel_col = -1;
                            for (let j = 0; j < offsets[i].length; j++) {
                                let rowOffset = offsets[i][j][0];
                                let colOffset = offsets[i][j][1];
                                if (game.board.values[row+rowOffset][col+colOffset] == 2) {
                                    sel_col = col+colOffset;
                                    break;
                                }
                            }
                            score2 += this.oneChipScores[sel_col];
                        } else if (cnt2 == 2) {
                            let start_col = -1;
                            let end_col = -1;
                            for (let j = 0; j < offsets[i].length; j++) {
                                let rowOffset = offsets[i][j][0];
                                let colOffset = offsets[i][j][1];
                                if (game.board.values[row+rowOffset][col+colOffset] == 2 && start_col == -1) {
                                    start_col = col+colOffset;
                                } else if (game.board.values[row+rowOffset][col+colOffset] == 2) {
                                    end_col = col+colOffset;
                                    break;
                                }
                            }
                            score2 += (game.board.n-(Math.abs(end_col-start_col)+1))*10000;
                        } else if (cnt2 == game.k-1) {
                            score2 += (game.board.n-1)*10000+10000;
                        } else if (cnt2 == game.k) {
                            console.log("col played", col);
                            game.board.print();
                            score2 += 10000000;
                        } else if (cnt2 == 3) {

                        } else if (cnt2 == 4) {
                            
                        }
                    }
                }
            }
        }
        
        return [score1, score2]
    }

    heuristic(game, offsets) {
        let totalScore1 = 0;
        let totalScore2 = 0;
        for (let col = 0; col < game.board.n; col++) {
            let [x, y] = this.get_score(game, offsets, col);
            totalScore1+=x;
            totalScore2+=y;
        }
        return totalScore1-totalScore2;
    }

    posible_mov(r,c){
        return r>=0 && r<7 && c>=0 && c<7
    }

        
    create_seen_direction(k){
        const seen_direction = []
        for (let r = 0; r < k; r++) {
            const rowBoard = [];
            for (let c = 0; c < k; c++) {
            //[horizontal, vertical, diagonal right, diagonal let]
              rowBoard.push([[0,0],[0,0],[0,0],[0,0]]);
            }
            seen_direction.push(rowBoard);
          }
        return seen_direction
    }

    mi_score(game, col, seen_direction){
        let score1 = 0;
        let score2 = 0;
        let startRow = game.board.m-game.height[col];

        //[derecha,izquierda,abajo,arriba,d1,d1,d2,d2]
        let dx = [1,-1,0,0,-1,1,1,-1]
        let dy = [0,0,1,-1,-1,1,-1,1]

        let flag_adj = 0
        const multiplier = 2;

        let kk = game.k;
        for(let k=0; k<game.board.m-startRow; k++){

            const row = k + startRow;
            const chip = game.board.values[row][col]
           
            for(let i = 0; i < 8; i+=2){
            
                let nr = row;
                let nc = col;

                let cont = 0;
                let k_dir = kk
                let spaces_dir1 = 0;
                let spaces_dir2 = 0; 
                let ty = i/2;

                for(let j = 0; j< 2; j++){
                    while(this.posible_mov(nr,nc) && game.board.values[nr][nc] && !seen_direction[nr][nc][ty][chip-1]){
                        //mejor para el jugador actual
                        
                        if(game.board.values[nr][nc] == chip){
                            cont++;
                            seen_direction[nr][nc][ty][chip-1] = 1;
                        }else{
                            break;
                        }
                        
                        nr = nr+dy[i+j];
                        nc = nc+dx[i+j];
                        if(!this.posible_mov(nr,nc)) break;
                    }
                    //spaces and no continous chips
                    while(this.posible_mov(nr,nc) && k_dir>0 && !seen_direction[nr][nc][ty][chip-1]){
                        if(!game.board.values[nr][nc]){
                            j == 0 ? spaces_dir1++ : spaces_dir2++
                            //seen_direction[nr][nc][ty][chip-1] = 1;

                            // if(ty == 0 && k_dir == kk && nr != game[0].length-1){
                            if(ty == 0 && k_dir == kk ){
                                // if(board[nr+1][nc]){
                                if(nr+1 == game.board.n-game.height[nc]){
                                    flag_adj++;
                                }
                            }
        
                        }else{
                            break;
                        }
                        k_dir--;
                        nr = nr+dy[i+j];
                        nc = nc+dx[i+j];
        
                    }

                    //mirar la otra direccion
                    nr = row + dy[i+1];
                    nc = col + dx[i+1];
                    k_dir = 4;
                }
                

                let h = k-cont
                let sub = 0
                if(spaces_dir1 >= h) sub++;
                if(spaces_dir2 >= h) sub++;
                if((spaces_dir1+spaces_dir2) >= h ) sub++;


                if(cont == 2 && (spaces_dir1+spaces_dir2) >= 2){
                    chip == 1 ? score1+=1 :score2+=1
                    // if(flag_adj) chip == 1 ? score1+=flag_adj:score2+=flag_adj

                    //score1 += 1
                }
                if(cont == 3 && (spaces_dir1+spaces_dir2) >= 1 ){
                    chip == 1 ? score1+=5 :score2+=5
                    // if(flag_adj) chip == 1 ? score1+=flag_adj:score2+=flag_adj
                    // score1+= 5;
                }

                // console.log([i, cont, spaces_dir1, spaces_dir2])
            }

            //console.log([chip, row, col, chip == 1 ? score1:score2])

        }
        // console.log(seen_direction)
        return [score1, score2, seen_direction]
    }

    heuristic2(game) {
        let total_score1 = 0;
        let total_score2 = 0;

        let seen_direction = this.create_seen_direction(game.board.n)

        
        for (let col = 0; col < game.board.n; col++) {
            let [x,y,s] = this.mi_score(game, col, seen_direction);
            // console.log(s)
            seen_direction = s;
            total_score1+=x;
            total_score2+=y;
        }
        return total_score1-total_score2;
    }


    generateDecisionTree(treeNode, depth) {
        if (depth === 0) {
          return treeNode; // Stop generating tree at this depth
        }
        for (let col = 0; col < treeNode.game.board.n; col++) {
            if (treeNode.game.canPlay(col)) {
                const clone = treeNode.game.clone();
                clone.play(col);
                let new_treeNode = new TreeNode(clone);
                treeNode.childs.push(this.generateDecisionTree(new_treeNode, depth - 1));
            }
        }
        return treeNode;
    }

    minimax(treeNode, depth, offsets, alpha, beta) {
        if (depth === 0 || treeNode.game.isFull()) {
            const data = this.transTable.retrieve(treeNode.game.board.getKey());
            if (data) {
                treeNode.score = data;
                return data;
            }
            // Generate the score of the current board
            let score = this.heuristic2(treeNode.game);
            treeNode.score = score;
            this.transTable.store(treeNode.game.board.getKey(), score);
            return score;
        } 
        let currentPlayer = 1 + (treeNode.game.movements)%2;
        if (currentPlayer === 1) {
            let max_eval = Number.NEGATIVE_INFINITY;
            for (let col = 0; col < treeNode.game.board.n; col++) {
                if (treeNode.game.canPlay(this.columnOrder[col]) && treeNode.game.isWinningMove(this.columnOrder[col])) {
                    const clone = treeNode.game.clone();
                    clone.play(this.columnOrder[col]);
                    let new_treeNode = new TreeNode(clone);
                    new_treeNode.colPlayed = this.columnOrder[col];
                    treeNode.childs.push(new_treeNode);
                    new_treeNode.score = MAX_SCORE;
                    this.transTable.store(new_treeNode.game.board.getKey(), MAX_SCORE);
                    return MAX_SCORE;
                }
                else if (treeNode.game.canPlay(this.columnOrder[col]) && !treeNode.game.isWinningMove(this.columnOrder[col])) {
                    const clone = treeNode.game.clone();
                    clone.play(this.columnOrder[col]);
                    let new_treeNode = new TreeNode(clone);
                    new_treeNode.colPlayed = this.columnOrder[col];
                    treeNode.childs.push(new_treeNode);
                    let evaluation = this.minimax(new_treeNode, depth - 1, offsets, alpha, beta);
                    max_eval = Math.max(evaluation, max_eval);
                    treeNode.score = max_eval;
                    alpha = Math.max(alpha, evaluation);
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
            return max_eval;
        } else {
            let min_eval = Number.POSITIVE_INFINITY;
            for (let col = 0; col < treeNode.game.board.n; col++) {
                if (treeNode.game.canPlay(this.columnOrder[col]) && treeNode.game.isWinningMove(this.columnOrder[col])) {
                    const clone = treeNode.game.clone();
                    clone.play(this.columnOrder[col]);
                    let new_treeNode = new TreeNode(clone);
                    new_treeNode.colPlayed = this.columnOrder[col];
                    treeNode.childs.push(new_treeNode);
                    treeNode.score = MIN_SCORE;
                    this.transTable.store(treeNode.game.board.getKey(), MIN_SCORE);
                    return MIN_SCORE;
                }
                else if (treeNode.game.canPlay(this.columnOrder[col]) && !treeNode.game.isWinningMove(this.columnOrder[col])) {
                    const clone = treeNode.game.clone();
                    clone.play(this.columnOrder[col]);
                    let new_treeNode = new TreeNode(clone);
                    new_treeNode.colPlayed = this.columnOrder[col];
                    treeNode.childs.push(new_treeNode);
                    let evaluation = this.minimax(new_treeNode, depth - 1, offsets, alpha, beta);
                    min_eval = Math.min(evaluation, min_eval);
                    treeNode.score = min_eval;
                    beta = Math.min(beta, evaluation);
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
            return min_eval;
        }
    }

    steroidsMinimax(game, offsets, maxDepth, game_cells) {
        let score = null;
        let root = new TreeNode(game.clone());
        for (let depth = 1; depth <= maxDepth; depth++) {
            score = this.minimax(root, depth, offsets, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
        }
        // Select the best column
        let best_col = -1;
        for (let i = 0; i < root.childs.length; i++) {
            game_cells[game.board.m][root.childs[i].colPlayed].innerHTML = String(Math.round(root.childs[i].score*100)/100);
            if (score === root.childs[i].score && best_col === -1) {
                best_col = root.childs[i].colPlayed;
            }
        }
        return [score, best_col];
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
    let currentPlayer = 1 + game.movements%2;
    if (winner !== null) {
        console.log("Winner:", winner);
    } else if (game.isFull()) {
        console.log("It's a draw!");
    } else {
        if (game.canPlay(col)) {
            console.log("Player", currentPlayer);
            if (game.isWinningMove(col)) {
                winner = currentPlayer;
                console.log("Winner:", winner);
            }
            game_cells[game.board.m-game.height[col]-1][col].style.backgroundColor = currentPlayer === 1 ? "red" : "yellow";
            game.play(col);
            game.board.print();
            // Swap current player
            currentPlayer = currentPlayer == 1 ? 2 : 1;
            console.log("movements", game.movements);
            let root = new TreeNode(game.clone());
            root.colPlayed = col;
            let [score, best_col] = solver.steroidsMinimax(game, offsets, 7, game_cells);
            console.log("score:", score);
            console.log("column:", best_col);
            console.log("Board position state:", game.board.position);
            console.log("Board mask state:", game.board.mask);
            console.log("Board key:", game.board.getKey());
            //makeMove(best_col, game, game_cells, solver, offsets);
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
                best_col = root.childs[i].colPlayed 
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
