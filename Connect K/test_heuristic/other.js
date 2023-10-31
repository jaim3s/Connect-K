// Online Javascript Editor for free
// Write, Edit and Run your Javascript code using JS Online Compiler


const filas = 7;
const columnas = 7;
let board = new Array(filas);

let height = new Array(columnas).fill(0)

for (let i = 0; i < filas; i++) {
    board[i] = new Array(columnas).fill(0); 
}

let one_chip_scores = create_one_chip_scores(columnas)
let offsets = generate_offsets(4)

// move(1,2)
// move(1,1)
// move(2,1)
// move(2,1)
// move(3,2)
// move(4,1)
// move(5,2)
// move(6,1)
// move(6,2)

// move(3,1)

// move(1,2)
// move(2,2)




//------------------------
move(0,2)
move(1,1)
move(1,1)

move(2,1)
move(2,2)
move(2,2)
move(2,1)

move(3,1)
move(3,2)
move(3,2)
move(3,2)
move(3,1)

move(4, 2)
move(4, 1)
move(4, 1)
move(4, 2)

move(5,1)
//-----------------------

// move(2,2)
// move(3,2)
// move(4,2)
// move(5,1)

// // move(2,1)
// move(3,1)
// move(4,1)
// move(5,2)   

// move(1,2)
// move(1,2)
// move(2,1)
// move(3,1)
// move(4,2)
// move(5,2)
// move(6,1)

// move(2,1)

// move(0,2)


move(6,2)
imprimirTablero(board);


//console.log(get_score(board,offsets,2))

let bb = create_seen_direction(7)
//console.log(mi_score(board, 1, 2, bb))
heuristic(board, 1)


