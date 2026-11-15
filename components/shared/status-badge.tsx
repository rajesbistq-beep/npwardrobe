import { Badge } from "@/components/ui/badge";

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "pending_verification" | "partially_paid" | "paid" | "rejected" | "failed" | "partially_refunded" | "refunded" | "cancelled";
export type ShipmentStatus = "pending" | "assigned" | "dispatched" | "in_transit" | "attempted" | "delivered" | "failed" | "returned" | "cancelled";
export type ReservationStatus = "active" | "committed" | "released" | "expired";
export type RequestStatus = "submitted" | "under_review" | "information_requested" | "approved" | "rejected" | "pickup_scheduled" | "received" | "inspecting" | "refund_processing" | "exchange_processing" | "completed" | "withdrawn";
type StatusDomain = "order" | "payment" | "shipment" | "reservation" | "request";
type StatusByDomain = { order: OrderStatus; payment: PaymentStatus; shipment: ShipmentStatus; reservation: ReservationStatus; request: RequestStatus };
type StatusBadgeProps = { [Domain in StatusDomain]: { domain: Domain; status: StatusByDomain[Domain] } }[StatusDomain];
const labels: Record<StatusDomain, Record<string, string>> = {
  order: { pending: "Pending", confirmed: "Confirmed", processing: "Processing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" },
  payment: { unpaid: "Unpaid", pending_verification: "Pending verification", partially_paid: "Partially paid", paid: "Paid", rejected: "Rejected", failed: "Failed", refunded: "Refunded", partially_refunded: "Partially refunded", cancelled: "Cancelled" },
  shipment: { pending: "Pending", assigned: "Assigned", dispatched: "Dispatched", in_transit: "In transit", attempted: "Delivery attempted", delivered: "Delivered", failed: "Failed", returned: "Returned", cancelled: "Cancelled" },
  reservation: { active: "Active", committed: "Committed", released: "Released", expired: "Expired" },
  request: { submitted: "Submitted", under_review: "Under review", information_requested: "Information requested", approved: "Approved", rejected: "Rejected", pickup_scheduled: "Pickup scheduled", received: "Received", inspecting: "Inspecting", refund_processing: "Refund processing", exchange_processing: "Exchange processing", completed: "Completed", withdrawn: "Withdrawn" },
};
const tones: Record<StatusDomain, Record<string, string>> = {
  order: { pending: "warning", confirmed: "info", processing: "brand", shipped: "info", delivered: "success", cancelled: "error" },
  payment: { unpaid: "neutral", pending_verification: "warning", partially_paid: "warning", paid: "success", rejected: "error", failed: "error", refunded: "neutral", partially_refunded: "warning", cancelled: "neutral" },
  shipment: { pending: "neutral", assigned: "info", dispatched: "info", in_transit: "info", attempted: "warning", delivered: "success", failed: "error", returned: "warning", cancelled: "neutral" },
  reservation: { active: "info", committed: "success", released: "neutral", expired: "warning" },
  request: { submitted: "info", under_review: "warning", information_requested: "warning", approved: "success", rejected: "error", pickup_scheduled: "info", received: "info", inspecting: "warning", refund_processing: "warning", exchange_processing: "warning", completed: "success", withdrawn: "neutral" },
};
export function StatusBadge({ domain, status }: StatusBadgeProps) {
  const key = String(status);
  return <Badge className={`status-badge status-badge--${tones[domain][key] ?? "neutral"}`}><span className="status-badge__dot" aria-hidden="true" />{labels[domain][key] ?? key.replaceAll("_", " ")}</Badge>;
}
