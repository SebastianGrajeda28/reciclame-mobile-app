import { Link } from "react-router-dom";
import { Lightbulb, Users, Settings, LayoutDashboard } from "lucide-react";

export default function AdminPanel() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
      <p className="text-gray-500 mb-8">Gestiona cuentas y configuración del sistema.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/admin/dashboard"
          className="flex flex-col items-center gap-3 p-6 rounded-xl border hover:border-emerald-500 hover:shadow-md transition"
        >
          <LayoutDashboard className="w-8 h-8 text-emerald-600" />
          <span className="text-center font-semibold">Dashboard</span>
        </Link>

        <Link
          to="/admin/accounts"
          className="flex flex-col items-center gap-3 p-6 rounded-xl border hover:border-emerald-500 hover:shadow-md transition"
        >
          <Users className="w-8 h-8 text-emerald-600" />
          <span className="text-center font-semibold">Gestión de Cuentas</span>
        </Link>

        <Link
          to="/admin/fun-facts"
          className="flex flex-col items-center gap-3 p-6 rounded-xl border hover:border-emerald-500 hover:shadow-md transition"
        >
          <Lightbulb className="w-8 h-8 text-emerald-600" />
          <span className="text-center font-semibold">Datos Curiosos</span>
        </Link>

        <Link
          to="/admin/config"
          className="flex flex-col items-center gap-3 p-6 rounded-xl border hover:border-emerald-500 hover:shadow-md transition"
        >
          <Settings className="w-8 h-8 text-emerald-600" />
          <span className="text-center font-semibold">Configuración</span>
        </Link>
      </div>
    </div>
  );
}