function create_one_chip_scores(cols) {
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
function generate_offsets(k) {
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

function get_score(game, offsets, col) {
        let score1 = 0;
        let score2 = 0;
        let start_row = game[0].length-height[col];
        for (let k = 0; k < game[0].length-start_row; k++) {
            let row = start_row+k;
            for (let i = 0; i < offsets.length; i++) {
                let flag = 0;
                for (let j = 0; j < offsets[i].length; j++) {
                    let row_offset = offsets[i][j][0];
                    let col_offset = offsets[i][j][1];
                    if (row+row_offset <= game[0].length-1 && row+row_offset >= 0 && col+col_offset <= game[0].length-1 && col+col_offset >= 0) {
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
                        if (game[row+row_offset][col+col_offset] == 1) {
                            cnt1 += 1;
                        } else if (game[row+row_offset][col+col_offset] == 2) {
                            cnt2 += 1;
                        }
                    }
                    console.log([cnt1, cnt2, k])
                    if (cnt1 && cnt2 == 0) {
                        if (cnt1 == 1) {
                            let sel_col = -1;
                            for (let j = 0; j < offsets[i].length; j++) {
                                let row_offset = offsets[i][j][0];
                                let col_offset = offsets[i][j][1];
                                if (game[row+row_offset][col+col_offset] == 1) {
                                    sel_col = col+col_offset;
                                    break;
                                }
                            }
                            score1 += one_chip_scores[sel_col];
                        } else if (cnt1 == 2) {
                            let start_col = -1;
                            let end_col = -1;
                            for (let j = 0; j < offsets[i].length; j++) {
                                let row_offset = offsets[i][j][0];
                                let col_offset = offsets[i][j][1];
                                if (game[row+row_offset][col+col_offset] == 1 && start_col == -1) {
                                    start_col = col+col_offset;
                                } else if (game[row+row_offset][col+col_offset] == 1) {
                                    end_col = col+col_offset;
                                    break;
                                }
                            }
                            score1 += (game[0].length-(Math.abs(end_col-start_col)+1))*10000;
                        } else if (cnt1 == 3) {
                            score1 += (game[0].length-1)*10000+10000;
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
                                if (game[row+row_offset][col+col_offset] == 2) {
                                    sel_col = col+col_offset;
                                    break;
                                }
                            }
                            score2 += one_chip_scores[sel_col];
                        } else if (cnt2 == 2) {
                            let start_col = -1;
                            let end_col = -1;
                            for (let j = 0; j < offsets[i].length; j++) {
                                let row_offset = offsets[i][j][0];
                                let col_offset = offsets[i][j][1];
                                if (game[row+row_offset][col+col_offset] == 2 && start_col == -1) {
                                    start_col = col+col_offset;
                                } else if (game[row+row_offset][col+col_offset] == 2) {
                                    end_col = col+col_offset;
                                    break;
                                }
                            }
                            score2 += (game[0].length-(Math.abs(end_col-start_col)+1))*10000;
                        } else if (cnt2 == 3) {
                            score2 += (game[0].length-1)*10000+10000;
                        } else {
                            score2 += 1000000;
                        }
                    }
                }
            }
        }
        
        return [score1, score2]
    }    

function create_seen_direction(k){
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

function posible_mov(r,c){
    return r>=0 && r<7 && c>=0 && c<7
}

function heuristic(game, player) {
    let total_score1 = 0;
    let total_score2 = 0;

    let seen_direction = create_seen_direction(game[0].length)

    
    for (let col = 0; col < game[0].length; col++) {
        let [x,y,s] = mi_score(game, player, col, seen_direction);
        // console.log(s)
        seen_direction = s;
        total_score1+=x;
        total_score2+=y;
    }
    console.log(total_score1)
    console.log(total_score2)
    // return total_score1-total_score2;
    return total_score1
}

function mi_score(game,player,col, seen_direction){
    let score1 = 0;
    let score2 = 0;
    let start_row = game[0].length-height[col];

    //[derecha,izquierda,abajo,arriba,d1,d1,d2,d2]
    let dx = [1,-1,0,0,-1,1,1,-1]
    let dy = [0,0,1,-1,-1,1,-1,1]

    let flag_adj = 0
    const multiplier = 2;


    let kk = 4;
    for(let k=0; k<game[0].length-start_row; k++){

        const row = k + start_row;
        //const row = 3;
        const chip = game[row][col]
        

       
        for(let i = 0; i < 8; i+=2){
        
            let nr = row;
            let nc = col;

            let cont = 0;
            let k_dir = kk
            let spaces_dir1 = 0;
            let spaces_dir2 = 0; 
            let ty = i/2;

            for(let j = 0; j< 2; j++){
                while(posible_mov(nr,nc)  && game[nr][nc] && !seen_direction[nr][nc][ty][chip-1]){
                    //mejor para el jugador actual
                    
                    if(game[nr][nc] == chip){
                        cont++;
                        seen_direction[nr][nc][ty][chip-1] = 1;
                    }else{
                        break;
                    }
                    
                    nr = nr+dy[i+j];
                    nc = nc+dx[i+j];
                    if(!posible_mov(nr,nc)) break;
                }
                //spaces and no continous chips
                while(posible_mov(nr,nc) && k_dir>0 && !seen_direction[nr][nc][ty][chip-1]){
                    if(!game[nr][nc]){
                        j == 0 ? spaces_dir1++ : spaces_dir2++
                        //seen_direction[nr][nc][ty][chip-1] = 1;

                        // if(ty == 0 && k_dir == kk && nr != game[0].length-1){
                        if(ty == 0 && k_dir == kk ){
                            // if(board[nr+1][nc]){
                            if(nr+1 == game[0].length-height[nc]){
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

            flag = false;
            // console.log([i, cont, spaces_dir1, spaces_dir2])
        }

        //console.log([chip, row, col, chip == 1 ? score1:score2])

    }
    // console.log(seen_direction)
    return [score1, score2, seen_direction]
}

function mi_score2(game,player,col, seen_direction){
    let score1 = 0;
    let score2 = 0;
    let start_row = game[0].length-height[col];

    //[derecha,izquierda,abajo,arriba,d1,d1,d2,d2]
    let dx = [1,-1,0,0,-1,1,1,-1]
    let dy = [0,0,1,-1,-1,1,-1,1]


    let kk = 4;
    for(let k=0; k<game[0].length-start_row; k++){

        const row = k + start_row;
        //const row = 3;
        const chip = game[row][col]
        

       
        for(let i = 0; i < 8; i+=2){
        
            let nr = row;
            let nc = col;

            let cont = 0;
            let k_dir = kk
            let spaces_dir1 = 0;
            let spaces_dir2 = 0; 
            let ty = i/2;
            
            while(posible_mov(nr,nc)  && game[nr][nc] && !seen_direction[nr][nc][ty]){
                // if(nr == 5 && nc == 2){
                //     console.log(seen_direction[nr][nc])
                // }
                //mejor para el jugador actual
                
                if(game[nr][nc] == chip){
                    cont++;
                    seen_direction[nr][nc][ty] = 1;
                }else{
                    break;
                }
                
                nr = nr+dy[i];
                nc = nc+dx[i];
                if(!posible_mov(nr,nc)) break;
            }
            //spaces and no continous chips
            while(posible_mov(nr,nc) && k_dir>0 && !seen_direction[nr][nc][ty]){
                if(!game[nr][nc]){
                    spaces_dir1++;
                    seen_direction[nr][nc][ty] = 1;

                }else{
                    break;
                }
                k_dir--;
                nr = nr+dy[i];
                nc = nc+dx[i];

            }

            //mirar la otra direccion
            nr = row + dy[i+1];
            nc = col + dx[i+1];

            while(posible_mov(nr,nc) && game[nr][nc] && !seen_direction[nr][nc][ty]){

                //mejor para el jugador actual
                if(game[nr][nc] == chip){
                    seen_direction[nr][nc][ty] = 1;

                    cont++;
                }else{
                    break;
                }
                nr = nr+dy[i+1];
                nc = nc+dx[i+1];
                if(!posible_mov(nr,nc)) break;
            }
            k_dir = kk;
            while(posible_mov(nr,nc) && k_dir>0 &&  !seen_direction[nr][nc][ty]){

                if(!game[nr][nc]){
                    seen_direction[nr][nc][ty] = 1;

                    spaces_dir2++;
                }else{
                    break;
                }
                k_dir--;
                nr = nr+dy[i+1];
                nc = nc+dx[i+1];
                //if(!posible_mov(nr,nc)) break;

            }

            if(cont == 2 && (spaces_dir1+spaces_dir2) >= 2){
                chip == 1 ? score1+=1 :score2+=1
                //score1 += 1
            }
            if(cont == 3 && (spaces_dir1+spaces_dir2) >= 1 ){
                chip == 1 ? score1+=5 :score2+=5
                // score1+= 5;
            }
            // console.log([i, cont, spaces_dir1, spaces_dir2])
        }

        console.log([chip, row, col, chip == 1 ? score1:score2])

    }
    // console.log(seen_direction)
    return [score1, score2, seen_direction]
}
    
function move(col, ficha){
    let n = board[0].length-height[col] - 1

    if (col < 0 || col >= columnas) {
        console.error("Columna fuera de los límites.");
        return;
    }
    
    if (n < 0 || n >= filas) {
        console.error("Altura de la columna fuera de los límites.");
        return;
    }
    board[n][col] = ficha;
    height[col]++;
}

function imprimirTablero(tablero) {
    for (let i = 0; i < tablero.length; i++) {
        let fila = '';
        for (let j = 0; j < tablero[i].length; j++) {
            fila += tablero[i][j] + ' ';
        }
        console.log(fila);
    }
}

console.log('Hola')