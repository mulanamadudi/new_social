import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: true }; // login-Funktion ist immer vorhanden
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>
          Social Media Counter – Live Proof Bar for Follower & Metrics
        </h1>
        <p className={styles.text}>
          Boost trust & conversions with a dynamic bar that shows your social reach.
          Display total followers, likes, and video views across your channels – all in one smart, animated banner.
        </p>

        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Enter your Shopify store domain</span>
              <input
                className={styles.input}
                type="text"
                name="shop"
                placeholder="your-shop.myshopify.com"
              />
            </label>
            <button className={styles.button} type="submit">
              Connect your store
            </button>
          </Form>
        )}

        <ul className={styles.list}>
          <li>
            <strong>Animated Social Proof</strong>. Watch your numbers climb as customers visit – completely automated or manually controlled.
          </li>
          <li>
            <strong>Fully Customizable</strong>. Choose platforms, upload icons, and set how fast followers count up.
          </li>
          <li>
            <strong>Privacy Friendly</strong>. Stats update once daily – no trackers, no external scripts on the storefront.
          </li>
        </ul>
      </div>
    </div>
  );
}
