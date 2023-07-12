import type { Move } from '@prisma/client';

// Winning combinations for a Tic Tac Toe game
const winningCombinations = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Top left to bottom right
    [2, 4, 6], // Top right to bottom left
];

/**
 * Checks if the game is over by examining the history of moves.
 *
 * @param {Omit<Move, 'gameId' | 'createdAt'>[]} moves - The history of moves.
 * @returns {(string | undefined)} The ID of the winner, or undefined if the game is not over.
 */
export function checkWinnerByHistory(
    moves: Omit<Move, 'gameId' | 'createdAt' | 'aiGameId'>[],
): string | undefined {
    // Create a game board
    const board = Array(9).fill(null);
    moves.forEach((move) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        board[move.position] = move.playerId;
    });

    // Check for a winner
    for (const combination of winningCombinations) {
        const [a, b, c] = combination as [number, number, number];

        // Guard clause to skip this iteration if a, b, or c are not valid indices
        if (a >= board.length || b >= board.length || c >= board.length) {
            continue;
        }

        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return board[a];
        }
    }

    return undefined;
}

/**
 * Checks if the game is over by examining the current state of the board.
 *
 * @param {string[]} board - The current state of the game board.
 * @returns {(string | undefined)} The ID of the winner, or undefined if the game is not over.
 */
export function checkWinnerByBoard(board: string[]): string | undefined {
    // Check for a winner
    for (const combination of winningCombinations) {
        const [a, b, c] = combination as [number, number, number];

        // Guard clause to skip this iteration if a, b, or c are not valid indices
        if (a >= board.length || b >= board.length || c >= board.length) {
            continue;
        }

        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    return undefined;
}
