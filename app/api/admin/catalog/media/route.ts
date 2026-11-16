import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/authorization";
import { AppError, throwDatabaseError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";
import { approvedPublicMediaUrl } from "@/lib/utils/public-media";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_FILE_BYTES + 128 * 1024;
const uploadResponseSchema = z.object({
  asset_id: z.string().min(1),
  public_id: z.string().min(1),
  secure_url: z.url(),
  format: z.enum(["jpg", "jpeg", "png", "webp"]),
  width: z.number().int().positive().max(8000),
  height: z.number().int().positive().max(8000),
  bytes: z.number().int().positive().max(MAX_FILE_BYTES),
});

type ImageFile = { extension: "jpg" | "png" | "webp"; mimeType: string };

function identifyImage(bytes: Uint8Array): ImageFile | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { extension: "jpg", mimeType: "image/jpeg" };
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return { extension: "png", mimeType: "image/png" };
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return { extension: "webp", mimeType: "image/webp" };
  }
  return null;
}

function jsonResponse(body: object, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function readBoundedBody(request: Request) {
  if (!request.body) throw new AppError("VALIDATION_ERROR", "Choose an image to upload.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_REQUEST_BYTES) {
      await reader.cancel();
      throw new AppError("VALIDATION_ERROR", "Choose an image smaller than 10 MB.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (!origin || origin !== new URL(request.url).origin) {
      throw new AppError("FORBIDDEN", "The upload request could not be verified.");
    }

    const contentLengthHeader = request.headers.get("content-length");
    const contentLength = contentLengthHeader === null ? null : Number(contentLengthHeader);
    if (contentLengthHeader !== null && (!Number.isSafeInteger(contentLength) || contentLength === 0 || (contentLength ?? 0) > MAX_REQUEST_BYTES)) {
      throw new AppError("VALIDATION_ERROR", "Choose an image smaller than 10 MB.");
    }

    const staff = await requirePermission("products.manage");
    let form: FormData;
    try {
      const body = await readBoundedBody(request);
      form = await new Request(request.url, { method: "POST", headers: request.headers, body }).formData();
    } catch {
      throw new AppError("VALIDATION_ERROR", "The uploaded image could not be read.");
    }
    const file = form.get("file");
    const altText = form.get("altText");
    if (!(file instanceof File) || typeof altText !== "string" || !altText.trim() || altText.trim().length > 180) {
      throw new AppError("VALIDATION_ERROR", "Choose an image and enter descriptive alt text.");
    }
    if (file.size === 0 || file.size > MAX_FILE_BYTES) {
      throw new AppError("VALIDATION_ERROR", "Choose an image smaller than 10 MB.");
    }
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    const image = identifyImage(fileBytes);
    if (!image) {
      throw new AppError("VALIDATION_ERROR", "Only JPEG, PNG, and WebP images are supported.");
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (
      !cloudName || !/^[a-z0-9-]+$/i.test(cloudName) ||
      !apiKey || !/^\d+$/.test(apiKey) ||
      !apiSecret || apiSecret.toLowerCase().includes("replace_me")
    ) {
      throw new AppError("INTERNAL_ERROR", "Image uploads are not configured.");
    }

    const uploadParameters = {
      folder: "npwardrobe/products",
      overwrite: "false",
      public_id: randomUUID(),
      timestamp: Math.floor(Date.now() / 1000).toString(),
    };
    const signaturePayload = Object.entries(uploadParameters)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    const signature = createHash("sha1").update(`${signaturePayload}${apiSecret}`).digest("hex");
    const uploadBody = new FormData();
    uploadBody.set("file", new Blob([fileBytes], { type: image.mimeType }), `product.${image.extension}`);
    for (const [key, value] of Object.entries(uploadParameters)) uploadBody.set(key, value);
    uploadBody.set("api_key", apiKey);
    uploadBody.set("signature", signature);

    let uploadResponse: Response;
    try {
      uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: uploadBody,
        cache: "no-store",
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      throw new AppError("DATABASE_ERROR", "The image provider could not be reached.", 503);
    }
    if (!uploadResponse.ok) {
      throw new AppError("DATABASE_ERROR", "The image provider could not accept this image.", 502);
    }
    let uploadJson: unknown;
    try {
      uploadJson = await uploadResponse.json();
    } catch {
      throw new AppError("DATABASE_ERROR", "The image provider returned an invalid response.", 502);
    }
    const parsedUpload = uploadResponseSchema.safeParse(uploadJson);
    if (!parsedUpload.success) {
      throw new AppError("DATABASE_ERROR", "The image provider returned an invalid response.", 502);
    }
    const uploaded = parsedUpload.data;
    const mediaUrl = approvedPublicMediaUrl(uploaded.secure_url);
    const parsedMediaUrl = new URL(uploaded.secure_url);
    if (
      !mediaUrl ||
      parsedMediaUrl.protocol !== "https:" ||
      !parsedMediaUrl.pathname.startsWith(`/${cloudName}/image/upload/`) ||
      ![uploadParameters.public_id, `npwardrobe/products/${uploadParameters.public_id}`].includes(uploaded.public_id) ||
      uploaded.bytes > MAX_FILE_BYTES ||
      uploaded.width * uploaded.height > 40_000_000
    ) {
      throw new AppError("DATABASE_ERROR", "The image provider returned invalid image metadata.", 502);
    }

    const supabase = await createClient();
    const { data: asset, error } = await supabase
      .from("media_assets")
      .insert({
        provider: "cloudinary",
        provider_asset_id: uploaded.asset_id,
        public_url: mediaUrl,
        storage_visibility: "public",
        alt_text: altText.trim(),
        format: uploaded.format,
        mime_type: image.mimeType,
        width: uploaded.width,
        height: uploaded.height,
        bytes: uploaded.bytes,
        created_by: staff.userId,
      })
      .select("id, public_url, alt_text, width, height, bytes")
      .single();
    if (error) throwDatabaseError(error);
    return jsonResponse({
      media: {
        assetId: asset.id,
        url: mediaUrl,
        altText: asset.alt_text,
        width: asset.width,
        height: asset.height,
        bytes: asset.bytes,
        isPrimary: false,
        sortOrder: 0,
      },
    }, 201);
  } catch (error) {
    if (error instanceof AppError) return jsonResponse({ error: error.message }, error.status);
    throw error;
  }
}
