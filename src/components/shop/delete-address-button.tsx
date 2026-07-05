"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteAddress } from "@/lib/actions/address";

/** Delete a saved address (with confirmation). */
export function DeleteAddressButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm("ยืนยันการลบที่อยู่นี้?")) return;
    startTransition(async () => {
      const res = await deleteAddress(id);
      if (res.error) toast.error(res.error);
      else {
        toast.success("ลบที่อยู่แล้ว");
        router.refresh();
      }
    });
  }

  return (
    <Button variant="ghost" size="icon" className="text-destructive" onClick={onClick} disabled={pending} aria-label="ลบที่อยู่">
      <Trash2 className="size-4" />
    </Button>
  );
}
