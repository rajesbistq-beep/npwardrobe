import { z } from "zod";

const email = z.email().trim().toLowerCase();
export const loginSchema = z.object({ email, password: z.string().min(1).max(128) });
export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email,
  password: z.string().min(8).max(128),
  termsAccepted: z.literal(true),
});
export const recoverySchema = z.object({ email });
export const resetPasswordSchema = z.object({ password: z.string().min(8).max(128) });
export const totpCodeSchema = z.string().regex(/^\d{6}$/);
export const guestCartSchema = z.array(z.object({ variantId: z.uuid(), quantity: z.number().int().min(1).max(99) })).max(100);
export const guestWishlistSchema = z.array(z.object({ productId: z.uuid(), variantId: z.uuid().nullable() })).max(100);
