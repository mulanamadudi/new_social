import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { deleteShopData } from "../shop.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { shop, topic } = await authenticate.webhook(request);

    switch (topic) {
      case "customers/data_request":
        console.log(`Received customers/data_request for ${shop}`);
        break;
      case "customers/redact":
        console.log(`Received customers/redact for ${shop}`);
        break;
      case "shop/redact":
        await deleteShopData(shop);
        console.log(`Received shop/redact for ${shop}`);
        break;
      default:
        console.log(`Received unknown compliance webhook ${topic} for ${shop}`);
    }
  } catch (error) {
    if (error instanceof Response && error.status === 401) {
      return error;
    }
    throw error;
  }

  return new Response();
};
