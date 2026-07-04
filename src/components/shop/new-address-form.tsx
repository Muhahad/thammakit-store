"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { THAI_PROVINCES } from "@/config/provinces";
import { createAddress } from "@/lib/actions/address";

/**
 * Inline Thai-format address form (ชื่อ, เบอร์, ที่อยู่, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์).
 * Calls the createAddress server action; on success invokes `onCreated`.
 */
export function NewAddressForm({ onCreated }: { onCreated: () => void }) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    startTransition(async () => {
      const res = await createAddress({ ...payload, isDefault: payload.isDefault === "on" });
      if (res.error) {
        setErrors(res.error as Record<string, string[]>);
        return;
      }
      toast.success("บันทึกที่อยู่แล้ว");
      onCreated();
    });
  }

  const Field = ({ name, label, type = "text" }: { name: string; label: string; type?: string }) => (
    <div>
      <label htmlFor={name} className="mb-1 block text-xs">{label}</label>
      <input id={name} name={name} type={type} required
        className="h-9 w-full rounded-md border bg-background px-2 text-sm" />
      {errors[name]?.[0] && <p className="mt-1 text-xs text-destructive">{errors[name][0]}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
      <Field name="fullName" label="ชื่อ-นามสกุล" />
      <Field name="phone" label="เบอร์มือถือ" type="tel" />
      <div className="sm:col-span-2"><Field name="line1" label="บ้านเลขที่ / หมู่บ้าน / ซอย / ถนน" /></div>
      <Field name="subdistrict" label="ตำบล / แขวง" />
      <Field name="district" label="อำเภอ / เขต" />
      <div>
        <label htmlFor="province" className="mb-1 block text-xs">จังหวัด</label>
        <select id="province" name="province" required className="h-9 w-full rounded-md border bg-background px-2 text-sm">
          <option value="">เลือกจังหวัด</option>
          {THAI_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        {errors.province?.[0] && <p className="mt-1 text-xs text-destructive">{errors.province[0]}</p>}
      </div>
      <Field name="zipcode" label="รหัสไปรษณีย์" />
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="isDefault" /> ตั้งเป็นที่อยู่หลัก
      </label>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>{pending ? "กำลังบันทึก..." : "บันทึกที่อยู่"}</Button>
      </div>
    </form>
  );
}
