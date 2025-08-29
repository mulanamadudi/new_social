import { authenticate } from "./shopify.server";

// 🔐 Wird verwendet, um die Script-ID des App Blocks zu speichern
export default async function createAppMetafieldScriptIds(request: Request, scriptIds: string) {
  const { admin } = await authenticate.admin(request);
  const responseCurrentApp = await admin.graphql(`#graphql
    query {
      currentAppInstallation { id }
    }
  `);
  const dataCurrentApp = await responseCurrentApp.json();
  const ownerId = dataCurrentApp.data.currentAppInstallation.id;

  const response = await admin.graphql(
    `#graphql
    mutation CreateAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafieldsSetInput) {
        metafields { id namespace key }
        userErrors { field message }
      }
    }
    `,
    {
      variables: {
        metafieldsSetInput: {
          namespace: "extension",
          value: scriptIds,
          key: "script_ids",
          type: "single_line_text_field",
          ownerId,
        },
      },
    },
  );

  return await response.json();
}

// 📊 Struktur für Social-Proof-Zusammenfassung
export type SocialProofSummary = {
  followers: number;
  likes: number;
  views: number;
  posts: number;
};

// 🔗 Struktur für einzelne Plattformen
export type SocialPlatform = {
  id: string;
  profileUrl: string;
  posts?: number;
  followers?: number;
  likes?: number;
  views?: number;
};

// 🧠 Hauptfunktion zum Speichern der Metafelder inkl. optionaler Plattformen
export async function updateSocialProofMetafields(
  request: Request,
  summary: SocialProofSummary,
  platforms: SocialPlatform[] = [],
) {
  const { admin } = await authenticate.admin(request);
  const currentAppRes = await admin.graphql(`#graphql
    query { currentAppInstallation { id } }
  `);
  const currentAppData = await currentAppRes.json();
  const ownerId = currentAppData.data.currentAppInstallation.id;

  const metafields = [
  {
    namespace: "social_proof",
    key: "follower_count",
    type: "number_integer",
    value: String(summary.followers),
    ownerId,
  },
  {
    namespace: "social_proof",
    key: "like_count",
    type: "number_integer",
    value: String(summary.likes),
    ownerId,
  },
  {
    namespace: "social_proof",
    key: "view_count",
    type: "number_integer",
    value: String(summary.views),
    ownerId,
  },
  {
    namespace: "social_proof",
    key: "post_count",
    type: "number_integer",
    value: String(summary.posts),
    ownerId,
  },
  {
    namespace: "social_proof",
    key: "platforms_json",
    type: "json",
    value: JSON.stringify(platforms),
    ownerId,
  },
];


  const response = await admin.graphql(
    `#graphql
    mutation SetSocialProofMetafields($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id namespace key }
        userErrors { field message }
      }
    }
    `,
    { variables: { metafields } },
  );

  return await response.json();
}
