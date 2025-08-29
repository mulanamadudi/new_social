import type { MetaFunction } from "@remix-run/node";
import { Page, Layout, Card, BlockStack, Text, InlineStack, Button } from "@shopify/polaris";

export const meta: MetaFunction = () => ([
  { title: "Privacy Policy — Social Media Live Counter" },
  { name: "robots", content: "noindex" },
]);

const LAST_UPDATED = "13 August 2025";

export default function PrivacySocialMediaAccounter() {
  return (
    <Page title="Privacy Policy — Social Media Live Counter" subtitle={`Last updated: ${LAST_UPDATED}`}>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="p">
                This privacy policy explains how we process personal data in connection with the Shopify app
                <strong> “Social Media Live Counter”</strong>.
              </Text>

              <Section title="1) Who we are (Controller)">
                <Text as="p"><strong>BasecapStudio, Owner: Vincent Sahl</strong><br/>
                  Sole proprietorship<br/>
                  Händerlstraße 9, 38304 Wolfenbüttel, Germany<br/>
                  Email: <a href="mailto:info@vincent-sahl.de">info@vincent-sahl.de</a> · Phone: <a href="tel:+4917641980885">+49 176 41980885</a>
                </Text>
                <Text as="p">
                  We are the independent <strong>controller</strong> for the processing described here.
                  Where we handle your store’s customer data strictly on your instructions, we act as your <strong>processor</strong>.
                </Text>
              </Section>

              <Section title="2) Scope of this policy">
                <Text as="p">
                  This policy covers the app and related websites/endpoints we operate. It applies to data about
                  merchants/staff who install or configure the app and to data retrieved from social media accounts
                  that you connect via official APIs.
                </Text>
              </Section>

              <Section title="3) What we process">
                <Text as="p"><strong>3.1 Data from Shopify (merchant side)</strong><br/>
                  When you install the app, Shopify shares store information with us and we obtain an access token via OAuth.
                  We may process: store domain/name, contact email, locale, currency, time zone, plan, app scopes/permissions,
                  owner/staff contact details, and technical data (IP, device/browser metadata, logs).
                </Text>
                <Text as="p"><strong>3.2 Data from connected social networks</strong><br/>
                  If you connect accounts via the official APIs of Instagram, TikTok, X (Twitter), Facebook, Pinterest or YouTube,
                  we process only what is needed to display metrics (e.g., usernames/handles, profile image if provided by the API,
                  follower/like/view counts, post metrics) as well as access/refresh tokens you authorize. We do not publish on your
                  behalf and do not access private messages.
                </Text>
                <Text as="p"><strong>3.3 Analytics and cookies</strong><br/>
                  We use <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google Analytics</a> to measure usage and improve the app.
                  Cookies or similar technologies may be used. Where required, we ask for your consent and enable IP anonymization where available.
                </Text>
              </Section>

              <Section title="4) Purposes and legal bases (GDPR Art. 6)">
                <ul>
                  <li><strong>Contract performance</strong> (Art. 6(1)(b)): install, authenticate, display metrics, support.</li>
                  <li><strong>Legitimate interests</strong> (Art. 6(1)(f)): app security, abuse prevention, product analytics where consent is not legally required.</li>
                  <li><strong>Consent</strong> (Art. 6(1)(a)): non-essential analytics/marketing cookies or where law requires consent. You can withdraw consent at any time.</li>
                  <li><strong>Legal obligations</strong> (Art. 6(1)(c)): bookkeeping, compliance, enforcement.</li>
                </ul>
              </Section>

              <Section title="5) Retention">
                <ul>
                  <li><strong>Social API data & tokens:</strong> kept only as long as needed. On disconnect or uninstallation we delete related data within <strong>30 days</strong> (unless required otherwise by law).</li>
                  <li><strong>Shop/merchant data:</strong> kept for your subscription/use; removed or anonymized within <strong>30 days</strong> after uninstall (billing/accounting data may be retained up to <strong>10 years</strong> under German law).</li>
                  <li><strong>Analytics:</strong> according to tool settings and your consent.</li>
                </ul>
              </Section>

              <Section title="6) Recipients / processors">
                <ul>
                  <li><a href="https://www.shopify.com/legal/privacy" target="_blank" rel="noreferrer">Shopify</a> — app distribution, OAuth, data exchange.</li>
                  <li><a href="https://render.com/privacy" target="_blank" rel="noreferrer">Render.com</a> — hosting for our app and databases.</li>
                  <li><a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google LLC (Google Analytics)</a> — analytics.</li>
                </ul>
                <Text as="p">We may disclose data to authorities where required by law. We do <strong>not sell</strong> personal data.</Text>
              </Section>

              <Section title="7) International data transfers">
                <Text as="p">
                  Where data is transferred outside the EU/EEA/UK (e.g., to the United States),
                  we rely on safeguards such as the EU Standard Contractual Clauses (and the UK Addendum where applicable).
                  You can request more information from us.
                </Text>
              </Section>

              <Section title="8) Your rights (EU/UK GDPR)">
                <Text as="p">
                  You have rights to access, rectification, erasure, restriction, portability, and to object (including against analytics based on legitimate interest),
                  and the right to withdraw consent at any time. You may also lodge a complaint with your supervisory authority.
                </Text>
              </Section>

              <Section title="9) Security">
                <Text as="p">
                  We implement appropriate technical and organizational measures (encryption in transit, access controls, least-privilege, secure hosting and updates).
                  No method of transmission or storage is 100% secure.
                </Text>
              </Section>

              <Section title="10) Children">
                <Text as="p">Our services are not directed to children and we do not knowingly process children’s data.</Text>
              </Section>

              <Section title="11) Shopify and platform terms">
                <Text as="p">
                  Shopify remains an independent controller for data it processes under its own policy.
                  Each connected social network remains responsible for its own platform privacy compliance.
                </Text>
              </Section>

              <Section title="12) Changes">
                <Text as="p">We may update this policy from time to time. The latest version applies.</Text>
              </Section>

              <Section title="Contact">
                <Text as="p"><strong>BasecapStudio, Owner: Vincent Sahl</strong><br/>
                  Händerlstraße 9, 38304 Wolfenbüttel, Germany<br/>
                  Email: <a href="mailto:info@vincent-sahl.de">info@vincent-sahl.de</a> · Phone: <a href="tel:+4917641980885">+49 176 41980885</a>
                </Text>
              </Section>

              <InlineStack align="end">
                <Button url="mailto:info@vincent-sahl.de" variant="primary">Contact us</Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <BlockStack gap="200">
      <Text as="h2" variant="headingMd">{title}</Text>
      <div style={{ lineHeight: 1.6 }}>{children}</div>
    </BlockStack>
  );
}
