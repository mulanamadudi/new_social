import { json, type LoaderFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";
import { checkAndMarkPlan } from "../billing.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || request.headers.get("x-shopify-shop-domain") || "";
  if (!shop) {
    return json({ error: "shop missing" }, { status: 400 });
  }
  const shopRecord = await prisma.shop.findUnique({ where: { shopDomain: shop } });
  if (!shopRecord) {
    return json({ error: "unknown shop" }, { status: 404 });
  }
  const accounts = await prisma.socialAccount.findMany({
    where: { shopId: shopRecord.id, isActive: true },
    select: { followers: true, likes: true, views: true, posts: true },
  });
  const summary = accounts.reduce(
    (acc, a) => {
      acc.posts += a.posts;
      acc.followers += a.followers;
      acc.likes += a.likes;
      acc.views += a.views;
      return acc;
    },
    { posts: 0, followers: 0, likes: 0, views: 0 }
  );
  const total = summary.followers + summary.likes + summary.views;
  const pendingPlan = await checkAndMarkPlan(shopRecord.shopDomain, total);
  return json({
    metrics: summary,
    pendingPlan,
  });
};
