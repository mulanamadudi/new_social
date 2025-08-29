import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import prisma from "./db.server";
import type { BillingPlan } from "@prisma/client";

export type PlanInfo = {
  plan: "basic" | "pro" | "growth";
  price: number;
};

export function computePlan(total: number): PlanInfo {
  if (total >= 100_000_000) return { plan: "growth", price: 7.99 };
  if (total >= 10_000_000) return { plan: "pro", price: 4.99 };
  return { plan: "basic", price: 2.99 };
}

export function thresholdForPlan(plan: BillingPlan): number {
  switch (plan) {
    case "None":
      return 0;
    case "basic":
      // Basic plan should be considered an upgrade from having no plan
      // so return a positive threshold to differentiate from "None"
      return 1;
    case "pro":
      return 10_000_000;
    case "growth":
      return 100_000_000;
    default:
      return 0;
  }
}

export async function updateShopTotals(shopDomain: string, total: number) {
  await prisma.shop.update({
    where: { shopDomain },
    data: { lastTotalMetric: total },
  });
}

export async function checkAndMarkPlan(shopDomain: string, total: number) {
  const { plan } = computePlan(total);
  const shop = await prisma.shop.findUnique({ where: { shopDomain } });
  let pendingPlan: BillingPlan | null = null;
  if (shop) {
    const currentThreshold = thresholdForPlan(shop.billingPlan);
    const newThreshold = thresholdForPlan(plan as BillingPlan);
    if (newThreshold > currentThreshold) {
      pendingPlan = plan as BillingPlan;
    }
  }
  await prisma.shop.update({
    where: { shopDomain },
    data: { lastTotalMetric: total, pendingPlan },
  });
  return pendingPlan;
}

export async function fetchCurrentBillingPlan(
  admin: AdminApiContext,
): Promise<BillingPlan> {
  const response = await admin.graphql(`
    {
      currentAppInstallation {
        activeSubscriptions {
          name
        }
      }
    }
  `);
  const json = await response.json();
  const name =
    json?.data?.currentAppInstallation?.activeSubscriptions?.[0]?.name || null;
  if (!name) return "None";
  const normalized = (name as string).toLowerCase();
  switch (normalized) {
    case "basic":
      return "basic";
    case "pro":
      return "pro";
    case "growth":
      return "growth";
    default:
      return "None";
  }
}
