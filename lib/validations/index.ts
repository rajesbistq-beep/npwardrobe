import { z } from "zod";

/** Shared primitives only; feature-specific business schemas belong with their workflows. */
export { z };
export const idSchema = z.uuid();
export const nonEmptyStringSchema = z.string().trim().min(1);
export { paginationSchema, productListFiltersSchema, productSlugSchema } from "@/lib/validations/catalog";
export { checkoutDraftSchema, checkoutLineSchema } from "@/lib/validations/checkout";
export { adminOrderFiltersSchema, customerOrderLookupSchema, transitionOrderSchema } from "@/lib/validations/orders";
export { codCollectionSchema, manualPaymentDecisionSchema, manualPaymentReferenceSchema, paymentIdSchema } from "@/lib/validations/payment";
export { inventoryAdjustmentSchema, inventoryReadFilterSchema } from "@/lib/validations/inventory";
