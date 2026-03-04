import { TRPCError } from "@trpc/server";
import { polar } from "@/lib/polar";
import { env } from "@/lib/env";
import { createTRPCRouter, orgProcedure } from "../init";

export const billingRouter = createTRPCRouter({
  createCheckout: orgProcedure.mutation(async ({ ctx }) => {
    if (!polar || !env.POLAR_PRODUCT_ID) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "결제 시스템이 설정되지 않았습니다",
      });
    }

    const result = await polar.checkouts.create({
      products: [env.POLAR_PRODUCT_ID],
      externalCustomerId: ctx.orgId,
      successUrl: process.env.APP_URL,
    });

    if (!result.url) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "결제 세션 생성에 실패했습니다",
      });
    }

    return { checkoutUrl: result.url };
  }),

  createPortalSession: orgProcedure.mutation(async ({ ctx }) => {
    if (!polar) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "결제 시스템이 설정되지 않았습니다",
      });
    }

    const result = await polar.customerSessions.create({
      externalCustomerId: ctx.orgId,
    });

    if (!result.customerPortalUrl) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "고객 포털 세션 생성에 실패했습니다",
      });
    }

    return { portalUrl: result.customerPortalUrl };
  }),

  getStatus: orgProcedure.query(async ({ ctx }) => {
    // Polar 미설정 시 항상 활성 구독으로 처리 (개발 환경 우회)
    if (!polar) {
      return {
        hasActiveSubscription: true,
        customerId: null,
        estimatedCostCents: 0,
      };
    }

    try {
      const customerState = await polar.customers.getStateExternal({
        externalId: ctx.orgId,
      });

      const hasActiveSubscription =
        (customerState.activeSubscriptions ?? []).length > 0;

      // 모든 활성 구독의 미터에서 예상 비용 합산
      let estimatedCostCents = 0;
      for (const sub of customerState.activeSubscriptions ?? []) {
        for (const meter of sub.meters ?? []) {
          estimatedCostCents += meter.amount ?? 0;
        }
      }

      return {
        hasActiveSubscription,
        customerId: customerState.id,
        estimatedCostCents,
      };
    } catch {
      // Polar에 고객이 아직 존재하지 않음
      return {
        hasActiveSubscription: false,
        customerId: null,
        estimatedCostCents: 0,
      };
    }
  }),
});
