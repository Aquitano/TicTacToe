import type { Game, Move } from '@prisma/client';

/**
 * Validates if the game is over.
 * @param {Game} game - The game to check.
 * @returns {string | undefined} The ID of the winner.
 */
export function checkWinner(
    game: Game & { moves: Move[] },
): string | undefined {
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    // Create a game board
    const board = Array(9).fill(null);
    game.moves.forEach((move) => {
        board[move.position] = move.playerID;
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
