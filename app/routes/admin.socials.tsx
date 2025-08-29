import {
  InstagramIcon,
  YouTubeIcon,
  TikTokIcon,
  FacebookIcon,
  PinterestIcon,
  XIcon,
  PlatformsIcon,
  PersonIcon,
  HeartIcon,
  PlayIcon,
} from "../components/Icons";

import "@shopify/polaris/build/esm/styles.css";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import { updateSocialProofMetafields } from "../metafields.server";
import {
  computePlan,
  fetchCurrentBillingPlan,
  thresholdForPlan,
} from "../billing.server";
import type { BillingPlan } from "@prisma/client";
import ReviewPopup from "../components/ReviewPopup";
import { fetchAllPlatformStats } from "../services/socialMediaApi.server";

export async function action({ request }: ActionFunctionArgs) {
  console.log("✅ action() called");
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  // Handle API mode toggle
  const toggleApiMode = formData.get("toggleApiMode");
  if (toggleApiMode) {
    const shop = await prisma.shop.findUnique({ where: { shopDomain: session.shop } });
    if (shop && (shop.billingPlan === "pro" || shop.billingPlan === "growth")) {
      await prisma.shop.update({
        where: { shopDomain: session.shop },
        data: { apiMode: !shop.apiMode },
      });
      return json({ success: true, apiModeToggled: true });
    }
    return json({ success: false, error: "API mode only available for Pro and Growth plans" });
  }

  // Handle API credentials update
  const updateCredentials = formData.get("updateCredentials");
  if (updateCredentials) {
    const credentials = {
      youtubeApiKey: formData.get("youtubeApiKey") as string || null,
      facebookAccessToken: formData.get("facebookAccessToken") as string || null,
      instagramAccessToken: formData.get("instagramAccessToken") as string || null,
      tiktokAccessToken: formData.get("tiktokAccessToken") as string || null,
      pinterestAccessToken: formData.get("pinterestAccessToken") as string || null,
    };

    await prisma.shop.update({
      where: { shopDomain: session.shop },
      data: credentials,
    });
    return json({ success: true, credentialsUpdated: true });
  }

  // Handle fetch API data
  const fetchApiData = formData.get("fetchApiData");
  if (fetchApiData) {
    const shop = await prisma.shop.findUnique({ 
      where: { shopDomain: session.shop },
      include: { socialLinks: true }
    });
    
    if (!shop || (shop.billingPlan !== "pro" && shop.billingPlan !== "growth")) {
      return json({ success: false, error: "API mode only available for Pro and Growth plans" });
    }

    const credentials = {
      youtubeApiKey: shop.youtubeApiKey || undefined,
      facebookAccessToken: shop.facebookAccessToken || undefined,
      instagramAccessToken: shop.instagramAccessToken || undefined,
      tiktokAccessToken: shop.tiktokAccessToken || undefined,
      pinterestAccessToken: shop.pinterestAccessToken || undefined,
    };

    const activePlatforms = shop.socialLinks
      .filter(account => account.isActive && account.profileName.trim())
      .map(account => ({
        platformId: account.platformId,
        profileName: account.profileName,
      }));

    const apiResults = await fetchAllPlatformStats(credentials, activePlatforms);
    const errors: string[] = [];

    // Store API data in database
    for (const [platformId, result] of Object.entries(apiResults)) {
      if ('error' in result) {
        errors.push(`${platformId}: ${result.error}`);
        continue;
      }

      const platformAccount = shop.socialLinks.find(acc => acc.platformId === platformId);
      if (!platformAccount) continue;

      await prisma.apiData.upsert({
        where: {
          shopId_platformId: {
            shopId: shop.id,
            platformId: platformId,
          },
        },
        update: {
          followers: result.followers,
          likes: result.likes,
          views: result.views,
          posts: result.posts,
          lastFetched: new Date(),
          profileName: platformAccount.profileName,
        },
        create: {
          shopId: shop.id,
          platformId: platformId,
          profileName: platformAccount.profileName,
          followers: result.followers,
          likes: result.likes,
          views: result.views,
          posts: result.posts,
          lastFetched: new Date(),
          isActive: true,
        },
      });
    }

    return json({ 
      success: errors.length === 0, 
      apiDataFetched: true,
      errors: errors.length > 0 ? errors : undefined
    });
  }

  const confirm = formData.get("confirmPlan");