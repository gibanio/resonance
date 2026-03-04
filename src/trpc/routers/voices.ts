import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";
import { deleteAudio } from "@/lib/r2";
import { createTRPCRouter, orgProcedure } from "../init";

export const voicesRouter = createTRPCRouter({
  getAll: orgProcedure
    .input(
      z
        .object({
          query: z.string().trim().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const searchFilter = input?.query
        ? {
          OR: [
            { 
              name: { 
                contains: input.query, mode: "insensitive" as const
              } 
            },
            {
              description: {
                contains: input.query,
                mode: "insensitive" as const,
              },
            },
          ],
        }
        : {};

      const [custom, system] = await Promise.all([
        prisma.voice.findMany({
          where: {
            variant: "CUSTOM",
            orgId: ctx.orgId,
            ...searchFilter,
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            language: true,
            variant: true,
          },
        }),
        prisma.voice.findMany({
          where: {
            variant: "SYSTEM",
            ...searchFilter,
          },
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            language: true,
            variant: true,
          },
        }),
      ]);

      return { custom, system };
    }),

    delete: orgProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const voice = await prisma.voice.findUnique({
          where: {
            id: input.id,
            variant: "CUSTOM",
            orgId: ctx.orgId,
          },
          select: { id: true, r2ObjectKey: true },
        });

        if (!voice) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "음성을 찾을 수 없습니다",
          });
        }

        await prisma.voice.delete({ where: { id: voice.id } });

        if (voice.r2ObjectKey) {
          // 프로덕션에서는 백그라운드 작업, 재시도, 크론 작업 등을 고려
          await deleteAudio(voice.r2ObjectKey).catch(() => {});
        }

        return { success: true };
      }),
});
