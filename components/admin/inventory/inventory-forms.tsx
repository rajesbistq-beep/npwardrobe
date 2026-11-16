"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormSection } from "@/components/admin/form-section";
import { Button } from "@/components/ui/button";
import { adjustInventoryAction, createInventoryLocationAction, type InventoryActionState } from "@/app/admin/(console)/inventory/actions";

const initialState: InventoryActionState = { status: "idle", message: "" };

type Location = { id: string; code: string; name: string };

export function InventoryLocationForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createInventoryLocationAction, initialState);
  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return (
    <FormSection title="Add inventory location" description="Create a warehouse, store, or other stock-holding location. New active product variants start at zero on-hand.">
      <form action={action} className="inventory-form__grid">
        <label className="product-editor__field">
          <span className="ui-label">Location name</span>
          <input className="ui-input" name="name" required maxLength={120} placeholder="Enter your actual stock location" />
        </label>
        <label className="product-editor__field">
          <span className="ui-label">Location code</span>
          <input className="ui-input" name="code" required minLength={2} maxLength={32} pattern="[A-Za-z0-9][A-Za-z0-9_-]*" placeholder="e.g. main-warehouse" />
        </label>
        <label className="product-editor__field">
          <span className="ui-label">Location type</span>
          <select className="ui-input" name="locationType" defaultValue="warehouse">
            <option value="warehouse">Warehouse</option>
            <option value="store">Store</option>
            <option value="other">Other</option>
          </select>
        </label>
        <div><Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create location"}</Button></div>
        {state.message && <p className={state.status === "error" ? "product-editor__error" : "product-editor__success"} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>}
      </form>
    </FormSection>
  );
}

export function InventoryAdjustmentForm({
  variantId,
  locations,
}: {
  variantId: string;
  locations: Location[];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(adjustInventoryAction, initialState);
  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);
  return (
    <FormSection title="Post stock adjustment" description="Use a positive quantity to add stock or a negative quantity to remove it. Each adjustment is recorded in the inventory ledger.">
      {locations.length ? <form action={action} className="inventory-form__grid">
        <input type="hidden" name="variantId" value={variantId} />
        <label className="product-editor__field">
          <span className="ui-label">Location</span>
          <select className="ui-input" name="locationId" required defaultValue={locations[0].id}>
            {locations.map((location) => <option key={location.id} value={location.id}>{location.name} ({location.code})</option>)}
          </select>
        </label>
        <label className="product-editor__field">
          <span className="ui-label">Quantity change</span>
          <input className="ui-input" name="quantityDelta" type="number" step="1" required />
        </label>
        <label className="product-editor__field">
          <span className="ui-label">Reason code</span>
          <input className="ui-input" name="reasonCode" required maxLength={80} placeholder="count_correction" />
        </label>
        <label className="product-editor__field inventory-form__reason">
          <span className="ui-label">Reason</span>
          <input className="ui-input" name="reason" required maxLength={500} placeholder="Describe the verified stock change" />
        </label>
        <div><Button type="submit" disabled={pending}>{pending ? "Posting…" : "Post adjustment"}</Button></div>
        {state.message && <p className={state.status === "error" ? "product-editor__error" : "product-editor__success"} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>}
      </form> : <p className="product-editor__muted">Create an inventory location before posting stock adjustments. <Link href="/admin/inventory">Go to inventory locations</Link></p>}
    </FormSection>
  );
}
