import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "../../db";

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

async function fetchGame(gameId: string) {
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

async function fetchFullGame(gameId: string) {
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

function selectRandomPlayer(players: any[]): string {
  const turn = Math.floor(Math.random() * 2);
  return players[turn]?.id;
}

function validateTurn(game: Game, userId: string) {
  if (game.turn !== userId) throw new Error("Not your turn");
}

async function createMove(input: any, userId: string) {
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

async function changeTurn(game: Game, gameId: string) {
  const nextPlayerId = game.players.find(
    (player: any) => player.id !== game.turn
  )?.id;
  await prisma.game.update({
    where: { id: gameId },
    data: { turn: nextPlayerId },
  });
}

function validateGameCapacity(game: Game) {
  if (game.players.length >= 2) throw new Error("Game is full");
}

export const ticTacToeRouter = createTRPCRouter({
  joinGame: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const game = await fetchGame(input.gameId);
      if (!game) throw new Error("Game not found");

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

  createGame: protectedProcedure.mutation(async ({ ctx }) => {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      game: await prisma.game.create({
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
      }),
    };
  }),

  getGame: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input }) => {
      const game = await fetchGame(input.gameId);
      if (!game) throw new Error("Game not found");

      if (isGameReadyToStart(game)) {
        const nextTurn = selectRandomPlayer(game.players);
        if (!nextTurn)
          throw new Error(`Player not found in game ${input.gameId}`);

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
      if (!game) throw new Error("Game not found");

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
      })
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
      if (!game) throw new Error("Game not found");

      validateTurn(game, ctx.session.user.id);

      const move = await createMove(input, ctx.session.user.id);

      await changeTurn(game, input.gameId);

      return {
        move,
      };
    }),
});
