import { Link, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import ProfilePopover from "./ProfilePopover";

export type NavItem = {
  label: string;
  path: string;
};

interface RoleNavbarProps {
  items: NavItem[];
}

function linkClasses(active: boolean) {
  return active
    ? "relative block min-w-[132px] px-2 py-5 text-center text-[1rem] font-medium text-white"
    : "relative block min-w-[132px] px-2 py-5 text-center text-[1rem] font-medium text-white/88 transition hover:text-white";
}

export default function RoleNavbar({ items }: RoleNavbarProps) {
  const location = useLocation();
  const { account, loading } = useUser();

  if (loading) {
    return null;
  }

  if (!account) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center">
      <div className="pointer-events-none absolute inset-x-0 flex justify-center">
        <div className="pointer-events-auto">
          <nav aria-label="Navegacion principal">
            <ul className="flex items-center gap-10">
              {items.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className={linkClasses(location.pathname === item.path)}>
                    {item.label}
                    <span
                      className={
                        location.pathname === item.path
                          ? "absolute inset-x-2 bottom-3 h-0.5 rounded-full bg-[#22c76f]"
                          : "absolute inset-x-2 bottom-3 h-0.5 rounded-full bg-transparent"
                      }
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="relative z-10 ml-auto pr-6 md:pr-8">
        <ProfilePopover />
      </div>
    </div>
  );
}