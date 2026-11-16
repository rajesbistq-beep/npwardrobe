import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { ProductEditor } from "@/components/admin/products/product-editor";
import { getAdminCatalogProduct } from "@/services/admin-catalog.service";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getAdminCatalogProduct(id);
  if (!result) notFound();

  return (
    <div className="admin-content-container">
      <PageHeader title="Edit product" description="Update catalogue information, images, variants and publication status." breadcrumbs={["Commerce", "Products", result.product.name]} />
      <ProductEditor product={result.product} categories={result.categories} />
    </div>
  );
}
