import { CellSize, COLS, ROWS, COLORS, PIECE_NAMES } from './config.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.scale = 1;
        // 计算padding以确保棋子完整显示：棋子半径 + 额外边距
        this.pieceRadius = CellSize / 2;
        this.padding = this.pieceRadius + 20;
    }

    setScale(scale) {
        this.scale = scale;
    }

    clear() {
        this.ctx.fillStyle = COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBoard() {
        const { ctx, scale, padding } = this;
        const boardWidth = (COLS - 1) * CellSize;
        const boardHeight = (ROWS - 1) * CellSize;

        // 应用缩放
        ctx.save();
        ctx.scale(scale, scale);

        // 绘制棋盘背景，增加边距确保棋子完整显示
        ctx.fillStyle = COLORS.BOARD;
        ctx.fillRect(padding - 20, padding - 20, boardWidth + 40, boardHeight + 40);

        ctx.strokeStyle = COLORS.LINE;
        ctx.lineWidth = 1;

        // 绘制横线
        for (let i = 0; i < ROWS; i++) {
            if (i === 4 || i === 5) continue; // 跳过楚河汉界中间
            ctx.beginPath();
            ctx.moveTo(padding, padding + i * CellSize);
            ctx.lineTo(padding + boardWidth, padding + i * CellSize);
            ctx.stroke();
        }

        // 绘制楚河汉界两侧的短线
        ctx.beginPath();
        ctx.moveTo(padding, padding + 4 * CellSize);
        ctx.lineTo(padding, padding + 5 * CellSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(padding + boardWidth, padding + 4 * CellSize);
        ctx.lineTo(padding + boardWidth, padding + 5 * CellSize);
        ctx.stroke();

        // 绘制竖线
        for (let i = 0; i < COLS; i++) {
            ctx.beginPath();
            ctx.moveTo(padding + i * CellSize, padding);
            ctx.lineTo(padding + i * CellSize, padding + boardHeight);
            ctx.stroke();
        }

        // 绘制楚河汉界背景
        ctx.fillStyle = COLORS.RIVER;
        ctx.fillRect(padding - 20, padding + 4 * CellSize, boardWidth + 40, CellSize);

        // 绘制楚河汉界文字
        ctx.fillStyle = COLORS.LINE;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('楚 河', padding + boardWidth / 4, padding + 4.5 * CellSize);
        ctx.fillText('汉 界', padding + 3 * boardWidth / 4, padding + 4.5 * CellSize);

        // 绘制九宫格斜线
        this._drawPalace(padding + 3 * CellSize, padding);
        this._drawPalace(padding + 3 * CellSize, padding + 7 * CellSize);

        ctx.restore();
    }

    _drawPalace(x, y) {
        const { ctx } = this;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 2 * CellSize, y + 2 * CellSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + 2 * CellSize, y);
        ctx.lineTo(x, y + 2 * CellSize);
        ctx.stroke();
    }

    drawPieces(board) {
        const { ctx, scale, padding } = this;
        ctx.save();
        ctx.scale(scale, scale);

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const piece = board.get(row, col);
                if (piece) {
                    this._drawPiece(padding + col * CellSize, padding + row * CellSize, piece);
                }
            }
        }

        ctx.restore();
    }

    _drawPiece(x, y, piece) {
        const { ctx } = this;
        const radius = CellSize / 2 - 4;

        // 绘制棋子外圆
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f5deb3';
        ctx.fill();
        ctx.strokeStyle = piece.side === 'red' ? COLORS.RED : COLORS.BLACK;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 绘制棋子内圆
        ctx.beginPath();
        ctx.arc(x, y, radius - 4, 0, Math.PI * 2);
        ctx.strokeStyle = piece.side === 'red' ? COLORS.RED : COLORS.BLACK;
        ctx.lineWidth = 1;
        ctx.stroke();

        // 绘制棋子文字
        ctx.fillStyle = piece.side === 'red' ? COLORS.RED : COLORS.BLACK;
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(PIECE_NAMES[piece.side][piece.type], x, y);
    }

    drawSelection(row, col) {
        const { ctx, scale, padding } = this;
        const x = padding + col * CellSize;
        const y = padding + row * CellSize;
        const radius = CellSize / 2 - 2;

        ctx.save();
        ctx.scale(scale, scale);

        ctx.strokeStyle = COLORS.SELECTED;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    drawValidMoves(moves) {
        const { ctx, scale, padding } = this;
        ctx.save();
        ctx.scale(scale, scale);

        for (const move of moves) {
            const x = padding + move.col * CellSize;
            const y = padding + move.row * CellSize;

            ctx.fillStyle = COLORS.VALID_MOVE;
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawStatus(currentSide, state) {
        const { ctx, scale, padding } = this;
        const boardHeight = (ROWS - 1) * CellSize;
        const statusY = padding + boardHeight + CellSize / 2 + 30;

        ctx.save();
        ctx.scale(scale, scale);

        // 计算状态文字位置（基于原始宽度）
        const originalWidth = (COLS - 1) * CellSize + padding * 2;

        ctx.fillStyle = COLORS.TEXT;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let text = '';
        if (state === 'red_win') {
            text = '红方获胜！';
        } else if (state === 'black_win') {
            text = '黑方获胜！';
        } else {
            text = currentSide === 'red' ? '红方走子' : '黑方走子';
        }

        ctx.fillText(text, originalWidth / 2, statusY);

        ctx.font = '14px Arial';
        ctx.fillText('按 R 重新开始', originalWidth / 2, statusY + 25);

        ctx.restore();
    }
}
