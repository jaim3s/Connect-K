import numpy as np

class Board:
    def __init__(self, n=1):
        self.n = n
        self.columns = [0]*n
        self.board = np.zeros(shape=(n,n))

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

def get_score(board, offsets, col):
    score1,score2 = 0, 0
    for offset in offsets:
        row = board.n-board.columns[col]
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
            if cnt1 and cnt2 == 0:
                score1 += cnt1
            if cnt2 and cnt1 == 0:
                score2 += cnt2
    return score1, score2 

def heuristic(board, offsets):
    total_score1, total_score2 = 0, 0
    for col in range(board.n):
        x, y = get_score(board, offsets, col)
        total_score1+=x
        total_score2+=y

    print(total_score1, total_score2)
    return total_score1-total_score2

def main():
    n = 7
    board = Board(7) 
    generate_board("44444441", board)
    print(board.board)
    offsets = generate_offsets(4)
    print(heuristic(board, offsets))
if __name__ == "__main__":
    main()
