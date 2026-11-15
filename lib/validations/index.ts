import { z } from "zod";

/** Shared primitives only; feature-specific business schemas belong with their workflows. */
export { z };
export const idSchema = z.uuid();
export const nonEmptyStringSchema = z.string().trim().min(1);
