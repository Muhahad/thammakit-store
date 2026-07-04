import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary server client. Used to (a) sign client-side uploads so the API
 * secret never reaches the browser, and (b) delete images by public_id.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/** Produce a signature for a direct (unsigned-to-signed) browser upload. */
export function signUpload(paramsToSign: Record<string, string | number>) {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: "thammakit/products", ...paramsToSign },
    process.env.CLOUDINARY_API_SECRET!,
  );
  return { signature, timestamp, apiKey: process.env.CLOUDINARY_API_KEY };
}

/** Delete an image after a product/image is removed. */
export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
