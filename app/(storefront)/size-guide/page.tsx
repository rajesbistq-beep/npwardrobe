import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { getPublishedSizeGuide } from "@/services/catalog.service";
import { captureAsync } from "@/lib/utils/capture-async";

export const metadata: Metadata = { title: "Size Guide", description: "View published NP Wardrobe size guides and measurements." };

export default async function SizeGuidePage({ searchParams }: PageProps<"/size-guide">) {
  const params = await searchParams;
  const slug = typeof params.guide === "string" ? params.guide : undefined;
  const loaded = await captureAsync(getPublishedSizeGuide(slug));
  if (!loaded.ok) return <div className="catalog-page"><ErrorState title="The size guide is unavailable" description="We could not load published measurements. Please reload the page to try again." /></div>;
    const result = loaded.data;
    if (!result.guide) return <div className="catalog-page"><header className="catalog-intro"><p className="type-label-sm">NP Wardrobe</p><h1 className="type-headline-lg">Size guide</h1><p className="type-body-md">Choose a published guide to view its measurements.</p></header>{result.guides.length ? <ul className="size-guide-list">{result.guides.map((guide) => <li key={guide.id}><Link href={`/size-guide?guide=${encodeURIComponent(guide.slug)}`}>{guide.name}</Link>{guide.description && <p>{guide.description}</p>}</li>)}</ul> : <EmptyState title="No published size guides yet" description="Size information will appear here when it is published." actionLabel="Browse products" actionHref="/shop" />}</div>;
    const columns = [...new Map(result.rows.flatMap((row) => row.measurements.map((measurement) => [`${measurement.measurement_code}:${measurement.unit}`, { key: `${measurement.measurement_code}:${measurement.unit}`, label: measurement.label, unit: measurement.unit } as const]))).values()];
    return <div className="catalog-page"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/size-guide">Size guide</Link><span aria-hidden="true">/</span><span aria-current="page">{result.guide.name}</span></nav><header className="catalog-intro"><p className="type-label-sm">NP Wardrobe</p><h1 className="type-headline-lg">{result.guide.name}</h1>{result.guide.description && <p className="type-body-md">{result.guide.description}</p>}</header>{result.rows.length ? <div className="size-guide-table-wrap"><table className="size-guide-table"><thead><tr><th scope="col">Size</th>{columns.map((column) => <th scope="col" key={column.key}>{column.label} ({column.unit})</th>)}<th scope="col">Fit note</th></tr></thead><tbody>{result.rows.map((row) => <tr key={row.id}><th scope="row">{row.size_label}</th>{columns.map((column) => <td key={column.key}>{row.measurements.find((measurement) => `${measurement.measurement_code}:${measurement.unit}` === column.key)?.value ?? "—"}</td>)}<td>{row.fit_note || "—"}</td></tr>)}</tbody></table></div> : <EmptyState title="Measurements are not available" description="This published guide does not have any measurement rows yet." actionLabel="Browse products" actionHref="/shop" />}<p className="size-guide-back"><Link href="/size-guide">View other guides</Link></p></div>;
}
