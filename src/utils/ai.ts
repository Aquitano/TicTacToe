import { checkWinnerByBoard, checkWinnerByHistory } from './gameHelpers';

type InputCheckWinner = Parameters<typeof checkWinnerByHistory>[0];
type Board = string[];

/**
 * Get the next move for the AI.
 *
 * @param {Board} board - The current game board.
 * @param {number} strength - The AI strength level (1-3).
 * @returns {number} - The index of the next move.
 * @throws Will throw an error if there are no empty indices or if the strength level is invalid.
 */
export function getMove(board: Board, strength: number): number {
    const emptyIndices = getEmptyIndices(board);

    if (emptyIndices.length === 0) throw new Error('No empty indices');
    if (strength < 1 || strength > 3) throw new Error('Invalid strength');

    if (strength === 1) return getRandomInt(emptyIndices);

    const winningMove = getWinningMove(board, 'O', emptyIndices);
    if (strength === 2)
        return winningMove !== -1 ? winningMove : getRandomInt(emptyIndices);

    const opponentWinningMove = getWinningMove(board, 'X', emptyIndices);
    if (opponentWinningMove !== -1) return opponentWinningMove;

    const minimaxMove = minimax(board, emptyIndices.length, 'O');
    const index = minimaxMove[0] * 3 + minimaxMove[1];

    if (!emptyIndices.includes(index)) throw new Error('Invalid index');

    return index;
}

/**
 * Get the indices of the empty cells on the board.
 *
 * @param {Board} board - The current game board.
 * @returns {number[]} - The indices of the empty cells.
 */
function getEmptyIndices(board: Board): number[] {
    const indices: number[] = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            indices.push(i);
        }
    }
    return indices;
}

/**
 * Get a random integer from an array.
 *
 * @param {number[]} array - The array to pick a random integer from.
 * @returns {number} - A random integer from the array.
 */
function getRandomInt(array: number[]): number {
    return array[Math.floor(Math.random() * array.length)] as number;
}

/**
 * Get the winning move for a player if it exists.
 *
 * @param {Board} board - The current game board.
 * @param {string} player - The player to check for a winning move ('X' or 'O').
 * @param {number[]} emptyIndices - The indices of the empty cells on the board.
 * @returns {number} - The index of the winning move, or -1 if no winning move exists.
 */
function getWinningMove(
    board: Board,
    player: string,
    emptyIndices: number[],
): number {
    for (const index of emptyIndices) {
        const tempBoard = [...board];
        tempBoard[index] = player; // Place the player's mark temporarily
        if (checkWinnerByBoard(tempBoard) === player) {
            return index;
        }
    }
    return -1;
}

/* *** AI function that choice the best move *** */

/* Function to heuristic evaluation of state. */
function evaluate(state: Board) {
    var score = 0;

    if (checkWinnerByBoard(state) === 'O') {
        score = +1;
    } else if (checkWinnerByBoard(state) === 'X') {
        score = -1;
    } else {
        score = 0;
    }

    return score;
}

function minimax(state: Board, depth: number, player: 'O' | 'X') {
    let best: number[];

    if (player === 'O') {
        best = [-1, -1, -1000];
    } else {
        best = [-1, -1, 1000];
    }

    if (depth === 0 || checkWinnerByBoard(state) === 'O') {
        const score = evaluate(state);
        return [-1, -1, score];
    }

    getEmptyIndices(state).forEach((index) => {
        const x = Math.floor(index / 3);
        const y = index % 3;
        state[x * 3 + y] = player;
        const score = minimax(state, depth - 1, player === 'O' ? 'X' : 'O');
        state[x * 3 + y] = '';

        score[0] = x;
        score[1] = y;

        if (player === 'O') {
            if (score[2] > best[2]) {
                best = score;
            }
        } else {
            if (score[2] < best[2]) {
                best = score;
            }
        }
    });

    return best;
}
/**
 * Check if the game has ended.
 *
 * @param {Array<{ player: string; position: number; time: Date }>} moveHistory - The history of moves.
 * @returns {(string|boolean)} - The winner ('X' or 'O'), 'draw' if the game is a draw, or false if the game is ongoing.
 */
export function checkGameEnd(
    moveHistory: Array<{ player: string; position: number; time: Date }>,
): string | boolean {
    const input: InputCheckWinner = moveHistory.map((move, index) => ({
        id: String(index),
        playerID: move.player,
        position: move.position,
    }));

    const winner = checkWinnerByHistory(input);
    if (winner) {
        return winner;
    }
    if (moveHistory.length === 9) {
        return 'draw';
    }
    return false;
}
