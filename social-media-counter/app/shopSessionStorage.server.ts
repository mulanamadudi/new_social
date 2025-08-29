import type { SessionStorage } from "@shopify/shopify-app-session-storage";
import { Session } from "@shopify/shopify-api";
import prisma from "./db.server";

export class PrismaShopSessionStorage implements SessionStorage {
  async storeSession(session: Session): Promise<boolean> {
    await prisma.shop.upsert({
      where: { shopDomain: session.shop },
      update: {
        scope: session.scope ?? undefined,
      },
      create: {
        shopDomain: session.shop,
        scope: session.scope ?? undefined,
        installedAt: session.expires ?? new Date(),
      },
    });
    return true;
  }

  async loadSession(id: string): Promise<Session | undefined> {
    const shopDomain = id.replace(/^offline_/, "");
    const shop = await prisma.shop.findUnique({ where: { shopDomain } });
    if (!shop) return undefined;
    return new Session({
      id,
      shop: shop.shopDomain,
      state: "",
      isOnline: false,
      scope: shop.scope ?? undefined,
      expires: undefined,
    });
  }

  async deleteSession(id: string): Promise<boolean> {
    const shopDomain = id.replace(/^offline_/, "");
    await prisma.shop.delete({ where: { shopDomain } }).catch(() => {});
    return true;
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    await Promise.all(ids.map((id) => this.deleteSession(id)));
    return true;
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    const session = await this.loadSession(`offline_${shop}`);
    return session ? [session] : [];
  }
}
