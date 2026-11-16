import { PageHeader } from "@/components/admin/page-header";
import { ProductEditor } from "@/components/admin/products/product-editor";
import { getAdminCatalogCategories } from "@/services/admin-catalog.service";
import type { AdminProductEditorData } from "@/types/admin-catalog";

const newProduct: AdminProductEditorData = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  material: "",
  careInstructions: "",
  fitNotes: "",
  productType: "",
  status: "draft",
  defaultPrice: null,
  salePrice: null,
  isFeatured: false,
  seoTitle: "",
  seoDescription: "",
  categoryIds: [],
  variants: [{ sku: "", status: "active", priceOverride: null, salePriceOverride: null, sortOrder: 0, options: [] }],
  media: [],
};

export default async function NewProductPage() {
  const categories = await getAdminCatalogCategories();
  return (
    <div className="admin-content-container">
      <PageHeader title="Add product" description="Create a catalogue listing, add purchasable variants, and decide when it becomes public." breadcrumbs={["Commerce", "Products", "Add product"]} />
      <ProductEditor product={newProduct} categories={categories} />
    </div>
  );
}
