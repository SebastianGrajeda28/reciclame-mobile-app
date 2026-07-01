import logo from "@/assets/reciclame_logo.png";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import RoleNavbar from "./RoleNavbar";

type NavItem = {
  label: string;
  path: string;
};

const MANAGER_NAV_ITEMS: NavItem[] = [
  { label: "Métricas", path: "/metrics" },
  { label: "Datos Curiosos", path: "/fun-facts" },
  { label: "Instrucciones", path: "/instructions" },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
//  { label: "Panel de Control", path: "/control-panel" },
  { label: "Empleados", path: "/config/users" },
  { label: "Universidades", path: "/config/universities" },
];

export default function Header() {
  const location = useLocation();
  const { account } = useUser();
  const isAuthRoute = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/auth/callback",
  ].includes(location.pathname);

  const role = (account?.role ?? "").toUpperCase();
  const navItems = role === "ADMIN" ? ADMIN_NAV_ITEMS : MANAGER_NAV_ITEMS;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#0a2740] bg-[#0b2f4e] shadow-sm">
      <div className="relative h-20 w-full px-6 md:px-8">
        <Link
          to="/"
          className="absolute left-6 top-1/2 z-10 -translate-y-1/2 md:left-8"
        >
          <img src={logo} alt="Recíclame" className="h-10 w-auto" />
        </Link>

        {isAuthRoute ? null : <RoleNavbar items={navItems} />}
      </div>
    </header>
  );
}