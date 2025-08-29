import db from "./db.server";

export async function deleteShopData(shopDomain: string) {
  const existingShop = await db.shop.findUnique({ where: { shopDomain } });

  if (existingShop) {
    await db.$transaction([
      db.socialAccount.deleteMany({ where: { shopId: existingShop.id } }),
      db.shop.delete({ where: { id: existingShop.id } }),
    ]);
  }
}

