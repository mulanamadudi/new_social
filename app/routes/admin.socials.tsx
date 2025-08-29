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

  const accounts = await prisma.socialAccount.findMany({
    where: { shopId: shop.id },
    select: {
      platformId: true,
      profileName: true,
      followers: true,
      likes: true,
      views: true,
      posts: true,
      isActive: true,
    },
  });

  // Get API data if in API mode
  const apiData = shop.apiMode ? await prisma.apiData.findMany({
    where: { shopId: shop.id },
    select: {
      platformId: true,
      profileName: true,
      followers: true,
      likes: true,
      views: true,
      posts: true,
      isActive: true,
      lastFetched: true,
    },
  }) : [];

  return json({ 
    accounts, 
    apiData,
    billingPlan: shop.billingPlan, 
    pendingPlan: shop.pendingPlan, 
    pricingUrl,
    apiMode: shop.apiMode,
    hasApiCredentials: !!(shop.youtubeApiKey || shop.facebookAccessToken || shop.instagramAccessToken || shop.tiktokAccessToken || shop.pinterestAccessToken)
  });