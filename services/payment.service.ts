import "server-only";

import { requireAuthenticatedUser, requirePermission } from "@/lib/auth/authorization";
import { AppError, throwDatabaseError, validationError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";
import { codCollectionSchema, manualPaymentDecisionSchema, paymentIdSchema } from "@/lib/validations/payment";
import { getCustomerOrder } from "@/services/order.service";

export async function getCustomerPaymentHistory(orderId: unknown) {
  await requireAuthenticatedUser();
  if (typeof orderId !== "string") throw validationError();
  const order = await getCustomerOrder({ orderId });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_payment_status_history")
    .select("id, from_status, to_status, reason, actor_type, created_at")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getCustomerPaymentStatusHistory(paymentId: unknown) {
  const parsed = paymentIdSchema.safeParse(paymentId);
  if (!parsed.success) throw validationError();
  await requireAuthenticatedUser();
  const supabase = await createClient();
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("id")
    .eq("id", parsed.data)
    .maybeSingle();
  if (paymentError) throwDatabaseError(paymentError);
  if (!payment) throw new AppError("NOT_FOUND", "Payment not found.");
  const { data, error } = await supabase
    .from("payment_status_history")
    .select("id, from_status, to_status, reason, actor_type, created_at")
    .eq("payment_id", parsed.data)
    .order("created_at", { ascending: true });
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getAdminPaymentStatusHistory(paymentId: unknown) {
  const parsed = paymentIdSchema.safeParse(paymentId);
  if (!parsed.success) throw validationError();
  await requirePermission("payments.view");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_status_history")
    .select("id, from_status, to_status, actor_user_id, actor_type, reason, created_at")
    .eq("payment_id", parsed.data)
    .order("created_at", { ascending: true });
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getAdminPaymentRecords(orderId: unknown) {
  const parsed = paymentIdSchema.safeParse(orderId);
  if (!parsed.success) throw validationError();
  await requirePermission("payments.view");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("id, order_id, payment_method_id, provider_code, currency_code, amount, status, customer_reference, rejection_reason, verified_by, verified_at, paid_at, created_at, updated_at")
    .eq("order_id", parsed.data)
    .order("created_at", { ascending: true });
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getAdminPaymentAttempts(paymentId: unknown) {
  const parsed = paymentIdSchema.safeParse(paymentId);
  if (!parsed.success) throw validationError();
  await requirePermission("payments.view");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_attempts")
    .select("id, payment_id, attempt_number, idempotency_key, status, request_reference, response_reference, error_code, error_message_safe, started_at, completed_at, created_at")
    .eq("payment_id", parsed.data)
    .order("attempt_number", { ascending: true });
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getAdminPaymentTransactions(paymentId: unknown) {
  const parsed = paymentIdSchema.safeParse(paymentId);
  if (!parsed.success) throw validationError();
  await requirePermission("payments.view");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_transactions")
    .select("id, payment_id, payment_attempt_id, provider_code, provider_transaction_id, transaction_type, amount, currency_code, status, provider_occurred_at, verified_at, safe_metadata, created_at")
    .eq("payment_id", parsed.data)
    .order("created_at", { ascending: true });
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getCustomerRefunds(orderId: unknown) {
  if (typeof orderId !== "string") throw validationError();
  const order = await getCustomerOrder({ orderId });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("refunds")
    .select("id, payment_id, amount, currency_code, status, reason, processed_at, created_at, updated_at")
    .eq("order_id", order.id)
    .order("created_at", { ascending: false });
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getAdminRefunds(orderId: unknown) {
  const parsed = paymentIdSchema.safeParse(orderId);
  if (!parsed.success) throw validationError();
  await requirePermission("payments.view");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("refunds")
    .select("id, order_id, payment_id, return_request_id, amount, currency_code, status, reason, provider_refund_reference, requested_by, approved_by, processed_by, processed_at, created_at, updated_at")
    .eq("order_id", parsed.data)
    .order("created_at", { ascending: false });
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function decideManualPayment(input: unknown) {
  const parsed = manualPaymentDecisionSchema.safeParse(input);
  if (!parsed.success) throw validationError();
  await requirePermission("payments.verify");
  const supabase = await createClient();
  const { error } = await supabase.rpc("decide_manual_payment", {
    p_payment_id: parsed.data.paymentId,
    p_decision: parsed.data.decision,
    p_reason: parsed.data.reason,
  });
  if (error) throwDatabaseError(error);
}

export async function recordCodCollection(input: unknown) {
  const parsed = codCollectionSchema.safeParse(input);
  if (!parsed.success) throw validationError();
  await requirePermission("payments.cod_collect");
  await requirePermission("payments.view");
  // The RPC reads and locks the authoritative record. This read supplies only
  // the exact amount that the current RPC requires; the client never provides it.
  const supabase = await createClient();
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("id, amount, status")
    .eq("id", parsed.data.paymentId)
    .maybeSingle();
  if (paymentError) throwDatabaseError(paymentError);
  if (!payment) throw new AppError("NOT_FOUND", "Payment not found.");
  if (payment.status !== "unpaid") throw new AppError("CONFLICT", "This payment is no longer awaiting collection.");

  const { error } = await supabase.rpc("record_cod_collection", {
    p_payment_id: payment.id,
    p_collected_amount: payment.amount,
    p_reference: parsed.data.reference ?? undefined,
  });
  if (error) throwDatabaseError(error);
}
