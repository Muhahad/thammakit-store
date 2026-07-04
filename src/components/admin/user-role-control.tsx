"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateUserRole } from "@/lib/actions/admin-users";

/**
 * Promote/demote a user. Disabled for the current admin's own row (they can't
 * demote themselves — enforced again server-side).
 */
export function UserRoleControl({
  userId,
  role,
  isSelf,
}: {
  userId: string;
  role: Role;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const nextRole: Role = role === "ADMIN" ? "CUSTOMER" : "ADMIN";

  function onClick() {
    startTransition(async () => {
      const res = await updateUserRole(userId, nextRole);
      if (res.error) {
        toast.error(res.error === "FORBIDDEN" ? "ไม่มีสิทธิ์" : res.error);
        return;
      }
      toast.success(nextRole === "ADMIN" ? "ตั้งเป็นแอดมินแล้ว" : "ถอดเป็นลูกค้าแล้ว");
      router.refresh();
    });
  }

  if (isSelf) {
    return <span className="text-xs text-muted-foreground">คุณ</span>;
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={pending}>
      {role === "ADMIN" ? "ถอดเป็นลูกค้า" : "ตั้งเป็นแอดมิน"}
    </Button>
  );
}
