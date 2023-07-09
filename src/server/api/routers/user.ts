import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { z } from 'zod';
import { prisma } from '../../db';

export const userRouter = createTRPCRouter({
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
