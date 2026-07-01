import { AppPage, AppSurface } from "@/shared/components/AppPage";
import { useQuery } from "@tanstack/react-query";
import { Building2, GraduationCap, MapPin, Users } from "lucide-react";
import { getControlPanel } from "../services/PanelControlService";

const CONTROL_PANEL_QUERY_KEY = "admin-control-panel";

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

interface KpiCardProps {
  label: string;
  value: string;
  icon: typeof Users;
  accent: string;
  bg: string;
  cardBg: string;
}

function KpiCard({ label, value, icon: Icon, accent, bg, cardBg }: KpiCardProps) {
  return (
    <AppSurface className={`flex items-center gap-4 rounded-3xl px-6 py-6 ${cardBg}`}>
      <span className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl ${bg} ${accent}`}>
        <Icon className="h-12 w-12" />
      </span>
      <div className="flex-1 text-center">
        <p className="text-lg font-bold text-slate-700">{label}</p>
        <p className="text-6xl font-extrabold text-slate-900">{value}</p>
      </div>
    </AppSurface>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <AppSurface className="flex items-center gap-4 rounded-3xl px-6 py-6">
      <div className="h-24 w-24 shrink-0 animate-pulse rounded-2xl bg-slate-100" />
      <div className="flex-1 space-y-2 flex flex-col items-center">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
        <div className="h-14 w-24 animate-pulse rounded bg-slate-100" />
      </div>
    </AppSurface>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ControlPanelPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: [CONTROL_PANEL_QUERY_KEY],
    queryFn: getControlPanel,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  return (
    <AppPage>
      <div>
        <h1 className="text-[3rem] font-extrabold leading-none text-[#0b2f4e]">Panel de Control</h1>
        <p className="mt-2 text-sm text-slate-500">
          Estructura y actividad reciente de la plataforma.
        </p>
      </div>

      {/* KPIs */}
      <div className="flex min-h-[calc(100vh-260px)] items-center justify-center">
        <div className="grid grid-cols-2 gap-12">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <KpiCard
                label="Universidades Activas"
                value={String(data?.kpis.activeUniversities ?? 0)}
                icon={GraduationCap}
                accent="text-sky-600"
                bg="bg-sky-100"
                cardBg="bg-sky-50"
              />
              <KpiCard
                label="Campuses Activos"
                value={String(data?.kpis.activeCampuses ?? 0)}
                icon={Building2}
                accent="text-violet-600"
                bg="bg-violet-100"
                cardBg="bg-violet-50"
              />
              <KpiCard
                label="Empleados Vigentes"
                value={String(data?.kpis.activeEmployees ?? 0)}
                icon={Users}
                accent="text-emerald-600"
                bg="bg-emerald-100"
                cardBg="bg-emerald-50"
              />
              <KpiCard
                label="Recicladores Activos"
                value={(data?.kpis.registeredUsers ?? 0).toLocaleString("es-PE")}
                icon={MapPin}
                accent="text-slate-600"
                bg="bg-slate-200"
                cardBg="bg-slate-100"
              />
            </>
          )}
        </div>
      </div>

      {!!error && (
        <p className="mt-4 text-center text-sm text-red-600">
          No se pudo cargar el panel. Intenta nuevamente.
        </p>
      )}
    </AppPage>
  );
}