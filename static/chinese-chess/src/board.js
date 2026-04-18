import { COLS, ROWS, PIECES, SIDES } from './config.js';

export class Board {
    constructor() {
        this.grid = [];
        this.reset();
    }

    reset() {
        this.grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
        
        this._placePieces(SIDES.BLACK, 0);
        this._placePieces(SIDES.RED, 9);
    }

    _placePieces(side, baseRow) {
        const direction = side === SIDES.BLACK ? 1 : -1;
        const backRow = baseRow;
        const pawnRow = baseRow + direction * 3;

        this.grid[backRow][0] = { type: PIECES.ROOK, side };
        this.grid[backRow][1] = { type: PIECES.KNIGHT, side };
        this.grid[backRow][2] = { type: PIECES.BISHOP, side };
        this.grid[backRow][3] = { type: PIECES.ADVISOR, side };
        this.grid[backRow][4] = { type: PIECES.KING, side };
        this.grid[backRow][5] = { type: PIECES.ADVISOR, side };
        this.grid[backRow][6] = { type: PIECES.BISHOP, side };
        this.grid[backRow][7] = { type: PIECES.KNIGHT, side };
        this.grid[backRow][8] = { type: PIECES.ROOK, side };

        this.grid[backRow + direction * 2][1] = { type: PIECES.CANNON, side };
        this.grid[backRow + direction * 2][7] = { type: PIECES.CANNON, side };

        for (let col = 0; col < 9; col += 2) {
            this.grid[pawnRow][col] = { type: PIECES.PAWN, side };
        }
    }

