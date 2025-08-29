import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Card,
  TextField,
  Page,
  Layout,
  Button,
  Banner,
  BlockStack,
  InlineStack,
  Text,
  Box,
  FormLayout,
  Checkbox,
} from "@shopify/polaris";
import { useState, useEffect } from "react";
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

const planThreshold = (plan: BillingPlan): number => {
  switch (plan) {
    case "basic":
      return 1;
    case "pro":
      return 10_000_000;
    case "growth":
      return 100_000_000;
    default:
      return 0;
  }
};

const computePlanClient = (total: number): { plan: BillingPlan; price: number } => {
  if (total >= 100_000_000) return { plan: "growth", price: 7.99 };
  if (total >= 10_000_000) return { plan: "pro", price: 4.99 };
  return { plan: "basic", price: 2.99 };
};

const planRank: Record<BillingPlan, number> = {
  None: 0,
  basic: 1,
  pro: 2,
  growth: 3,
};

const upgradeMessage = (plan: BillingPlan): string =>
  plan === "basic"
    ? "Upgrade to the Basic plan to start saving your social metrics."
    : `You'll need to upgrade to the ${plan} plan to store post, follower, like, and view numbers that together exceed ${planThreshold(plan).toLocaleString()}.`;

const platforms = [
  {
    id: "instagram",
    name: "Instagram",
    icon: InstagramIcon,
    helpText: "Enter your Instagram username (without the full link)",
    placeholder: "username",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: YouTubeIcon,
    helpText: "Enter your YouTube username (without the full link)",
    placeholder: "username",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: TikTokIcon,
    helpText: "Enter your TikTok username (without the full link)",
    placeholder: "username",
  },
  {
    id: "facebook",
    name: "Facebook Page",
    icon: FacebookIcon,
    helpText: "Enter your Facebook page name, not a personal profile",
    placeholder: "page-name",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: PinterestIcon,
    helpText: "Enter your Pinterest username (without the full link)",
    placeholder: "username",
  },
  {
    id: "x",
    name: "X",
    icon: XIcon,
    helpText: "Enter your X username (without the full link)",
    placeholder: "username",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { session, admin } = await authenticate.admin(request);

  const storeHandle = session.shop.replace(/\.myshopify\.com$/, "");
  const appHandle = process.env.SHOPIFY_APP_HANDLE || "social-media-counter";
  const pricingUrl = `https://admin.shopify.com/store/${storeHandle}/charges/${appHandle}/pricing_plans`;

  const shop = await prisma.shop.upsert({
    where: { shopDomain: session.shop },
    update: {},
    create: {
      shopDomain: session.shop,
      scope: session.scope ?? undefined,
      installedAt: new Date(),
      billingPlan: "None",
    },
  });
  const platforms = await prisma.platform.findMany();
  console.log("📦 Alle Plattformen aus der Datenbank:");
  console.table(platforms);

  try {
    const activePlan = await fetchCurrentBillingPlan(admin as any);
    if (activePlan !== shop.billingPlan) {
      await prisma.shop.update({
        where: { shopDomain: session.shop },
        data: { billingPlan: activePlan, pendingPlan: null },
      });
      shop.billingPlan = activePlan;
    }
  } catch (err) {
    console.error("Failed to sync billing plan", err);
  }
  console.log(`💳 Current plan for ${session.shop}: ${shop.billingPlan}`);

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

  return json({ accounts, billingPlan: shop.billingPlan, pendingPlan: shop.pendingPlan, pricingUrl });
}


export async function action({ request }: ActionFunctionArgs) {
  console.log("✅ action() called");
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const confirm = formData.get("confirmPlan");
  if (confirm && typeof confirm === "string") {
    await prisma.shop.update({
      where: { shopDomain: session.shop },
      data: { billingPlan: confirm as BillingPlan, pendingPlan: null },
    });
    return json({ success: true });
  }
  const raw = formData.get("accounts");

  if (!raw || typeof raw !== "string") {
    return json({ success: false, error: "Missing or invalid data." }, { status: 400 });
  }

  let accounts;
  try {
    accounts = JSON.parse(raw);
  } catch {
    return json({ success: false, error: "Invalid JSON format." }, { status: 400 });
  }

  const sanitizeName = (name: string) => name.trim().replace(/^@/, "");

  const sanitizedAccounts = accounts.map((account: any) => {
    const max = Number.MAX_VALUE;
    const toNumber = (v: any) => {
      const n = parseFloat(v);
      return !isFinite(n) || n < 0 ? 0 : Math.min(n, max);
    };
    const cleanName = sanitizeName(account.profileName ?? "");
    return {
      platformId: account.platformId,
      profileName: cleanName,
      followers: toNumber(account.followers),
      likes: toNumber(account.likes),
      views: toNumber(account.views),
      posts: toNumber(account.posts),
      isActive: !!account.isActive,
    };
  });

  const summary = sanitizedAccounts.reduce(
    (
      acc: { posts: number; followers: number; likes: number; views: number },
      entry: any,
    ) => {
      if (entry.isActive) {
        acc.posts += Number(entry.posts) || 0;
        acc.followers += Number(entry.followers) || 0;
        acc.likes += Number(entry.likes) || 0;
        acc.views += Number(entry.views) || 0;
      }
      return acc;
    },
    { posts: 0, followers: 0, likes: 0, views: 0 },
  );

  const totalMetric =
    summary.posts + summary.followers + summary.likes + summary.views;
  const { plan, price } = computePlan(totalMetric);
  const shop = await prisma.shop.findUnique({ where: { shopDomain: session.shop } });
  console.log(
    `💡 Metrics total ${totalMetric}. Current plan: ${shop?.billingPlan}. Required plan: ${plan}`,
  );
  let pendingPlan: BillingPlan | null = null;
  if (shop) {
    const currentThreshold = thresholdForPlan(shop.billingPlan);
    const newThreshold = thresholdForPlan(plan as BillingPlan);
    if (newThreshold > currentThreshold) {
      pendingPlan = plan as BillingPlan;
    }
  }

  if (pendingPlan) {
    await prisma.shop.update({
      where: { shopDomain: session.shop },
      data: { lastTotalMetric: totalMetric, pendingPlan },
    });
    return json({ success: false, planChange: { from: shop?.billingPlan, to: plan, price } });
  }

  for (const account of sanitizedAccounts) {
    if (!account.platformId) continue;
    const existing = await prisma.socialAccount.findFirst({
      where: {
        shop: { shopDomain: session.shop },
        platformId: account.platformId,
      },
    });

    const baseData = {
      profileName: account.profileName,
      followers: account.followers,
      likes: account.likes,
      views: account.views,
      posts: account.posts,
      isActive: account.isActive,
    };

    if (existing) {
      await prisma.socialAccount.update({
        where: { id: existing.id },
        data: baseData,
      });
    } else if (account.profileName) {
      const shop = await prisma.shop.upsert({
        where: { shopDomain: session.shop },
        update: {},
        create: {
          shopDomain: session.shop,
          scope: session.scope ?? undefined,
          installedAt: new Date(),
          billingPlan: "None",
        },
      });

      await prisma.socialAccount.create({
        data: {
          ...baseData,
          shopId: shop.id,
          platformId: account.platformId,
        },
      });
    }
  }

  const activePlatforms = sanitizedAccounts
    .filter((entry: any) => entry.isActive && entry.profileName.trim())
    .map((entry: any) => {
      const cleanName = sanitizeName(entry.profileName);
      return {
        id: entry.platformId,
        profileUrl: generatePlatformUrl(entry.platformId, cleanName),
        posts: Number(entry.posts) || 0,
        followers: Number(entry.followers) || 0,
        likes: Number(entry.likes) || 0,
        views: Number(entry.views) || 0,
      };
    });

  await updateSocialProofMetafields(request, summary, activePlatforms);
  await prisma.shop.update({
    where: { shopDomain: session.shop },
    data: { lastTotalMetric: totalMetric, pendingPlan: null },
  });

  return json({ success: true });
}

function generatePlatformUrl(platformId: string, profileName: string): string {
  const name = profileName.trim().replace(/^@/, "");
  switch (platformId) {
    case "instagram":
      return `https://instagram.com/${name}`;
    case "youtube":
      return `https://www.youtube.com/@${name}`;
    case "tiktok":
      return `https://tiktok.com/@${name}`;
    case "facebook":
      return `https://facebook.com/${name}`;
    case "pinterest":
      return `https://pinterest.com/${name}`;
    case "x":
      return `https://x.com/${name}`;
    default:
      return "";
  }
}


export default function AdminSocials() {
  const loaderData = useLoaderData<typeof loader>();
  const accounts = loaderData?.accounts ?? [];
  const { billingPlan, pendingPlan, pricingUrl } = loaderData;
  const fetcher = useFetcher();
  const planFetcher = useFetcher<typeof loader>();
  const [currentPlan, setCurrentPlan] = useState<BillingPlan>(billingPlan);
  const [currentPending, setCurrentPending] = useState<BillingPlan | null>(pendingPlan);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null);
  type PlanChange = { from?: BillingPlan; to: BillingPlan; price: number };
  const [planChange, setPlanChange] = useState<PlanChange | null>(null);

  useEffect(() => {
    if (fetcher.data) {
      const data = fetcher.data as any;
      if (data.planChange) {
        setPlanChange(data.planChange as PlanChange);
      } else if (data.success) {
        setPlanChange(null);
      }
      if (typeof data.success === "boolean") {
        setSaveStatus(data.success ? "success" : "error");
      }
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (planFetcher.data) {
      const d = planFetcher.data as any;
      if (d.billingPlan) {
        setCurrentPlan(d.billingPlan as BillingPlan);
      }
      if ("pendingPlan" in d) {
        setCurrentPending(d.pendingPlan as BillingPlan | null);
      }
    }
  }, [planFetcher.data]);

  useEffect(() => {
    // When the plan or pending plan changes, remove any outdated upgrade prompts
    setPlanChange(null);
  }, [currentPlan, currentPending]);

  useEffect(() => {
    const handleFocus = () => {
      planFetcher.load("/admin/socials");
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [planFetcher]);

  const [formState, setFormState] = useState(() =>
    platforms.map((p) => {
      const existing = accounts.find((a) => a.platformId === p.id);
      return {
        platformId: p.id,
        profileName: existing?.profileName ?? "",
        followers: existing ? String(existing.followers) : "",
        likes: existing ? String(existing.likes) : "",
        views: existing ? String(existing.views) : "",
        posts: existing ? String(existing.posts) : "",
        isActive: existing ? existing.isActive : false,
      };
    })
  );

  const summary = formState.reduce(
    (acc, entry) => {
      if (entry.isActive) {
        acc.posts += Number(entry.posts) || 0;
        acc.followers += Number(entry.followers) || 0;
        acc.likes += Number(entry.likes) || 0;
        acc.views += Number(entry.views) || 0;
      }
      return acc;
    },
    { posts: 0, followers: 0, likes: 0, views: 0 }
  );

  const totalMetric =
    summary.posts + summary.followers + summary.likes + summary.views;
  const { plan: requiredPlan, price: requiredPrice } =
    computePlanClient(totalMetric);
  const dynamicPlanChange: PlanChange | null =
    planRank[requiredPlan] > planRank[currentPlan]
      ? { from: currentPlan, to: requiredPlan, price: requiredPrice }
      : null;
  const displayPlanChange = planChange ?? dynamicPlanChange;
  const updateField = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    setFormState((prev) => {
      const updated = [...prev];
      if (typeof value === "string" && ["followers", "likes", "views", "posts"].includes(field)) {
        let newVal = value.trim();
        const num = Number(newVal);
        if (!newVal || isNaN(num) || num < 0 || num > Number.MAX_VALUE) {
          newVal = "0";
        }
        updated[index] = { ...updated[index], [field]: newVal };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    formState.forEach((entry, index) => {
      if (entry.isActive) {
        if (!entry.profileName.trim()) {
          newErrors[`profileName-${index}`] = "This field is required";
        }

        (["followers", "likes", "views", "posts"] as const).forEach((field) => {
          const value = Number(entry[field]);
          if (isNaN(value) || value < 0 || value > Number.MAX_VALUE) {
            newErrors[`${field}-${index}`] = "Must be a positive number";
          }
        });
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToPricing = () => {
    if (window.top) {
      (window.top as Window).location.href = pricingUrl;
    } else {
      window.location.href = pricingUrl;
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    const formData = new FormData();
    formData.append("accounts", JSON.stringify(formState));

    try {
      setSaveStatus(null);
      fetcher.submit(formData, {
        method: "post",
        action: "/admin/socials",
      });
    } catch (err) {
      console.error("❌ Save failed:", err);
      setSaveStatus("error");
    }
  };
  console.log("🔎 accounts loaded:", accounts);


  return (
  <Page title="Social Media Counter - Live Proof Bar for Follower & Metrics">
    <Layout>
      <Layout.Section>
        <BlockStack gap="400">
          {currentPending && !displayPlanChange && (
            <Banner
              tone="info"
              title="Upgrade required"
              action={{ content: `Upgrade to ${currentPending}`, onAction: goToPricing }}
            >
              <p>{upgradeMessage(currentPending)}</p>
            </Banner>
          )}
          {displayPlanChange && (
            <Banner
              tone="warning"
              title="Upgrade required"
              action={{
                content: `Switch to ${displayPlanChange.to}`,
                onAction: goToPricing,
              }}
            >
              <p>{upgradeMessage(displayPlanChange.to)}</p>
            </Banner>
          )}
          <Card>
            <Box padding="400">
            <InlineStack gap="400" wrap>
              {/* Posts */}
              <div style={{ flex: "1 1 0", minWidth: "0%" }}>
                <BlockStack gap="100" align="center">
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <PlatformsIcon width={32} height={32} style={{ fill: "#45C081" }} />
                  </div>
                  <Text as="p" variant="headingLg" fontWeight="bold" alignment="center">
                    {summary.posts.toLocaleString()}
                  </Text>
                    <Text as="span" variant="headingMd" alignment="center">
                      Posts
                    </Text>
                </BlockStack>
              </div>

              {/* Followers */}
              <div style={{ flex: "1 1 0", minWidth: "0%" }}>
                <BlockStack gap="100" align="center">
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <PersonIcon width={32} height={32} style={{ fill: "#45C081" }}/>
                  </div>
                  <Text as="p" variant="headingLg" fontWeight="bold" alignment="center">
                    {summary.followers.toLocaleString()}
                  </Text>
                    <Text as="span" variant="headingMd" alignment="center">
                      Followers
                    </Text>
                </BlockStack>
              </div>

              {/* Likes */}
              <div style={{ flex: "1 1 0", minWidth: "0%" }}>
                <BlockStack gap="100" align="center">
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <HeartIcon width={32} height={32} style={{ fill: "#45C081" }}/>
                  </div>
                  <Text as="p" variant="headingLg" fontWeight="bold" alignment="center">
                    {summary.likes.toLocaleString()}
                  </Text>
                    <Text as="span" variant="headingMd" alignment="center">
                      Likes
                    </Text>
                </BlockStack>
              </div>

              {/* Views */}
              <div style={{ flex: "1 1 0", minWidth: "0%" }}>
                <BlockStack gap="100" align="center">
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <PlayIcon width={32} height={32} style={{ fill: "#45C081" }}/>
                  </div>
                  <Text as="p" variant="headingLg" fontWeight="bold" alignment="center">
                    {summary.views.toLocaleString()}
                  </Text>
                    <Text as="span" variant="headingMd" alignment="center">
                      Views
                    </Text>
                </BlockStack>
              </div>
            </InlineStack>

          </Box>

          </Card>
                    <Banner>
            <details>
              <summary style={{ cursor: "pointer", fontWeight: "bold", textDecoration: "underline"}}>
                Setup Instructions
              </summary>
              <div style={{ marginTop: "0.5em", lineHeight: "1.6" }}>
                <p>📊 To get started, please visit each of your social media accounts and add up or estimate your total number of posts, followers, likes, and video views. Then simply enter those numbers below.</p>
                <br />
                {/* --- NEUER HINWEIS + LINK --- */}
                <p>
                  🚀 <strong>Final step:</strong> Once you’ve added your social media accounts and
                  saved, please go to your{" "}
                  <b
                    style={{ color: "#45C081", fontWeight: "bold" }}
                  >
                    Theme Editor
                  </b>{" "}
                  to enable and place the <em>Social Media Live Counter</em> app block in
                  your store’s theme. 
                </p>
                <p>
                  👉 In the Theme Editor, open the section where you want the bar to
                  appear (e.g. footer or homepage) and add the <em>Social Media
                  Live Counter</em> block. Once saved, it will be live on your store.
                </p>
                <br/>
                <summary style={{ cursor: "pointer", fontWeight: "bold", textDecoration: "underline"}}>
                  Additional informations
                </summary>
                <p>⚙️ We’re currently working on automated API integrations for all major platforms to make this process fully automatic in the future. The more people use and support the app, the faster we can deliver these features.</p>
                <br/>
                <p>🌟 If you're finding the app helpful, a positive review in the Shopify App Store goes a long way in helping us grow. Plus, early users who get started now will keep their current lower pricing – even as we roll out new premium features.</p>
                <br/>
                <p>❤️ Thanks for being part of the journey – your support helps shape what's next.</p>
              </div>
            </details>
          </Banner>
          {formState.map((entry, index) => {
            const platform = platforms.find((p) => p.id === entry.platformId)!;
            const IconComponent = platform.icon;

            return (
              <Card key={entry.platformId}>
                <Box padding="400" position="relative">
                  <div style={{ position: "absolute", top: 0, left: 0}}>
                    <Checkbox
                      label=""
                      checked={entry.isActive}
                      onChange={(val) => updateField(index, "isActive", val)}
                    />
                  </div>

                  <BlockStack gap="300">
                    <InlineStack align="center" gap="200">
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div>
                        <IconComponent width={32} height={32}/>
                      </div>
                      <div style={{color:"#45C081"}}>
                        <Text as="h3" variant="headingSm">
                          {platform.name}
                        </Text>
                      </div>
                    </div>
                    </InlineStack>

                    <FormLayout>
                      <TextField
                        label="Profile name"
                        placeholder={platform.placeholder}
                        value={entry.profileName}
                        onChange={(val) =>
                          updateField(index, "profileName", val)
                        }
                        helpText={platform.helpText}
                        error={errors[`profileName-${index}`]}
                        disabled={!entry.isActive}
                        autoComplete="off"
                      />
                      <TextField
                        label="Posts"
                        type="number"
                        min={0}
                        value={entry.posts}
                        onChange={(val) =>
                          updateField(index, "posts", val)
                        }
                        error={errors[`posts-${index}`]}
                        disabled={!entry.isActive}
                        autoComplete="off"
                      />
                      <TextField
                        label="Followers"
                        type="number"
                        min={0}
                        value={entry.followers}
                        onChange={(val) =>
                          updateField(index, "followers", val)
                        }
                        error={errors[`followers-${index}`]}
                        disabled={!entry.isActive}
                        autoComplete="off"
                      />
                      <TextField
                        label="Likes"
                        type="number"
                        min={0}
                        value={entry.likes}
                        onChange={(val) =>
                          updateField(index, "likes", val)
                        }
                        error={errors[`likes-${index}`]}
                        disabled={!entry.isActive}
                        autoComplete="off"
                      />
                      <TextField
                        label="Video views"
                        type="number"
                        min={0}
                        value={entry.views}
                        onChange={(val) =>
                          updateField(index, "views", val)
                        }
                        error={errors[`views-${index}`]}
                        disabled={!entry.isActive}
                        autoComplete="off"
                      />
                    </FormLayout>
                  </BlockStack>
                </Box>
              </Card>
            );
          })}

          {saveStatus === "success" && (
            <Banner tone="success">
              <p>Changes saved successfully.</p>
            </Banner>
          )}
          {saveStatus === "error" && (
            <Banner tone="critical">
              <p>Could not save changes. {displayPlanChange && (<b>You first need to upgrade your plan.</b>)}</p>
            </Banner>
          )}
          {displayPlanChange && (
            <Banner
              tone="warning"
              title="Upgrade required"
              action={{
                content: `Switch to ${displayPlanChange.to}`,
                onAction: goToPricing,
              }}
            >
              <p>{upgradeMessage(displayPlanChange.to)}</p>
            </Banner>
          )}
          <Box paddingBlockStart="400">
            <Button variant="primary" onClick={handleSave}>
              Save changes
            </Button>
          </Box>
        </BlockStack>
      </Layout.Section>
    </Layout>
    <ReviewPopup />
  </Page>
  );
}
