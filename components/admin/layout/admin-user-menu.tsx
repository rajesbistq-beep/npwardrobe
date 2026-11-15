import { signOut } from "@/app/actions/auth";

export function AdminUserMenu() {
  return <div className="admin-user-menu"><span className="admin-user-menu__badge" aria-hidden="true">S</span><span>Staff workspace</span><form action={signOut}><button className="admin-signout" type="submit">Sign out</button></form></div>;
}
