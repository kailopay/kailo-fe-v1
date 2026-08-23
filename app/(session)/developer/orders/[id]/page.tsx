import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Order",
};

/**
 * Orders are owned by the API client that created them, so a standalone
 * detail page cannot fetch without a pk_test_ key in memory. The playground
 * is the key-holding surface: hand the order id over and let it fetch after
 * the user pastes their key.
 */
export default async function DeveloperOrderPage(
  props: PageProps<"/developer/orders/[id]">,
) {
  const { id } = await props.params;
  redirect(`/developer/playground?order=${encodeURIComponent(id)}`);
}
