import { Button } from "@/components/ui/button";
import { AppPage, AppSurface } from "@/shared/components/AppPage";
import {
  AlertTriangle,
  Building2,
  GraduationCap,
  RefreshCcw,
  Users,
  UserX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const kpis = [
  { label: "Usuarios activos", value: "128", icon: Users, accent: "text-emerald-600", bg: "bg-emerald-100" },
  { label: "Universidades", value: "9", icon: GraduationCap, accent: "text-sky-600", bg: "bg-sky-100" },
  { label: "Campuses", value: "16", icon: Building2, accent: "text-violet-600", bg: "bg-violet-100" },
  { label: "Usuarios inactivos", value: "4", icon: UserX, accent: "text-rose-600", bg: "bg-rose-100" },
];

const recentUsers = [
  { name: "Ariel Gómez", email: "ariel@reciclame.pe", role: "MANAGER", date: "Hoy" },
  { name: "Camila Ruiz", email: "camila@reciclame.pe", role: "MANAGER", date: "Ayer" },
  { name: "Diego Torres", email: "diego@reciclame.pe", role: "ADMIN", date: "Hace 2 días" },
];

const recentUniversities = [
  { name: "Universidad San Marcos", campuses: 3, date: "Hace 3 días" },
  { name: "PUCP", campuses: 2, date: "Hace 5 días" },
];

const alerts = [
  {
    title: "2 universidades sin manager asignado",
    description: "Asigna un responsable para que puedan operar.",
    icon: AlertTriangle,
    accent: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "3 operaciones de sincronización fallidas",
    description: "Hay registros offline que no se sincronizaron.",
    icon: RefreshCcw,
    accent: "text-rose-600",
    bg: "bg-rose-50",
  },
];

export default function ControlPanel() {
  const navigate = useNavigate();

  return (
    <AppPage>
      <div className="flex flex-col gap-3 md:min-h-[72px] md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[3rem] font-extrabold leading-none text-[#0b2f4e]">Panel de Control</h1>
          <p className="mt-2 text-sm text-slate-500">
            Administra la configuración general de la plataforma.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            onClick={() => navigate("/config/universities")}
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            Universidades
          </Button>
          <Button
            type="button"
            className="h-10 rounded-lg bg-[#18b566] px-5 text-sm font-semibold text-white hover:bg-[#129a56]"
            onClick={() => navigate("/config/users")}
          >
            <Users className="mr-2 h-4 w-4" />
            Gestión de Cuentas
          </Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <AppSurface key={kpi.label} className="px-5 py-5">
            <div className="flex items-center gap-3">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.bg} ${kpi.accent}`}>
                <kpi.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
              </div>
            </div>
          </AppSurface>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AppSurface className="lg:col-span-2">
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="text-sm font-semibold text-slate-900">Actividad reciente</h2>
          </div>
          <div className="mt-3 divide-y divide-slate-100 px-5 pb-5">
            {recentUsers.map((user) => (
              <div key={user.email} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {user.role}
                  </span>
                  <span className="text-xs text-slate-400">{user.date}</span>
                </div>
              </div>
            ))}
          </div>
        </AppSurface>

        <AppSurface>
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="text-sm font-semibold text-slate-900">Pendientes</h2>
          </div>
          <div className="mt-3 flex flex-col gap-3 px-5 pb-5">
            {alerts.map((alert) => (
              <div key={alert.title} className={`flex items-start gap-3 rounded-xl ${alert.bg} px-3 py-3`}>
                <alert.icon className={`mt-0.5 h-4 w-4 shrink-0 ${alert.accent}`} />
                <div>
                  <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </AppSurface>
      </div>

      <AppSurface className="mt-6">
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-sm font-semibold text-slate-900">Universidades recientes</h2>
          <Button
            type="button"
            variant="ghost"
            className="h-8 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
            onClick={() => navigate("/config/universities")}
          >
            Ver todas
          </Button>
        </div>
        <div className="mt-3 divide-y divide-slate-100 px-5 pb-5">
          {recentUniversities.map((university) => (
            <div key={university.name} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{university.name}</p>
                  <p className="text-xs text-slate-500">{university.campuses} campuses</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">{university.date}</span>
            </div>
          ))}
        </div>
      </AppSurface>
    </AppPage>
  );
}