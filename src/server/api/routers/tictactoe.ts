import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { type Move } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '../../db';

type Game = {
  id: string;
  turn: string | null;
  winner: string | null;
  createdAt: Date;
  players: {
    id: string;
    name: string | null;
  }[];
};

/**
 * Fetches a game from the database.
 * @param {string} gameId - The ID of the game to fetch.
 * @returns {Promise<Game | null>} The fetched game.
 */
async function fetchGame(gameId: string): Promise<Game | null> {
  return await prisma.game.findUnique({
    where: { id: gameId },
    select: {
      id: true,
      turn: true,
      winner: true,
      createdAt: true,
      players: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Fetches a game from the database, including moves.
 * @param {string} gameId - The ID of the game to fetch.
 * @returns {Promise<Game & {moves: Array<{playerID: string, position: number, id: string, createdAt: Date}>} | null>} The fetched game.
 */
async function fetchFullGame(gameId: string): Promise<
  | (Game & {
      moves: Array<{
        playerID: string;
        position: number;
        id: string;
        createdAt: Date;
      }>;
    })
  | null
> {
  return prisma.game.findUnique({
    where: { id: gameId },
    select: {
      id: true,
      turn: true,
      winner: true,
      createdAt: true,
      players: {
        select: {
          id: true,
          name: true,
        },
      },
      moves: {
        select: {
          playerID: true,
          position: true,
          id: true,
          createdAt: true,
        },
      },
    },
  });
}

function isGameReadyToStart(game: Game) {
  return game.players.length === 2 && !game.turn;
}

/**
 * Selects a random player from the given array.
 * @param {Array<{id: string, name: string|null}>} players - The array of players.
 * @returns {string | undefined} The ID of the selected player.
 */
function selectRandomPlayer(
  players: Array<{ id: string; name: string | null }>,
): string | undefined {
  const turn = Math.floor(Math.random() * 2);
  return players[turn]?.id;
}

/**
 * Validates if it's the given user's turn in the game.
 * @param {Game} game - The game to check.
 * @param {string} userId - The ID of the user to check.
 * @throws {TRPCError} If it's not the user's turn.
 */
function validateTurn(
  game: Game & { moves: Move[] },
  userId: string,
  input: { position: number; gameId: string },
) {
  if (game.turn !== userId)
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your turn' });

  game.moves.forEach((move) => {
    if (move.position === input.position)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Position already taken',
      });
  });
}

/**
 * Validates if the game is over.
 * @param {Game} game - The game to check.
 * @returns {string | undefined} The ID of the winner.
 */
function checkWinner(game: Game & { moves: Move[] }): string | undefined {
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

/**
 * Creates a move in the game.
 * @param {{gameId: string, position: number}} input - The input data for the move.
 * @param {string} userId - The ID of the user making the move.
 * @returns {Promise<any>} The created move.
 */
async function createMove(
  input: { gameId: string; position: number },
  userId: string,
): Promise<Move> {
  return await prisma.move.create({
    data: {
      game: {
        connect: { id: input.gameId },
      },
      player: {
        connect: { id: userId },
      },
      position: input.position,
    },
  });
}

/**
 * Changes the turn in the game.
 * @param {Game} game - The game to update.
 * @param {string} gameId - The ID of the game.
 */
async function changeTurn(game: Game, gameId: string) {
  const nextPlayerId = game.players.find(
    (player: { id: string; name: string | null }) => player.id !== game.turn,
  )?.id;
  await prisma.game.update({
    where: { id: gameId },
    data: { turn: nextPlayerId },
  });
}

/**
 * Validates if the game has capacity for more players.
 * @param {Game} game - The game to check.
 * @throws {TRPCError} If the game is full.
 */
function validateGameCapacity(game: Game) {
  if (game.players.length >= 2)
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Game is full' });
}

export const ticTacToeRouter = createTRPCRouter({
  joinGame: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const game = await fetchGame(input.gameId);
      if (!game)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Game not found' });

      validateGameCapacity(game);

      // Add player to game
      const updatedGame = await prisma.game.update({
        where: {
          id: input.gameId,
        },
        data: {
          players: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
        select: {
          id: true,
        },
      });

      return {
        game: updatedGame,
      };
    }),

  createGame: protectedProcedure
    .input(
      z.object({
        type: z.enum(['AI', 'PVP']),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        game: await prisma.game.create({
          data: {
            players: {
              connect: {
                id: ctx.session.user.id,
              },
            },
            type: input.type,
          },
          select: {
            id: true,
          },
        }),
      };
    }),

  getGame: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input }) => {
      const game = await fetchGame(input.gameId);
      if (!game)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Game not found' });

      if (isGameReadyToStart(game)) {
        const nextTurn = selectRandomPlayer(game.players);
        if (!nextTurn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Player not found in game ${input.gameId}`,
          });

        // Start game
        await prisma.game.update({
          where: {
            id: input.gameId,
          },
          data: {
            turn: nextTurn,
          },
        });
      }

      return {
        game,
      };
    }),

  getFullGame: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input }) => {
      const game = await fetchFullGame(input.gameId);
      if (!game)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Game not found' });

      return {
        game,
      };
    }),

  getMoves: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input }) => {
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        moves: await prisma.move.findMany({
          where: {
            gameId: input.gameId,
          },
          include: {
            player: true,
          },
        }),
      };
    }),

  makeMove: protectedProcedure
    .input(
      z.object({
        gameId: z.string(),
        position: z.number().min(0).max(8),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const game = await prisma.game.findUnique({
        where: {
          id: input.gameId,
        },
        include: {
          moves: true,
          players: true,
        },
      });
      if (!game)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Game not found' });

      if (game.winner)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Game is already finished',
        });

      validateTurn(game, ctx.session.user.id, input);

      const move = await createMove(input, ctx.session.user.id);

      const updatedGame = {
        ...game,
        moves: [
          ...game.moves,
          { playerID: ctx.session.user.id, position: input.position },
        ],
      } as Game & { moves: Move[] };

      const winner = checkWinner(updatedGame);
      if (winner) {
        await prisma.game.update({
          where: {
            id: input.gameId,
          },
          data: {
            winner,
            turn: undefined,
            gameEnd: new Date(),
          },
        });
      }

      await changeTurn(game, input.gameId);

      return {
        move,
      };
    }),

  getOpenGames: protectedProcedure.query(async () => {
    const games = await prisma.game.findMany({
      where: {
        winner: null,
        gameEnd: null,
        type: 'PVP',
        players: {
          some: {
            id: {
              not: undefined,
            },
          },
        },
      },
      select: {
        id: true,
        players: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(games);

    // One user in the game, no winner
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      games: games.filter((game) => game.players.length === 1),
    };
  }),
});
