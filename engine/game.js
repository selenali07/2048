// 2048 MODEL 
// ty aaron/chris for teaching this during 401 and lecture <3

export default class Game {
    onMoveCallback = [];
    onLoseCallback = [];
    onWinCallback = [];
    constructor(size) {
        this.board = new Array(size * size).fill(0);
        this.score = 0;
        this.won = false;
        this.over = false;
        this.addTile();
        this.addTile();
        this.size = size;
        this.gameState = {
            board: this.board,
            score: this.score,
            won: this.won,
            over: this.over
        }
    }

    setupNewGame() {
        this.board = new Array(this.size * this.size).fill(0);
        this.addTile();
        this.addTile();
        this.score = 0;
        this.won = false;
        this.over = false;
        this.size = this.size;
        this.gameState = {
            board: this.board,
            score: this.score,
            won: this.won,
            over: this.over
        }
    }

    loadGame(gameState) {
        this.board = gameState.board;
        this.score = gameState.score;
        this.won = gameState.won;
        this.over = gameState.over;
        this.gameState = gameState;
    }

    move(direction) { // Attempts to move the board in a given direction
        let og = [...this.board];
        let shifted = [];
        if (direction == 'right') {
            shifted = this.flipEW(this.board);
            shifted = this.moveWest(shifted);
            shifted = this.flipEW(shifted);
            this.board = shifted;
        } else if (direction == 'left') {
            shifted = this.board;
            shifted = this.moveWest(shifted);
            this.board = shifted;
        } else if (direction == 'up') {
            shifted = this.flipNW(this.board);
            shifted = this.moveWest(shifted);
            shifted = this.flipNW(shifted);
            this.board = shifted;
        } else if (direction == 'down') {
            shifted = this.flipNW(this.board);
            shifted = this.flipEW(shifted);
            shifted = this.moveWest(shifted);
            shifted = this.flipEW(shifted);
            shifted = this.flipNW(shifted);
            this.board = shifted;
        }
        var is_same = (og.length == this.board.length) && this.board.every(function (elt, idx) {
            return elt === og[idx];
        });
        if (!is_same) {
            this.addTile();
        }
        for (let cur in this.onMoveCallback) {
            this.onMoveCallback[cur](this.gameState);
        }
        this.isWin();
        this.isLoss();
        this.update();
    }

    toString() {
        let string = "";
        let i = 0;
        string += `score: ${this.score} won: ${this.won} over: ${this.over}\n`;
        this.board.forEach(tile => {
            string += `[${tile}]`
            if (i % this.size == this.size - 1) {
                string += '\n';
            }
            i++;
        });
        return string;
    }

    onMove(callback) {
        this.onMoveCallback.push(callback);
    }

    onLose(callback) {
        this.onLoseCallback.push(callback);
    }

    onWin(callback) {
        this.onWinCallback.push(callback);
    }

    getGameState() {
        return this.gameState;
    }

    // helper functions

    addTile() {
        let empty = [];
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] == 0) {
                empty.push(i);
            }
        }
        if (empty.length > 0) {
            let tile = empty[Math.floor(Math.random() * empty.length)];
            (Math.random(1) > 0.1 ? this.board[tile] = 2 : this.board[tile] = 4);
        }
    }
    update() {
        this.gameState = {
            board: this.board,
            score: this.score,
            won: this.won,
            over: this.over
        }
    }
    isWin() {
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] == 2048) {
                if (!this.won) {
                    this.won = true;
                    for (let cur in this.onWinCallback) {
                        this.onWinCallback[cur](this.gameState);
                    }
                }
            }
        }
    }
    isLoss() { 
        let loserRow = this.board.slice(0);
        let loserCol = this.flipNW(loserRow);
        if (this.isFull(loserRow)) { // checks if has valid moveset for combining ver or hor
            for (let i = 0; i < loserRow.length; i += this.size) {
                let row = loserRow.slice(i, i + this.size);
                let col = loserCol.slice(i, i + this.size);
                if (this.isValid(row) || this.isValid(col)) { 
                    return false;
                }
            }
            this.over = true;
            for (let cur in this.onLoseCallback) {
                this.onLoseCallback[cur](this.gameState);
            }
            return true;
        }
        return false;
    }
    isValid(row) {
        for (let i = 0; i < row.length - 1; i++) {
            if (row[i] == row[i + 1]) {
                return true;
            }
        }
        return false;
    }
    isFull(board) {
        for (let i = 0; i < board.length; i++) {
            if (board[i] == 0) {
                return false;
            }
        }
        return true;
    }
    flipNW(board) { // Transposes the board matrix swaps rows and col
        let newB = [];
        for (let i = 0; i < this.size; i++) {
            let temp = [];
            for (let j = 0; j < this.size; j++) {
                temp = temp.concat(board.slice(j * this.size + i, j * this.size + i + 1)); // j * this.size + i converts 1d to 2d
            }
            newB.push(...temp);
        }
        return newB;
    }
    flipEW(board) { // Flips the board matrix about the y-axis (interchanges east and west)
        let newB = [];
        for (let i = 0; i < board.length; i += this.size) {
            newB.push(...(board.slice(i, i + this.size).reverse()));
        }
        return newB;
    }
    moveWest(board) {
        let newB = board;
        for (let i = 0; i < newB.length; i += this.size) {
            let row = newB.splice(i, this.size);
            let arr = row.filter(val => val);
            let zeros = Array(this.size - arr.length).fill(0)
            let newRow = arr.concat(zeros);
            newRow = this.combine(newRow);
            newB.splice(i, 0, ...newRow);
        }
        return newB;
    }
    combine(row) {
        let arr = [];
        let merged = false;
        for (let i = 0; i < row.length; i++) {
            if ((i == row.length - 1) && !merged) {
                arr.push(row[i]);
                merged = false;
                break;
            }
            if (!merged && row[i] == row[i + 1]) {
                arr.push(row[i] + row[i + 1]);
                this.score += row[i] + row[i + 1];
                merged = true;
            } else if (merged) {
                merged = false;
            } else {
                arr.push(row[i]);
                merged = false;
            }
        }
        let zeros = new Array(this.size - arr.length).fill(0);
        return arr.concat(zeros);
    }
}