"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/admin/form-section";
import { saveCatalogProductAction, type ProductActionState } from "@/app/admin/(console)/products/actions";
import { uploadedAdminProductMediaSchema } from "@/lib/validations/admin-catalog";
import type { AdminProductEditorData, AdminProductImage, AdminProductVariant, AdminVariantStatus } from "@/types/admin-catalog";

type CategoryOption = { id: string; slug: string; name: string };
type VariantDraft = {
  id?: string;
  sku: string;
  status: AdminVariantStatus;
  priceOverride: string;
  salePriceOverride: string;
  size: string;
  colour: string;
  swatchHex: string;
};

const initialActionState: ProductActionState = { status: "idle", message: "" };

function optionValue(label: string) {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function toDraft(variant: AdminProductVariant): VariantDraft {
  return {
    id: variant.id,
    sku: variant.sku,
    status: variant.status,
    priceOverride: variant.priceOverride?.toString() ?? "",
    salePriceOverride: variant.salePriceOverride?.toString() ?? "",
    size: variant.options.find(({ code }) => code === "size")?.label ?? "",
    colour: variant.options.find(({ code }) => code === "colour")?.label ?? "",
    swatchHex: variant.options.find(({ code }) => code === "colour")?.swatchHex ?? "",
  };
}

function toVariantPayload(variant: VariantDraft, sortOrder: number) {
  const options = [];
  if (variant.size.trim()) {
    options.push({ code: "size" as const, label: variant.size.trim(), value: optionValue(variant.size), swatchHex: null });
  }
  if (variant.colour.trim()) {
    options.push({
      code: "colour" as const,
      label: variant.colour.trim(),
      value: optionValue(variant.colour),
      swatchHex: variant.swatchHex.trim() || null,
    });
  }
  return {
    ...(variant.id ? { id: variant.id } : {}),
    sku: variant.sku,
    status: variant.status,
    priceOverride: variant.priceOverride.trim() ? Number(variant.priceOverride) : null,
    salePriceOverride: variant.salePriceOverride.trim() ? Number(variant.salePriceOverride) : null,
    sortOrder,
    options,
  };
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "Image size unavailable";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ProductEditor({ product, categories }: { product: AdminProductEditorData; categories: CategoryOption[] }) {
  const router = useRouter();
  const [actionState, formAction, pending] = useActionState(saveCatalogProductAction, initialActionState);
  const [variants, setVariants] = useState(product.variants.map(toDraft));
  const [media, setMedia] = useState(product.media);
  const [slug, setSlug] = useState(product.slug);
  const [slugEdited, setSlugEdited] = useState(Boolean(product.id));
  const [altText, setAltText] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants((current) => current.map((item, row) => row === index ? { ...item, ...patch } : item));
  }

  useEffect(() => {
    if (actionState.status === "success" && actionState.productId) {
      router.push(`/admin/products/${actionState.productId}`);
      router.refresh();
    }
  }, [actionState, router]);

  async function uploadImage() {
    const file = fileInput.current?.files?.[0];
    if (!file) {
      setUploadError("Choose an image first.");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const request = new FormData();
      request.set("file", file);
      request.set("altText", altText);
      const response = await fetch("/api/admin/catalog/media", { method: "POST", body: request });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message = typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
          ? result.error
          : "Image upload failed.";
        setUploadError(message);
        return;
      }
      const parsed = uploadedAdminProductMediaSchema.safeParse(result);
      if (!parsed.success) {
        setUploadError("The image provider returned invalid image details.");
        return;
      }
      const image: AdminProductImage = {
        ...parsed.data.media,
        isPrimary: media.length === 0,
        sortOrder: media.length,
      };
      setMedia((current) => [...current, image]);
      setAltText("");
      if (fileInput.current) fileInput.current.value = "";
    } catch {
      setUploadError("Image upload could not be completed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(assetId: string) {
    setMedia((current) => {
      const remaining = current.filter((image) => image.assetId !== assetId);
      const needsPrimary = remaining.length > 0 && !remaining.some((image) => image.isPrimary);
      return remaining.map((image, index) => ({
        ...image,
        isPrimary: image.isPrimary || (needsPrimary && index === 0),
        sortOrder: index,
      }));
    });
  }

  function setPrimaryImage(assetId: string) {
    setMedia((current) => current.map((image) => ({ ...image, isPrimary: image.assetId === assetId })));
  }

  const variantsPayload = variants.map(toVariantPayload);

  return (
    <form action={formAction} className="product-editor">
      {product.id && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="variants" value={JSON.stringify(variantsPayload)} />
      <input type="hidden" name="media" value={JSON.stringify(media.map(({ assetId, altText: imageAlt, isPrimary, sortOrder }) => ({
        assetId,
        altText: imageAlt,
        isPrimary,
        sortOrder,
      })))} />

      <FormSection title="Product details" description="Customer-facing name, description, pricing and publication state." required>
        <div className="product-editor__grid">
          <label className="product-editor__field product-editor__field--wide">
            <span className="ui-label">Product name</span>
            <input
              className="ui-input"
              name="name"
              required
              maxLength={160}
              defaultValue={product.name}
              onChange={(event) => {
                if (!slugEdited) setSlug(optionValue(event.currentTarget.value));
              }}
            />
          </label>
          <label className="product-editor__field">
            <span className="ui-label">URL slug</span>
            <input className="ui-input" name="slug" required maxLength={180} value={slug} onChange={(event) => {
              setSlug(event.currentTarget.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/--+/g, "-"));
              setSlugEdited(true);
            }} />
          </label>
          <label className="product-editor__field">
            <span className="ui-label">Product type</span>
            <input className="ui-input" name="productType" maxLength={100} defaultValue={product.productType} placeholder="Dress, top, skirt…" />
          </label>
          <label className="product-editor__field">
            <span className="ui-label">Regular price (NPR)</span>
            <input className="ui-input" name="defaultPrice" type="number" min="0" max="10000000" step="0.01" required defaultValue={product.defaultPrice ?? ""} />
          </label>
          <label className="product-editor__field">
            <span className="ui-label">Sale price (NPR)</span>
            <input className="ui-input" name="salePrice" type="number" min="0" max="10000000" step="0.01" defaultValue={product.salePrice ?? ""} />
          </label>
          <label className="product-editor__field">
            <span className="ui-label">Publication status</span>
            <select className="ui-input" name="status" defaultValue={product.status}>
              <option value="draft">Draft — private</option>
              <option value="published">Published — visible in the storefront</option>
              <option value="archived">Archived — private</option>
            </select>
          </label>
          <label className="product-editor__checkbox">
            <input type="checkbox" name="isFeatured" defaultChecked={product.isFeatured} />
            <span>Feature this product in storefront merchandising</span>
          </label>
          <label className="product-editor__field product-editor__field--wide">
            <span className="ui-label">Short description</span>
            <textarea className="ui-input ui-textarea" name="shortDescription" maxLength={500} defaultValue={product.shortDescription} />
          </label>
          <label className="product-editor__field product-editor__field--wide">
            <span className="ui-label">Description</span>
            <textarea className="ui-input ui-textarea" name="description" maxLength={10000} defaultValue={product.description} />
          </label>
        </div>
      </FormSection>

      <FormSection title="Images" description="JPEG, PNG or WebP; maximum 10 MB per image. Add descriptive alt text for accessibility." required>
        <div className="product-editor__upload">
          <label className="product-editor__field">
            <span className="ui-label">Product image</span>
            <input ref={fileInput} className="ui-input" type="file" accept="image/jpeg,image/png,image/webp" />
          </label>
          <label className="product-editor__field">
            <span className="ui-label">Image alt text</span>
            <input className="ui-input" value={altText} onChange={(event) => setAltText(event.currentTarget.value)} maxLength={180} placeholder="Describe the product in this image" />
          </label>
          <Button type="button" variant="secondary" onClick={uploadImage} disabled={uploading || !altText.trim()}>
            {uploading ? "Uploading…" : "Upload image"}
          </Button>
        </div>
        {uploadError && <p className="product-editor__error" role="alert">{uploadError}</p>}
        {media.length ? (
          <div className="product-editor__media-grid">
            {media.map((image) => (
              <article className="product-editor__media" key={image.assetId}>
                <div className="product-editor__media-image">
                  <Image src={image.url} alt={image.altText} fill sizes="(max-width: 700px) 44vw, 180px" />
                </div>
                <label className="product-editor__field">
                  <span className="ui-label">Alt text</span>
                  <input className="ui-input" value={image.altText} maxLength={180} onChange={(event) => {
                    const value = event.currentTarget.value;
                    setMedia((current) => current.map((item) => item.assetId === image.assetId ? { ...item, altText: value } : item));
                  }} />
                </label>
                <p className="product-editor__muted">{formatBytes(image.bytes)} · {image.width ?? "?"} × {image.height ?? "?"}</p>
                <div className="product-editor__media-actions">
                  <Button type="button" size="small" variant={image.isPrimary ? "primary" : "secondary"} onClick={() => setPrimaryImage(image.assetId)} aria-pressed={image.isPrimary}>
                    {image.isPrimary ? "Primary image" : "Set primary"}
                  </Button>
                  <Button type="button" size="small" variant="tertiary" onClick={() => removeImage(image.assetId)}>Remove</Button>
                </div>
              </article>
            ))}
          </div>
        ) : <p className="product-editor__muted">No product images yet. Upload at least one before publishing.</p>}
      </FormSection>

      <FormSection title="Sizes, colours and variants" description="Each row is a purchasable SKU. Variant stock is managed through the Inventory area.">
        <div className="product-editor__variant-list">
          {variants.map((variant, index) => (
            <fieldset className="product-editor__variant" key={variant.id ?? `new-${index}`}>
              <legend>Variant {index + 1}</legend>
              <div className="product-editor__variant-grid">
                <label className="product-editor__field">
                  <span className="ui-label">SKU</span>
                  <input className="ui-input" required maxLength={100} value={variant.sku} onChange={(event) => updateVariant(index, { sku: event.currentTarget.value })} />
                </label>
                <label className="product-editor__field">
                  <span className="ui-label">Size</span>
                  <input className="ui-input" maxLength={80} value={variant.size} onChange={(event) => updateVariant(index, { size: event.currentTarget.value })} placeholder="S, M, L, 8…" />
                </label>
                <label className="product-editor__field">
                  <span className="ui-label">Colour</span>
                  <input className="ui-input" maxLength={80} value={variant.colour} onChange={(event) => updateVariant(index, { colour: event.currentTarget.value })} placeholder="Black, Rose…" />
                </label>
                <label className="product-editor__field">
                  <span className="ui-label">Colour swatch</span>
                  <input className="ui-input" type="color" value={/^#[0-9a-f]{6}$/i.test(variant.swatchHex) ? variant.swatchHex : "#b88b87"} onChange={(event) => updateVariant(index, { swatchHex: event.currentTarget.value })} />
                </label>
                <label className="product-editor__field">
                  <span className="ui-label">Variant regular price (optional)</span>
                  <input className="ui-input" type="number" min="0" max="10000000" step="0.01" value={variant.priceOverride} onChange={(event) => updateVariant(index, { priceOverride: event.currentTarget.value })} />
                </label>
                <label className="product-editor__field">
                  <span className="ui-label">Variant sale price (optional)</span>
                  <input className="ui-input" type="number" min="0" max="10000000" step="0.01" value={variant.salePriceOverride} onChange={(event) => updateVariant(index, { salePriceOverride: event.currentTarget.value })} />
                </label>
                <label className="product-editor__field">
                  <span className="ui-label">Variant status</span>
                  <select className="ui-input" value={variant.status} onChange={(event) => {
                    const value = event.currentTarget.value;
                    if (value === "active" || value === "inactive" || value === "archived") updateVariant(index, { status: value });
                  }}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
                <div className="product-editor__variant-remove">
                  <Button type="button" size="small" variant="tertiary" onClick={() => setVariants((current) => current.filter((_, row) => row !== index))} disabled={variants.length === 1}>Remove variant</Button>
                </div>
              </div>
            </fieldset>
          ))}
        </div>
        <Button type="button" variant="secondary" onClick={() => setVariants((current) => [...current, {
          sku: "",
          status: "active",
          priceOverride: "",
          salePriceOverride: "",
          size: "",
          colour: "",
          swatchHex: "",
        }])}>Add variant</Button>
      </FormSection>

      <FormSection title="Categories" description="Assign existing categories to organize this product.">
        {categories.length ? <div className="product-editor__categories">
          {categories.map((category) => (
            <label key={category.id} className="product-editor__category">
              <input type="checkbox" name="categoryId" value={category.id} defaultChecked={product.categoryIds.includes(category.id)} />
              <span>{category.name}</span>
            </label>
          ))}
        </div> : <p className="product-editor__muted">No categories are configured yet. Products can still be saved without a category.</p>}
      </FormSection>

      <FormSection title="Product information and search">
        <div className="product-editor__grid">
          <label className="product-editor__field">
            <span className="ui-label">Material</span>
            <input className="ui-input" name="material" maxLength={300} defaultValue={product.material} />
          </label>
          <label className="product-editor__field">
            <span className="ui-label">Care instructions</span>
            <input className="ui-input" name="careInstructions" maxLength={1000} defaultValue={product.careInstructions} />
          </label>
          <label className="product-editor__field product-editor__field--wide">
            <span className="ui-label">Fit notes</span>
            <textarea className="ui-input ui-textarea" name="fitNotes" maxLength={1000} defaultValue={product.fitNotes} />
          </label>
          <label className="product-editor__field">
            <span className="ui-label">SEO title</span>
            <input className="ui-input" name="seoTitle" maxLength={180} defaultValue={product.seoTitle} />
          </label>
          <label className="product-editor__field">
            <span className="ui-label">SEO description</span>
            <textarea className="ui-input ui-textarea" name="seoDescription" maxLength={320} defaultValue={product.seoDescription} />
          </label>
        </div>
      </FormSection>

      {actionState.status === "error" && (
        <div className="product-editor__error" role="alert">
          <p>{actionState.message}</p>
          {actionState.fieldErrors && <ul>{Object.entries(actionState.fieldErrors).flatMap(([field, messages]) => messages.map((message, index) => <li key={`${field}-${index}`}>{message}</li>))}</ul>}
        </div>
      )}
      {actionState.status === "success" && <p className="product-editor__success" role="status">{actionState.message}</p>}
      <div className="product-editor__submit">
        <Button type="submit" disabled={pending || uploading}>{pending ? "Saving…" : product.id ? "Save changes" : "Create product"}</Button>
        <span className="product-editor__muted">Published products are visible to customers. Drafts remain private.</span>
      </div>
    </form>
  );
}
