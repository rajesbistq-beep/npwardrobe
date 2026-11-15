import { z } from "zod";

/** The only checkout fields accepted here; price, discounts, shipping and totals are never inputs. */
export const checkoutLineSchema = z.object({
  variantId: z.uuid(),
  quantity: z.number().int().min(1).max(99),
});

export const checkoutDraftSchema = z.object({
  idempotencyKey: z.uuid(),
  items: z.array(checkoutLineSchema).min(1),
  paymentMethodCode: z.enum(["cod", "esewa_manual"]),
}).superRefine((input, context) => {
  const ids = input.items.map(({ variantId }) => variantId);
  if (new Set(ids).size !== ids.length) {
    context.addIssue({ code: "custom", path: ["items"], message: "Each variant may appear only once." });
  }
});

export type CheckoutDraftInput = z.infer<typeof checkoutDraftSchema>;
