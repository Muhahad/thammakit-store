import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getUserAddresses } from "@/lib/actions/address";
import { CheckoutForm } from "@/components/shop/checkout-form";

export const metadata: Metadata = { title: "ชำระเงิน", robots: { index: false } };

/**
 * Checkout entry (Server Component). Requires auth (middleware also guards this),
 * loads the user's saved addresses, and hands off to the multi-step client form.
 * The cart itself lives in the client store, so the form reads it there.
 */
export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/checkout");

  const addresses = await getUserAddresses();

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="mb-6 text-2xl font-bold">ชำระเงิน</h1>
      <CheckoutForm addresses={addresses} />
    </div>
  );
}
