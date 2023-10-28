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
    for (let j = 0; j < cols; j++) {
        for (let i = rows-1; i >= 0; i--) {
            str += bit_board[i][j];
        }
    }
    return str;
}

function generate_key(bit_board_position, bit_board_mask, bit_board_bottom) {
    let pos_code = parseInt(get_bitscode(bit_board_position), 2);
    let mask_code = parseInt(get_bitscode(bit_board_mask), 2);
    let bottom_code = parseInt(get_bitscode(bit_board_bottom), 2);
    return (pos_code ^ mask_code ^ bottom_code).toString(2);
}

function connectedFour(position) {
    // Horizontal check
    let m = position & (position >> 7);
    console.log(m>>7);
    if (m & (m >> 14)) {
        return true;
    }
    // Diagonal \
    m = position & (position >> 6);
    if (m & (m >> 12)) {
        return true;
    }
    // Diagonal /
    m = position & (position >> 8);
    if (m & (m >> 16)) {
        return true;
    }
    // Vertical
    m = position & (position >> 1);
    if (m & (m >> 2)) {
        return true;
    }
    // Nothing found
    return false;
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
console.log(board);

create_bit_board(board);
let bit_board_position = enconde_position(board, "x");
let bit_board_mask = enconde_mask(board, "x");
let bit_board_bottom = enconde_bottom(board);
console.log(generate_key(bit_board_position, bit_board_mask, bit_board_bottom));
function logicalRightShift(num, bits) {
    return (num >>> bits) & ((1 << (32 - bits)) - 1);
}

let res = get_bitscode(bit_board_position);
console.log(res);
console.log(parseInt(res, 2));
let t1 = parseInt("0000000001000000100000010000001000000000000000000", 2);
console.log(t1);
console.log(logicalRightShift(t1, 7));
console.log((1|t1)>>>7);
console.log(connectedFour(t1));