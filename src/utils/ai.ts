import { checkWinner } from './gameHelpers';

type InputCheckWinner = Parameters<typeof checkWinner>[0];
type Board = string[];

export function getMove(board: Board): number {
    const emptyIndices = getEmptyIndices(board);
    const randomIndex = getRandomInt(0, emptyIndices.length);

    const output = emptyIndices[randomIndex];
    if (output === undefined) throw new Error('No empty indices');

    return output;
}

function getEmptyIndices(board: Board): number[] {
    const indices: number[] = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            indices.push(i);
        }
    }
    return indices;
}

function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

export function checkGameEnd(
    moveHistory: Array<{ player: string; position: number; time: Date }>,
) {
    const input: InputCheckWinner = {
        moves: moveHistory.map((move, index) => ({
            id: String(index),
            createdAt: move.time,
            playerID: move.player,
            position: move.position,
            gameId: '',
        })),
        createdAt: new Date(),
        id: '',
        gameEnd: null,
        turn: '',
        type: 'AI',
        updatedAt: new Date(),
        winner: null,
    };

    const winner = checkWinner(input);
    if (winner) {
        return winner;
    }
    if (moveHistory.length === 9) {
        return 'draw';
    }
    return false;
}
