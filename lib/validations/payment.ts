import { z } from "zod";

export const paymentIdSchema = z.uuid();

export const manualPaymentReferenceSchema = z.object({
  paymentId: z.uuid(),
  customerReference: z.string().trim().min(1).max(200),
  idempotencyKey: z.uuid(),
});

export const manualPaymentDecisionSchema = z.object({
  paymentId: z.uuid(),
  decision: z.enum(["approve", "reject"]),
  reason: z.string().trim().min(1),
});

export const codCollectionSchema = z.object({
  paymentId: z.uuid(),
  reference: z.string().nullable().optional(),
});