    get(row, col) {
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
            return null;
        }
        return this.grid[row][col];
    }

    move(fromRow, fromCol, toRow, toCol) {
        this.grid[toRow][toCol] = this.grid[fromRow][fromCol];
        this.grid[fromRow][fromCol] = null;
    }

    /**
     * 检查将帅是否见面（在同一列且中间无棋子）
     * @returns {boolean} 如果将帅见面返回true
     */
    checkKingsFacing() {
        let redKingPos = null;
        let blackKingPos = null;

        // 查找双方老将位置
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const piece = this.grid[row][col];
                if (piece && piece.type === PIECES.KING) {
                    if (piece.side === SIDES.RED) {
                        redKingPos = { row, col };
                    } else {
                        blackKingPos = { row, col };
                    }
                }
            }
        }

        // 如果找不到老将，返回false
        if (!redKingPos || !blackKingPos) {
            return false;
        }

        // 检查是否在同一列
        if (redKingPos.col !== blackKingPos.col) {
            return false;
        }

        // 检查中间是否有棋子
        const minRow = Math.min(redKingPos.row, blackKingPos.row);
        const maxRow = Math.max(redKingPos.row, blackKingPos.row);

        for (let row = minRow + 1; row < maxRow; row++) {
            if (this.grid[row][redKingPos.col] !== null) {
                return false; // 中间有棋子阻挡
            }
        }

        return true; // 将帅见面
    }

    /**
     * 查找指定方的老将位置
     * @param {string} side - 方色（red/black）
     * @returns {Object|null} 老将位置 {row, col} 或 null
     */
    findKing(side) {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const piece = this.grid[row][col];
                if (piece && piece.type === PIECES.KING && piece.side === side) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    getValidMoves(row, col, piece) {
        const moves = [];
        
        switch (piece.type) {
            case PIECES.KING:
                this._getKingMoves(row, col, piece, moves);
                break;
            case PIECES.ADVISOR:
                this._getAdvisorMoves(row, col, piece, moves);
                break;
            case PIECES.BISHOP:
                this._getBishopMoves(row, col, piece, moves);
                break;
            case PIECES.KNIGHT:
                this._getKnightMoves(row, col, piece, moves);
                break;
            case PIECES.ROOK:
                this._getRookMoves(row, col, piece, moves);
                break;
            case PIECES.CANNON:
                this._getCannonMoves(row, col, piece, moves);
                break;
            case PIECES.PAWN:
                this._getPawnMoves(row, col, piece, moves);
                break;
        }

        return moves;
    }

    _isValidPosition(row, col) {
        return row >= 0 && row < ROWS && col >= 0 && col < COLS;
    }

    _canMoveTo(row, col, side) {
        const piece = this.get(row, col);
        return !piece || piece.side !== side;
    }

    _getKingMoves(row, col, piece, moves) {
        const palace = piece.side === SIDES.RED ? { minRow: 7, maxRow: 9 } : { minRow: 0, maxRow: 2 };
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow >= palace.minRow && newRow <= palace.maxRow && newCol >= 3 && newCol <= 5) {
                if (this._canMoveTo(newRow, newCol, piece.side)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    }

    _getAdvisorMoves(row, col, piece, moves) {
        const palace = piece.side === SIDES.RED ? { minRow: 7, maxRow: 9 } : { minRow: 0, maxRow: 2 };
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow >= palace.minRow && newRow <= palace.maxRow && newCol >= 3 && newCol <= 5) {
                if (this._canMoveTo(newRow, newCol, piece.side)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    }

    _getBishopMoves(row, col, piece, moves) {
        const boundary = piece.side === SIDES.RED ? 5 : 4;
        const directions = [[2, 2], [2, -2], [-2, 2], [-2, -2]];
        const blocks = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

        for (let i = 0; i < directions.length; i++) {
            const [dr, dc] = directions[i];
            const [br, bc] = blocks[i];
            const newRow = row + dr;
            const newCol = col + dc;
            const blockRow = row + br;
            const blockCol = col + bc;

            const validRow = piece.side === SIDES.RED ? newRow >= boundary : newRow <= boundary;

            if (this._isValidPosition(newRow, newCol) && validRow) {
                if (!this.get(blockRow, blockCol) && this._canMoveTo(newRow, newCol, piece.side)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    }

    _getKnightMoves(row, col, piece, moves) {
        // 马的8种走法（日字形）：横向2格纵向1格 或 横向1格纵向2格
        const jumps = [
            { dr: -2, dc: -1, br: -1, bc: 0 },  // 上左上
            { dr: -2, dc: 1, br: -1, bc: 0 },   // 上右上
            { dr: 2, dc: -1, br: 1, bc: 0 },    // 下左下
            { dr: 2, dc: 1, br: 1, bc: 0 },     // 下右下
            { dr: -1, dc: -2, br: 0, bc: -1 },  // 左上左
            { dr: -1, dc: 2, br: 0, bc: 1 },    // 右上右
            { dr: 1, dc: -2, br: 0, bc: -1 },   // 左下左
            { dr: 1, dc: 2, br: 0, bc: 1 }      // 右下右
        ];

        for (const jump of jumps) {
            const newRow = row + jump.dr;
            const newCol = col + jump.dc;
            const blockRow = row + jump.br;
            const blockCol = col + jump.bc;

            // 检查目标位置是否有效
            if (!this._isValidPosition(newRow, newCol)) {
                continue;
            }

            // 检查马脚（绊马腿）位置是否有效且没有棋子
            if (!this._isValidPosition(blockRow, blockCol)) {
                continue;
            }

            // 检查马脚是否有棋子阻挡
            if (this.get(blockRow, blockCol)) {
                continue;
            }

            // 检查目标位置是否可以移动（空位或敌方棋子）
            if (this._canMoveTo(newRow, newCol, piece.side)) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    }

    _getRookMoves(row, col, piece, moves) {
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        for (const [dr, dc] of directions) {
            let newRow = row + dr;
            let newCol = col + dc;

            while (this._isValidPosition(newRow, newCol)) {
                const target = this.get(newRow, newCol);
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.side !== piece.side) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                newRow += dr;
                newCol += dc;
            }
        }
    }

    _getCannonMoves(row, col, piece, moves) {
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        for (const [dr, dc] of directions) {
            let newRow = row + dr;
            let newCol = col + dc;
            let jumped = false;

            while (this._isValidPosition(newRow, newCol)) {
                const target = this.get(newRow, newCol);
                if (!jumped) {
                    if (!target) {
                        moves.push({ row: newRow, col: newCol });
                    } else {
                        jumped = true;
                    }
                } else {
                    if (target) {
                        if (target.side !== piece.side) {
                            moves.push({ row: newRow, col: newCol });
                        }
                        break;
                    }
                }
                newRow += dr;
                newCol += dc;
            }
        }
    }

    _getPawnMoves(row, col, piece, moves) {
        const forward = piece.side === SIDES.RED ? -1 : 1;
        const crossed = piece.side === SIDES.RED ? row <= 4 : row >= 5;

        const newRow = row + forward;
        if (this._isValidPosition(newRow, col) && this._canMoveTo(newRow, col, piece.side)) {
            moves.push({ row: newRow, col: col });
        }

        if (crossed) {
            for (const dc of [-1, 1]) {
                const newCol = col + dc;
                if (this._isValidPosition(row, newCol) && this._canMoveTo(row, newCol, piece.side)) {
                    moves.push({ row: row, col: newCol });
                }
            }
        }
    }
}
