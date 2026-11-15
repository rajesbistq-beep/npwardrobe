import { AdminMobileDrawer } from "./admin-mobile-drawer";
import { AdminUserMenu } from "./admin-user-menu";

export function AdminTopbar() {
  return <header className="admin-topbar"><AdminMobileDrawer /><div className="admin-topbar__context"><span>NP Wardrobe</span><span aria-hidden="true">/</span><span>Staff workspace</span></div><AdminUserMenu /></header>;
}
