import numpy as np

class Board:
    def __init__(self, n=1):
        self.n = n
        self.columns = [0]*n
        self.board = np.zeros(shape=(n,n))

def f1_scores(n):
    lst= []
    for i in range(n):
        if i < n//2:
            lst.append(10*(i+1))
        else:
            lst.append(10*(n-i)) 
    return lst

def generate_board(sequence, board):
    for i in range(len(sequence)):
        col = int(sequence[i])-1
        board.board[board.n-board.columns[col]-1][col] = 1 + i%2 
        board.columns[col] += 1

def generate_offsets(k):
    offsets = []
    for i in range(k):
        # Column
        offsets.append([(-j+i, 0) for j in range(k)])
        # Row 
        offsets.append([(0, -j+i) for j in range(k)])
        # Right-Left diagonal
        offsets.append([(-j+i, -j+i) for j in range(k)])
        # Left-Right diagonal
        offsets.append([(-j+i, j-i) for j in range(k)])
    return offsets

def get_score(board, offsets, col, one_chip_scores):
    score1, score2 = 0, 0
    for k in range(0, board.n):
        row = board.n-board.columns[col]+k
        for offset in offsets:
            flag = 0 
            for i, j in offset:
                if 0 <= row+i <= board.n-1 and 0 <= col+j <= board.n-1:
                    flag +=1  
                else:
                    break
            if flag == len(offset):
                cnt1, cnt2 = 0, 0
                for i, j in offset:
                    if board.board[row+i][col+j] == 1:
                        cnt1 += 1
                    elif board.board[row+i][col+j] == 2:
                        cnt2 += 1
                # Add cnt1 to score1 player
                if cnt1 and cnt2 == 0:
                    # Get the features
                    score1 += cnt1
                if cnt2 and cnt1 == 0:
                    # Get the features
                    score2 += cnt2
    return score1, score2 

def heuristic(board, offsets, one_chip_scores):
    total_score1, total_score2 = 0, 0
    for col in range(board.n):
        x, y = get_score(board, offsets, col, one_chip_scores)
        total_score1+=x
        total_score2+=y

    print(total_score1, total_score2)
    return total_score1-total_score2
def connected_four(position):
    # Horizontal check
    m = position & (position >> 7)
    print(position>>7)
    if m & (m >> 14):
        return True
    # Diagonal \
    m = position & (position >> 6)
    if m & (m >> 12):
        return True
    # Diagonal /
    m = position & (position >> 8)
    if m & (m >> 16):
        return True
    # Vertical
    m = position & (position >> 1)
    if m & (m >> 2):
        return True
    # Nothing found
    return False

def main():
    n = 7
    board = Board(n) 
    one_chip_scores = f1_scores(n)
    generate_board("44533353", board)
    print(board.board)
    print(one_chip_scores)
    offsets = generate_offsets(4)
    print(get_score(board, offsets,4, one_chip_scores))
    print(heuristic(board, offsets, one_chip_scores))

    res = int("0000000001000000100000010000001000000000000000000", 2)
    print(res)
    print(res>>7)
    print(connected_four(res))
    print(f1_scores(n))

if __name__ == "__main__":
    main()

    