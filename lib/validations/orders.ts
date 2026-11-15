import { z } from "zod";
import { paginationSchema } from "@/lib/validations/catalog";

export const publicOrderReferenceSchema = z.string().trim().min(1);

export const customerOrderLookupSchema = z.object({
  orderId: z.uuid().optional(),
  publicReference: publicOrderReferenceSchema.optional(),
}).refine((value) => Boolean(value.orderId || value.publicReference));

export const adminOrderFiltersSchema = paginationSchema.extend({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).optional(),
  paymentStatus: z.enum([
    "unpaid", "pending_verification", "partially_paid", "paid", "rejected", "failed", "partially_refunded", "refunded",
  ]).optional(),
  search: z.string().trim().optional(),
});

export const transitionOrderSchema = z.object({
  orderId: z.uuid(),
  targetStatus: z.enum(["confirmed", "processing", "shipped", "delivered", "cancelled"]),
  reason: z.string().nullable().optional(),
  requestId: z.string().nullable().optional(),
});
