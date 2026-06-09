import RoleNavbar from "./RoleNavbar";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex bg-(--bg-light) dark:bg-(--bg-dark)">
      <div className="flex items-center gap-3 px-6 py-4">
        <Link to="/" className="text-lg font-bold text-emerald-700 dark:text-white whitespace-nowrap">
          Recíclame
        </Link>
      </div>

      <div className="flex-1 bg-transparent" />

      <div className="bg-white dark:bg-[#0e2a32] shadow-sm px-6 py-4 rounded-bl-2xl min-h-18 flex items-center">
        <RoleNavbar />
      </div>
    </header>
  );
}
