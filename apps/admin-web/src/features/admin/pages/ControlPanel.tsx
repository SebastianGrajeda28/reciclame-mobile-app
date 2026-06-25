import { AppPage, AppSurface } from "@/shared/components/AppPage";
import { useQuery } from "@tanstack/react-query";
import { Building2, GraduationCap, MapPin, Users } from "lucide-react";
import {
  getControlPanel,
  type RecentCampus,
  type RecentEmployee,
  type RecentUniversity,
} from "../services/AdminPanelControlService";

const CONTROL_PANEL_QUERY_KEY = "admin-control-panel";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "Justo ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `Hace ${days} d`;
}

function translateRole(roleName: string): string {
  if (roleName.toUpperCase() === "ADMIN") return "Administrador";
  if (roleName.toUpperCase() === "MANAGER") return "Manager";
  return roleName;
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

interface KpiCardProps {
  label: string;
  value: string;
  icon: typeof Users;
  accent: string;
  bg: string;
}

function KpiCard({ label, value, icon: Icon, accent, bg }: KpiCardProps) {
  return (
    <AppSurface className="px-5 py-5">
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg} ${accent}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="truncate text-xs font-medium text-slate-500">{label}</p>
        </div>
      </div>
    </AppSurface>
  );
}

// ---------------------------------------------------------------------------
// Activity columns
// ---------------------------------------------------------------------------

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
      Activo
    </span>
  ) : (
    <span className="inline-flex items-center rounded-md border border-rose-200 bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
      Inactivo
    </span>
  );
}

function UniversityRow({ entry }: { entry: RecentUniversity }) {
  return (
    <div className="py-3">
      <div className="flex items-center gap-2">
        <StatusBadge isActive={entry.isActive} />
      </div>
      <p className="mt-1 truncate text-sm font-medium text-slate-900" title={entry.name}>
        {entry.name}
      </p>
      <p className="mt-0.5 text-xs text-slate-400">{timeAgo(entry.lastModifiedAt)}</p>
    </div>
  );
}

function CampusRow({ entry }: { entry: RecentCampus }) {
  return (
    <div className="py-3">
      <div className="flex items-center gap-2">
        <StatusBadge isActive={entry.isActive} />
      </div>
      <p className="mt-1 truncate text-sm font-medium text-slate-900" title={entry.name}>
        {entry.name}
      </p>
      <p className="mt-0.5 truncate text-xs text-slate-500">{entry.universityName}</p>
      <p className="mt-0.5 text-xs text-slate-400">{timeAgo(entry.lastModifiedAt)}</p>
    </div>
  );
}

function EmployeeRow({ entry }: { entry: RecentEmployee }) {
  return (
    <div className="py-3">
      <div className="flex items-center gap-2">
        <StatusBadge isActive={entry.isActive} />
        <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          {translateRole(entry.roleName)}
        </span>
      </div>
      <p className="mt-1 truncate text-sm font-medium text-slate-900" title={entry.email}>
        {entry.email}
      </p>
      <p className="mt-0.5 text-xs text-slate-400">{timeAgo(entry.lastModifiedAt)}</p>
    </div>
  );
}

interface ActivityColumnProps<T> {
  title: string;
  icon: typeof Users;
  iconBg: string;
  iconColor: string;
  entries: T[];
  renderRow: (entry: T) => React.ReactNode;
}

function ActivityColumn<T extends { id: string }>({
  title,
  icon: Icon,
  iconBg,
  iconColor,
  entries,
  renderRow,
}: ActivityColumnProps<T>) {
  return (
    <AppSurface className="flex flex-col">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="divide-y divide-slate-100 px-5">
        {entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">Sin actividad reciente.</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id}>{renderRow(entry)}</div>
          ))
        )}
      </div>
    </AppSurface>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <AppSurface className="px-5 py-5">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-16 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    </AppSurface>
  );
}

function SkeletonColumn() {
  return (
    <AppSurface className="flex flex-col">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="divide-y divide-slate-100 px-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1.5 py-3">
            <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </AppSurface>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ControlPanel() {
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
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <KpiCard
              label="Universidades activas"
              value={String(data?.kpis.activeUniversities ?? 0)}
              icon={GraduationCap}
              accent="text-sky-600"
              bg="bg-sky-100"
            />
            <KpiCard
              label="Campuses activos"
              value={String(data?.kpis.activeCampuses ?? 0)}
              icon={Building2}
              accent="text-violet-600"
              bg="bg-violet-100"
            />
            <KpiCard
              label="Empleados con acceso vigente"
              value={String(data?.kpis.activeEmployees ?? 0)}
              icon={Users}
              accent="text-emerald-600"
              bg="bg-emerald-100"
            />
            <KpiCard
              label="Cuentas registradas (app)"
              value={(data?.kpis.registeredUsers ?? 0).toLocaleString("es-PE")}
              icon={MapPin}
              accent="text-slate-600"
              bg="bg-slate-100"
            />
          </>
        )}
      </div>

      {/* Activity log */}
      <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Actividad reciente
      </p>

      {!!error && (
        <p className="mt-2 text-sm text-red-600">
          No se pudo cargar el panel. Intenta nuevamente.
        </p>
      )}

      <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonColumn key={i} />)
        ) : (
          <>
            <ActivityColumn
              title="Universidades"
              icon={GraduationCap}
              iconBg="bg-sky-100"
              iconColor="text-sky-600"
              entries={data?.recentActivityByType.university ?? []}
              renderRow={(entry) => <UniversityRow entry={entry} />}
            />
            <ActivityColumn
              title="Campuses"
              icon={Building2}
              iconBg="bg-violet-100"
              iconColor="text-violet-600"
              entries={data?.recentActivityByType.campus ?? []}
              renderRow={(entry) => <CampusRow entry={entry} />}
            />
            <ActivityColumn
              title="Empleados"
              icon={Users}
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
              entries={data?.recentActivityByType.employee ?? []}
              renderRow={(entry) => <EmployeeRow entry={entry} />}
            />
          </>
        )}
      </div>
    </AppPage>
  );
}