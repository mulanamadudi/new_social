import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Card,
  Button,
  Layout,
  Text,
  BlockStack,
  InlineStack,
  Icon,
  Banner,
  Divider,
  Box,
} from "@shopify/polaris";
import { CashDollarIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const storeHandle = session.shop.replace(/\.myshopify\.com$/, "");
  const appHandle = process.env.SHOPIFY_APP_HANDLE || "social-media-counter";
  const pricingUrl = `https://admin.shopify.com/store/${storeHandle}/charges/${appHandle}/pricing_plans`;
  return json({ pricingUrl });
};

export default function Billing() {
  const { pricingUrl } = useLoaderData<typeof loader>();

  const openBilling = () => {
    if (window.top) {
      (window.top as Window).location.href = pricingUrl;
    } else {
      window.location.href = pricingUrl;
    }
  };

  return (
    <Page
      title="Manage Your Subscription"
      subtitle="Upgrade anytime – directly through Shopify"
      fullWidth
    >
      <Layout>
        <Layout.Section>
          <Card padding="600">
            <BlockStack gap="500" align="center">
              {/* Icon-Highlight */}
              <Box paddingBlockStart="400" paddingBlockEnd="200">
                <Icon source={CashDollarIcon} tone="success" />
              </Box>

              <Text as="h2" variant="headingLg" alignment="center">
                Flexible Pricing. Full Control.
              </Text>

              <Text as="p" variant="bodyMd" alignment="center" tone="subdued">
                Choose the best plan for your business growth. Your billing and 
                subscription are fully handled by Shopify for 100% transparency.
              </Text>

              <Divider />

              {/* Premium Banner */}
              <Banner
                tone="success"
                title="Special: 14-day free trial"
              >
                Get full access to all features before you decide.
              </Banner>

              <Divider />

              {/* Call-to-Action */}
              <InlineStack align="center">
                <Button size="large" variant="primary" tone="success" onClick={openBilling}>
                  Open Shopify Billing
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
