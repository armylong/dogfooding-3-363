import { Board } from './board.js';
import { Renderer } from './renderer.js';
import { CellSize, COLS, ROWS, GAME_STATES, SIDES } from './config.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.board = new Board();
        this.currentSide = SIDES.RED;
        this.state = GAME_STATES.PLAYING;
        this.selectedPiece = null;
        this.validMoves = [];
        this.scale = 1;

        this._init();
        this._setupResizeHandler();
    }

    _init() {
        this._resize();
        this._render();
    }

    _setupResizeHandler() {
        window.addEventListener('resize', () => {
            this._resize();
            this._render();
        });
    }

    _resize() {
        // 计算可用的屏幕空间，保留一些边距
        const margin = 20;
        const availableWidth = window.innerWidth - margin * 2;
        const availableHeight = window.innerHeight - margin * 2;

        // 计算基于CellSize的原始画布尺寸（包含足够的边距）
        // 棋盘需要：(COLS-1)个格子 + 左右边距 + 额外边距确保棋子显示完整
        const pieceRadius = CellSize / 2;
        const boardPadding = pieceRadius + 20; // 确保棋子完整显示的边距
        const originalWidth = (COLS - 1) * CellSize + boardPadding * 2;
        const originalHeight = (ROWS - 1) * CellSize + boardPadding * 2 + 60; // 60用于状态栏

        // 计算缩放比例，使棋盘适应屏幕
        const scaleX = availableWidth / originalWidth;
        const scaleY = availableHeight / originalHeight;
        this.scale = Math.min(scaleX, scaleY, 1); // 最大缩放为1（不放大）

        // 设置canvas的实际尺寸
        this.canvas.width = originalWidth * this.scale;
        this.canvas.height = originalHeight * this.scale;

        // 更新renderer的缩放比例
        this.renderer.setScale(this.scale);
    }

    handleClick(x, y) {
        if (this.state !== GAME_STATES.PLAYING) {
            return;
        }

        // 将点击坐标转换为未缩放的坐标
        const unscaledX = x / this.scale;
        const unscaledY = y / this.scale;

        // 获取renderer使用的padding
        const pieceRadius = CellSize / 2;
        const padding = pieceRadius + 20;

        const col = Math.round((unscaledX - padding) / CellSize);
        const row = Math.round((unscaledY - padding) / CellSize);

        if (col < 0 || col >= COLS || row < 0 || row >= ROWS) {
            return;
        }

        const piece = this.board.get(row, col);

        if (this.selectedPiece) {
            const isValidMove = this.validMoves.some(m => m.row === row && m.col === col);
            
            if (isValidMove) {
                this._makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
            } else if (piece && piece.side === this.currentSide) {
                this._selectPiece(row, col, piece);
            } else {
                this._clearSelection();
            }
        } else {
            if (piece && piece.side === this.currentSide) {
                this._selectPiece(row, col, piece);
            }
        }

        this._render();
    }

    _selectPiece(row, col, piece) {
        this.selectedPiece = { row, col, piece };
        this.validMoves = this.board.getValidMoves(row, col, piece);
    }

    _clearSelection() {
        this.selectedPiece = null;
        this.validMoves = [];
    }

    _makeMove(fromRow, fromCol, toRow, toCol) {
        const captured = this.board.get(toRow, toCol);

        // 模拟走子以检查是否会导致将帅见面
        const originalPiece = this.board.grid[fromRow][fromCol];
        const targetPiece = this.board.grid[toRow][toCol];

        // 临时移动
        this.board.grid[toRow][toCol] = originalPiece;
        this.board.grid[fromRow][fromCol] = null;

        // 检查是否将帅见面
        const kingsFacing = this.board.checkKingsFacing();

        // 恢复位置
        this.board.grid[fromRow][fromCol] = originalPiece;
        this.board.grid[toRow][toCol] = targetPiece;

        // 如果将帅见面，禁止此走法
        if (kingsFacing) {
            this._clearSelection();
            return;
        }

        // 执行正式走子
        this.board.move(fromRow, fromCol, toRow, toCol);
        this._clearSelection();

        if (captured && captured.type === 'king') {
            this.state = captured.side === SIDES.RED ? GAME_STATES.BLACK_WIN : GAME_STATES.RED_WIN;
        } else {
            this.currentSide = this.currentSide === SIDES.RED ? SIDES.BLACK : SIDES.RED;
        }
    }

    restart() {
        this.board.reset();
        this.currentSide = SIDES.RED;
        this.state = GAME_STATES.PLAYING;
        this._clearSelection();
        this._render();
    }

    _render() {
        this.renderer.clear();
        this.renderer.drawBoard();
        this.renderer.drawPieces(this.board);
        
        if (this.selectedPiece) {
            this.renderer.drawSelection(this.selectedPiece.row, this.selectedPiece.col);
            this.renderer.drawValidMoves(this.validMoves);
        }

        this.renderer.drawStatus(this.currentSide, this.state);
    }
}
