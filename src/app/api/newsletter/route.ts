import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

/**
 * Newsletter subscribe endpoint. Rate-limited per IP to prevent abuse.
 * Persist to a `NewsletterSubscriber` table or forward to your ESP (Resend
 * audiences, Mailchimp) here — kept as a validated stub.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`newsletter:${ip}`, 5, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  // TODO: persist parsed.data.email (subscribe to ESP audience).
  return NextResponse.json({ ok: true });
}
