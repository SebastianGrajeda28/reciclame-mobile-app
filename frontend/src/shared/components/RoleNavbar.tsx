import { Link, useLocation } from "react-router-dom";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useUser } from "../context/UserContext";
import ProfilePopover from "./ProfilePopover";

/*  Cambiar */
const NAV_ITEMS_VIEWER = [
  { name: "Reservas", path: "/reservas" },
  { name: "Eventos", path: "/eventos" },
  { name: "Academias", path: "/academias" },
];

const PANEL_ROUTES: Record<string, string> = {
  ADMIN: "/admin",
  MANAGER: "/manager",
};


function getNavLinkClasses(isActive: boolean) {
  if (isActive) {
    return "bg-white text-[#0e2a32] dark:bg-[#f3f0ea] dark:text-[#0e2a32] px-3 py-1 rounded-md text-sm font-medium";
  }
  return "text-gray-600 dark:text-white hover:text-black dark:hover:text-[#b9e0d8] px-3 py-1 rounded-md text-sm font-medium";
}

export default function RoleNavbar() {
  const location = useLocation();
  const { account } = useUser();
  const userRole = account?.role || null;

  return (
    <div className="flex items-center justify-between w-full gap-6">
      <div className="flex items-center gap-6">
        {!userRole && (
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium border border-(--brand) text-(--brand) rounded-md hover:bg-(--brand) hover:text-white"
          >
            Iniciar sesión
          </Link>
        )}

        {userRole === "VIEWER" && (
          <ul className="flex gap-4 items-center">
            {NAV_ITEMS_VIEWER.map(({ name, path }) => (
              <li key={name}>
                <Link to={path} className={getNavLinkClasses(location.pathname === path)}>
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {(userRole === "ADMIN" || userRole === "MANAGER") && (
          <Link
            to={PANEL_ROUTES[userRole]}
            className="text-sm text-gray-800 dark:text-white font-medium hover:underline"
          >
            Panel de Herramientas
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        <ProfilePopover />
        <ModeToggle />
      </div>
    </div>
  );
}