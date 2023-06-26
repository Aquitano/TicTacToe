import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { prisma } from "../../db";

export const ticTacToeRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  joinGame: publicProcedure
    .input(z.object({ gameId: z.string() }))
    .query(({ input }) => {
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        game: prisma.game.findUnique({
          where: {
            id: input.gameId,
          },
        }),
      };
    }),

  createGame: publicProcedure.query(() => {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      game: prisma.game.create({
        data: {
          board: "---------",
          turn: "X",
          winner: "",
        },
      }),
    };
  }),
});
