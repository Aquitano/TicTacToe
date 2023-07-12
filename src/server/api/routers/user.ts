import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { z } from 'zod';
import { prisma } from '../../db';

export const userRouter = createTRPCRouter({
    /**
     * Fetches a user by ID.
     * @param {object} input - The input data for fetching a user.
     * @param {string} input.id - The ID of the user to fetch.
     * @returns {Promise<object>} The fetched user.
     */
    getUserById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            return {
                user: await prisma.user.findUnique({
                    where: {
                        id: input.id,
                    },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                }),
            };
        }),
});
