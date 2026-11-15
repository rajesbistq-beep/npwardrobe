"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAVIGATION } from "../navigation/admin-navigation";

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="admin-sidebar">
      <Link className="admin-brand" href="/admin" onClick={onNavigate}><span>NP</span><span>WARDROBE<small>Administration</small></span></Link>
      <nav aria-label="Administration navigation">
        {ADMIN_NAVIGATION.map((group) => (
          <section className="admin-nav-group" key={group.label} aria-label={group.label}>
            <h2>{group.label}</h2>
            {group.items.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
              return <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={active ? "is-active" : undefined}><span className="admin-nav-mark" aria-hidden="true" />{item.label}</Link>;
            })}
          </section>
        ))}
      </nav>
      <p className="admin-sidebar__foot">NP Wardrobe · Staff workspace</p>
    </aside>
  );
}
