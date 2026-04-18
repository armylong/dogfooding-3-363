import { Board } from './board.js';
import { Renderer } from './renderer.js';
import { CELL_SIZE, COLS, ROWS, GAME_STATES, SIDES, PADDING, STATUS_HEIGHT } from './config.js';

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
    }

    _init() {
        this._resize();
        this._render();
    }

    _resize() {
        const baseWidth = (COLS - 1) * CELL_SIZE + PADDING * 2;
        const baseHeight = (ROWS - 1) * CELL_SIZE + PADDING * 2 + STATUS_HEIGHT + 20;

        const scaleX = window.innerWidth / baseWidth;
        const scaleY = window.innerHeight / baseHeight;
        this.scale = Math.min(scaleX, scaleY);

        this.canvas.width = baseWidth * this.scale;
        this.canvas.height = baseHeight * this.scale;

        this.renderer.setScale(this.scale);
    }

    resize() {
        this._resize();
        this._render();
    }

    handleClick(x, y) {
        if (this.state !== GAME_STATES.PLAYING) {
            return;
        }

        const actualX = x / this.scale;
        const actualY = y / this.scale;

        const col = Math.round((actualX - PADDING) / CELL_SIZE);
        const row = Math.round((actualY - PADDING) / CELL_SIZE);

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
        
        this.board.move(fromRow, fromCol, toRow, toCol);
        this._clearSelection();

        if (captured && captured.type === 'king') {
            this.state = captured.side === SIDES.RED ? GAME_STATES.BLACK_WIN : GAME_STATES.RED_WIN;
        } else if (this._isKingsFacing()) {
            this.state = this.currentSide === SIDES.RED ? GAME_STATES.BLACK_WIN : GAME_STATES.RED_WIN;
        } else {
            this.currentSide = this.currentSide === SIDES.RED ? SIDES.BLACK : SIDES.RED;
        }
    }

    _isKingsFacing() {
        let redKingPos = null;
        let blackKingPos = null;

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const piece = this.board.get(row, col);
                if (piece && piece.type === 'king') {
                    if (piece.side === SIDES.RED) {
                        redKingPos = { row, col };
                    } else {
                        blackKingPos = { row, col };
                    }
                }
            }
        }

        if (!redKingPos || !blackKingPos || redKingPos.col !== blackKingPos.col) {
            return false;
        }

        const minRow = Math.min(redKingPos.row, blackKingPos.row);
        const maxRow = Math.max(redKingPos.row, blackKingPos.row);

        for (let row = minRow + 1; row < maxRow; row++) {
            if (this.board.get(row, redKingPos.col)) {
                return false;
            }
        }

        return true;
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
