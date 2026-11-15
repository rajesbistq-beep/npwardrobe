import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
export function FilterToolbar({ searchLabel, searchValue, onSearchChange, children, hasFilters = false, onClear }: { searchLabel: string; searchValue?: string; onSearchChange?: (value: string) => void; children?: ReactNode; hasFilters?: boolean; onClear?: () => void }) {
  return <div className="filter-toolbar"><div className="filter-toolbar__search"><label className="sr-only" htmlFor="admin-table-search">{searchLabel}</label><Input id="admin-table-search" type="search" placeholder={searchLabel} value={searchValue ?? ""} onChange={onSearchChange ? (event) => onSearchChange(event.currentTarget.value) : undefined} readOnly={!onSearchChange} /></div>{children && <div className="filter-toolbar__filters">{children}</div>}{hasFilters && onClear && <button className="filter-toolbar__clear" type="button" onClick={onClear}>Clear filters</button>}</div>;
}
