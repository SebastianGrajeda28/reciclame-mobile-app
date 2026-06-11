import RoleNavbar from "./RoleNavbar";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const isAuthRoute = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/auth/callback",
  ].includes(location.pathname);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#0a2740] bg-[#0b2f4e] shadow-sm">
      <div className="relative h-20 w-full px-6 md:px-8">
        <Link
          to="/"
          className="absolute left-6 top-1/2 z-10 -translate-y-1/2 whitespace-nowrap text-[2.15rem] font-extrabold leading-none tracking-normal text-white antialiased md:left-8"
        >
          Reciclame
        </Link>

        {isAuthRoute ? null : <RoleNavbar />}
      </div>
    </header>
  );
}
