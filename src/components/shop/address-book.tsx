"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Address } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { NewAddressForm } from "./new-address-form";
import { DeleteAddressButton } from "./delete-address-button";

/** Address list + collapsible add form for the account area. */
export function AddressBook({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(addresses.length === 0);

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {addresses.map((a) => (
          <li key={a.id} className="flex items-start justify-between gap-3 rounded-lg border p-4 text-sm">
            <div>
              <p className="font-medium">
                {a.fullName} · {a.phone}
                {a.isDefault && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">ที่อยู่หลัก</span>
                )}
              </p>
              <p className="text-muted-foreground">
                {a.line1} ต.{a.subdistrict} อ.{a.district} จ.{a.province} {a.zipcode}
              </p>
            </div>
            <DeleteAddressButton id={a.id} />
          </li>
        ))}
        {addresses.length === 0 && !adding && (
          <li className="text-sm text-muted-foreground">ยังไม่มีที่อยู่</li>
        )}
      </ul>

      {adding ? (
        <NewAddressForm onCreated={() => { setAdding(false); router.refresh(); }} />
      ) : (
        <Button variant="outline" onClick={() => setAdding(true)}>+ เพิ่มที่อยู่ใหม่</Button>
      )}
    </div>
  );
}
