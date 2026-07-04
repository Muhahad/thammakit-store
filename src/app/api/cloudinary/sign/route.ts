import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { signUpload } from "@/lib/cloudinary";

/**
 * Return a short-lived Cloudinary upload signature (admin only). The browser
 * uploads directly to Cloudinary with this signature, so the API secret never
 * leaves the server and large files never pass through our functions.
 */
export async function POST() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(signUpload({}));
}
