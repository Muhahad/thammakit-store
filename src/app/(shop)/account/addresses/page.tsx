import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getUserAddresses } from "@/lib/actions/address";
import { AddressBook } from "@/components/shop/address-book";

export const metadata: Metadata = { title: "ที่อยู่ของฉัน", robots: { index: false } };

/** Manage saved shipping addresses (add / delete, Thai format). */
export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/addresses");
  const addresses = await getUserAddresses();

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-bold">ที่อยู่ของฉัน</h1>
      <AddressBook addresses={addresses} />
    </div>
  );
}
