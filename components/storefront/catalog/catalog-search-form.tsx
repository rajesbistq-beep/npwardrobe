import Link from "next/link";

export function CatalogSearchForm({ action, value }: { action: string; value: string }) {
  return <form className="catalog-search" action={action} role="search"><label htmlFor="catalog-search-input">Search products</label><div><input id="catalog-search-input" name="q" type="search" maxLength={100} defaultValue={value} placeholder="Search by name or details" /><button className="ui-button" type="submit">Search</button>{value && <Link href={action} className="catalog-search__clear">Clear</Link>}</div></form>;
}
