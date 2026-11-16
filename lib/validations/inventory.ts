import { z } from "zod";

export const inventoryReadFilterSchema = z.object({
  variantId: z.uuid().optional(),
  locationId: z.uuid().optional(),
  orderId: z.uuid().optional(),
  reservationId: z.uuid().optional(),
  offset: z.coerce.number().int().min(0).max(1000000).default(0),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
});

export const inventoryAdjustmentSchema = z.object({
  variantId: z.uuid(),
  locationId: z.uuid(),
  quantityDelta: z.number().int().min(-2147483648).max(2147483647).refine((value) => value !== 0),
  reasonCode: z.string().trim().min(1).max(80),
  reason: z.string().trim().min(1).max(500),
});

export const inventoryLocationSchema = z.object({
  code: z.string().trim().toLowerCase().min(2).max(32).regex(/^[a-z0-9][a-z0-9_-]*$/),
  name: z.string().trim().min(1).max(120),
  locationType: z.enum(["warehouse", "store", "other"]),
});
