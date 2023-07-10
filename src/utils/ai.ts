import { checkWinnerByBoard, checkWinnerByHistory } from './gameHelpers';

type InputCheckWinner = Parameters<typeof checkWinnerByHistory>[0];
type Board = string[];

/**
 * Determines the next move for the AI based on the current game board and AI strength level.
 *
 * @param {Board} board - The current game board.
 * @param {number} strength - The AI strength level (1-3).
 * @returns {number} - The index of the next move.
 * @throws Will throw an error if there are no empty indices or if the strength level is invalid.
 */
export function getMove(board: Board, strength: number): number {
    const emptyIndices = getEmptyIndices(board);

    if (emptyIndices.length === 0) throw new Error('No empty indices');

    let index: number;

    switch (strength) {
        case 1:
            index = getRandomInt(emptyIndices);
            break;
        case 2:
            index = getWinningMove(board, 'O', emptyIndices);
            if (index === -1) index = getRandomInt(emptyIndices);
            break;
        case 3:
            if (emptyIndices.length === 9) {
                index = getRandomInt(emptyIndices);
                break;
            }
            // Check if the opponent has a winning move in the next turn
            const opponentWinningMove = getWinningMove(
                board,
                'X',
                emptyIndices,
            );
            if (opponentWinningMove !== -1) {
                index = opponentWinningMove;
                break;
            }

            const minimaxMove = performMinimax(board, emptyIndices.length, 'O');
            index = minimaxMove[0] * 3 + minimaxMove[1];

            break;
        default:
            throw new Error('Invalid strength');
    }

    // Check if index is a number also in emptyIndices
    if (!emptyIndices.includes(index)) throw new Error('Invalid index');

    return index;
}

/**
 * Returns the indices of the empty cells on the game board.
 *
 * @param {Board} board - The current game board.
 * @returns {number[]} - The indices of the empty cells.
 */
function getEmptyIndices(board: Board): number[] {
    return board.flatMap((value, i) => (value === '' ? i : []));
}

/**
 * Returns a random integer from an array of integers.
 *
 * @param {number[]} array - The array to pick a random integer from.
 * @returns {number} - A random integer from the array.
 */
function getRandomInt(array: number[]): number {
    return array[Math.floor(Math.random() * array.length)] as number;
}

/**
 * Determines the winning move for a player, if it exists.
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
    return (
        emptyIndices.find(
            (index) =>
                checkWinnerByBoard({ ...board, [index]: player }) === player,
        ) ?? -1
    );
}

/**
 * Evaluates the game state and returns a score using a heuristic approach.
 *
 * @param {Board} state - The current game state.
 * @returns {number} - The score of the game state.
 */
function evaluateGameState(state: Board): number {
    const winner = checkWinnerByBoard(state);

    if (winner === 'O') {
        return 1;
    }
    if (winner === 'X') {
        return -1;
    }
    return 0;
}

/**
 * Implements the Minimax algorithm to determine the best move for the AI.
 *
 * @param {Board} state - The current game state.
 * @param {number} depth - The depth of the game tree.
 * @param {'O' | 'X'} player - The current player.
 * @returns {[number, number, number]} - The best move and score.
 */
function performMinimax(
    state: Board,
    depth: number,
    player: 'O' | 'X',
): [number, number, number] {
    // best is an array [x, y, score]
    let best: [number, number, number];

    if (player === 'O') {
        best = [-1, -1, -1000];
    } else {
        best = [-1, -1, 1000];
    }

    if (depth === 0 || checkWinnerByBoard(state) === 'O') {
        const score = evaluateGameState(state);
        return [-1, -1, score];
    }

    getEmptyIndices(state).forEach((index) => {
        const x = Math.floor(index / 3);
        const y = index % 3;
        state[x * 3 + y] = player;
        const score = performMinimax(
            state,
            depth - 1,
            player === 'O' ? 'X' : 'O',
        );
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
