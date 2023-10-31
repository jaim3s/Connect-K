function create_empty_values(rows, cols) {
    const values = [];
    for (let i = 0; i < rows; i++) {
      values.push(new Array(cols).fill(0));
    }
    return values;
}

function enconde_position(board, player) {
    let rows = board.length;
    let cols = board[0].length;
    let bit_board_position = create_empty_values(rows+1, cols);
    for (let j = 0; j < cols; j++) {
        for (let i = rows-1; i > 0; i--) {
            // Player 1
            if (board[i][j] === player) {
                bit_board_position[i+1][j] = 1;
            // Player 2 & Empty cell
            } else {
                bit_board_position[i+1][j] = 0;
            }
        }
    }
    return bit_board_position;
}

function enconde_mask(board) {
    let rows = board.length;
    let cols = board[0].length;
    let bit_board_mask = create_empty_values(rows+1, cols);
    for (let j = 0; j < cols; j++) {
        for (let i = rows-1; i > 0; i--) {
            // Player 1
            if (board[i][j] === "x" || board[i][j] === "o") {
                bit_board_mask[i+1][j] = 1;
            }
        }
    }
    return bit_board_mask;
}

function enconde_bottom(board) {
    let rows = board.length;
    let cols = board[0].length;
    let bit_board_bottom = create_empty_values(rows+1, cols);
    for (let i = 0; i < cols; i++) {
        bit_board_bottom[rows][i] = 1;
    }
    return bit_board_bottom
}

function get_bitscode(bit_board) { 
    let rows = bit_board.length;
    let cols = bit_board[0].length;
    let str = "";
    for (let j = cols-1; j >= 0; j--) {
        for (let i = 0; i < rows; i++) {
            str += bit_board[i][j];
        }
    }
    return str;
}

function generate_key(bit_board_position, bit_board_mask, bit_board_bottom) {
    let pos_code = parseInt(get_bitscode(bit_board_position), 2);
    let mask_code = parseInt(get_bitscode(bit_board_mask), 2);
    let bottom_code = parseInt(get_bitscode(bit_board_bottom), 2);
    return (BigInt(pos_code) + BigInt(mask_code) + BigInt(bottom_code)).toString(2);
}

function connectedFour(position) {
    position = BigInt(position);
    // Horizontal check
    let m = position & (position >> 7n);
    if (m & (m >> 14n)) {
        return true;
    }
    // Diagonal \
    m = position & (position >> 6n);
    if (m & (m >> 12n)) {
        return true;
    }
    // Diagonal /
    m = position & (position >> 8n);
    if (m & (m >> 16n)) {
        return true;
    }
    // Vertical
    m = position & (position >> 1n);
    if (m & (m >> 2n)) {
        return true;
    }
    // Nothing found
    return false;
}

function makeMove(position, mask, col) {
    console.log(position.toString(2));
    mask = BigInt(mask);
    console.log("mask", mask);
    const new_position = BigInt(position) ^ BigInt(mask);
    console.log("RESULT POSITION", new_position.toString(2));
    const new_mask = mask | (mask + (1n << (BigInt(col) * 7n)));
    console.log("RESULT MASK", new_mask.toString(2));
    return [new_position, new_mask];
}


function create_bit_board(board) {
    // Get the dimensions of the board
    let rows = board.length;
    let cols = board[0].length;
    let bit_board = create_empty_values(rows+1, cols);
    console.log(bit_board);
    let cnt = 0;
    for (let j = 0; j < cols; j++) {
        for (let i = rows; i >= 0; i--) {
            bit_board[i][j] = cnt;
            cnt++;
        }
    }
    console.log(bit_board);
}

let board = [
[".",".",".",".",".",".","."],
[".",".",".","o",".",".","."],
[".",".","x","x",".",".","."],
[".",".","o","x",".",".","."],
[".",".","o","o","x",".","."],
[".",".","o","x","x","o","."],
]

create_bit_board(board);
let bit_board_position = enconde_position(board, "x");
let bit_board_mask = enconde_mask(board, "x");
let bit_board_bottom = enconde_bottom(board);

let pos_code = get_bitscode(bit_board_position);
let mask_code = get_bitscode(bit_board_mask);

console.log("POS_CODE",pos_code);
console.log("MASK_CODE",mask_code);
let res = 35230302208;
console.log("REAL_MASK_CODE", res.toString(2));

console.log("POS_CODE",parseInt(pos_code, 2));
console.log("MASK_CODE",parseInt(mask_code, 2));
console.log("REAL_MASK_CODE", "35230302208");
let int_pos_code = parseInt(pos_code, 2);
let int_mask_code = parseInt(mask_code, 2);

const new_position = BigInt(int_pos_code) ^ BigInt(int_mask_code);
console.log(new_position.toString(2));

res = 1 << (4*7);
console.log(res);
console.log(res.toString(2));

const new_mask = BigInt(int_mask_code) | (BigInt(int_mask_code) + (1n << (BigInt(4) * 7n)));
console.log(new_mask.toString(2));
let a = 293601280n;
console.log(a.toString(2));

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

  store(key, data) {
    const index = this.hash(key);
    this.table[index] = { hash: key, data };
  }

  retrieve(key) {
    const index = this.hash(key);
    const entry = this.table[index];

    if (entry.hash === key) {
      return entry.data;
    }

    return null; // Entry not found
  }
}

// Example usage:
const tt = new TranspositionTable(1024);

// Store a position and associated data
tt.store('position1', { score: 100, depth: 5 });

// Retrieve data for a position
const data = tt.retrieve('position1');
if (data) {
  console.log('Retrieved data:', data);
} else {
  console.log('Data not found.');
}
