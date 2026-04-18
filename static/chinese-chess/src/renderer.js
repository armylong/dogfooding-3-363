import { CELL_SIZE, COLS, ROWS, COLORS, PIECE_NAMES, PADDING, STATUS_HEIGHT } from './config.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.scale = 1;
    }

    setScale(scale) {
        this.scale = scale;
    }

    clear() {
        this.ctx.fillStyle = COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBoard() {
        const padding = PADDING;
        const boardWidth = (COLS - 1) * CELL_SIZE;
        const boardHeight = (ROWS - 1) * CELL_SIZE;

        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);

        this.ctx.fillStyle = COLORS.BOARD;
        this.ctx.fillRect(padding - 20, padding - 20, boardWidth + 40, boardHeight + 40);

        this.ctx.strokeStyle = COLORS.LINE;
        this.ctx.lineWidth = 1;

        for (let i = 0; i < ROWS; i++) {
            if (i === 4 || i === 5) continue;
            this.ctx.beginPath();
            this.ctx.moveTo(padding, padding + i * CELL_SIZE);
            this.ctx.lineTo(padding + boardWidth, padding + i * CELL_SIZE);
            this.ctx.stroke();
        }

        this.ctx.beginPath();
        this.ctx.moveTo(padding, padding + 4 * CELL_SIZE);
        this.ctx.lineTo(padding, padding + 5 * CELL_SIZE);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(padding + boardWidth, padding + 4 * CELL_SIZE);
        this.ctx.lineTo(padding + boardWidth, padding + 5 * CELL_SIZE);
        this.ctx.stroke();

        for (let i = 0; i < COLS; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(padding + i * CELL_SIZE, padding);
            this.ctx.lineTo(padding + i * CELL_SIZE, padding + boardHeight);
            this.ctx.stroke();
        }

        this.ctx.fillStyle = COLORS.RIVER;
        this.ctx.fillRect(padding - 20, padding + 4 * CELL_SIZE, boardWidth + 40, CELL_SIZE);

        this.ctx.fillStyle = COLORS.LINE;
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('楚 河', padding + boardWidth / 4, padding + 4.5 * CELL_SIZE);
        this.ctx.fillText('汉 界', padding + 3 * boardWidth / 4, padding + 4.5 * CELL_SIZE);

        this._drawPalace(padding + 3 * CELL_SIZE, padding);
        this._drawPalace(padding + 3 * CELL_SIZE, padding + 7 * CELL_SIZE);

        this.ctx.restore();
    }

    _drawPalace(x, y) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + 2 * CELL_SIZE, y + 2 * CELL_SIZE);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x + 2 * CELL_SIZE, y);
        this.ctx.lineTo(x, y + 2 * CELL_SIZE);
        this.ctx.stroke();
    }

    drawPieces(board) {
        const padding = PADDING;

        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const piece = board.get(row, col);
                if (piece) {
                    this._drawPiece(padding + col * CELL_SIZE, padding + row * CELL_SIZE, piece);
                }
            }
        }

        this.ctx.restore();
    }

    _drawPiece(x, y, piece) {
        const radius = CELL_SIZE / 2 - 4;

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#f5deb3';
        this.ctx.fill();
        this.ctx.strokeStyle = piece.side === 'red' ? COLORS.RED : COLORS.BLACK;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius - 4, 0, Math.PI * 2);
        this.ctx.strokeStyle = piece.side === 'red' ? COLORS.RED : COLORS.BLACK;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        this.ctx.fillStyle = piece.side === 'red' ? COLORS.RED : COLORS.BLACK;
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(PIECE_NAMES[piece.side][piece.type], x, y);
    }

    drawSelection(row, col) {
        const padding = PADDING;
        const x = padding + col * CELL_SIZE;
        const y = padding + row * CELL_SIZE;
        const radius = CELL_SIZE / 2 - 2;

        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);

        this.ctx.strokeStyle = COLORS.SELECTED;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawValidMoves(moves) {
        const padding = PADDING;

        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);

        for (const move of moves) {
            const x = padding + move.col * CELL_SIZE;
            const y = padding + move.row * CELL_SIZE;

            this.ctx.fillStyle = COLORS.VALID_MOVE;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 10, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    drawStatus(currentSide, state) {
        const padding = PADDING;
        const boardHeight = (ROWS - 1) * CELL_SIZE;
        const statusY = padding + boardHeight + 20 + STATUS_HEIGHT / 2;

        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);

        this.ctx.fillStyle = COLORS.TEXT;
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        let text = '';
        if (state === 'red_win') {
            text = '红方获胜！';
        } else if (state === 'black_win') {
            text = '黑方获胜！';
        } else {
            text = currentSide === 'red' ? '红方走子' : '黑方走子';
        }

        const baseWidth = (COLS - 1) * CELL_SIZE + PADDING * 2;
        this.ctx.fillText(text, baseWidth / 2, statusY);

        this.ctx.font = '14px Arial';
        this.ctx.fillText('按 R 重新开始', baseWidth / 2, statusY + 20);

        this.ctx.restore();
    }
}
