import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppPage, AppSurface } from "../components/AppPage";

const metrics = [
  { title: "USUARIOS TOTALES", value: "1234", subtitle: "usuarios registrados en el sistema", delta: "+18% este mes", detail: "" },
  { title: "EVENTOS DE RECICLAJE", value: "567", subtitle: "eventos completados", delta: "+10% este mes", detail: "32 eventos" },
  { title: "PESO RECICLADO", value: "16.2 kg", subtitle: "peso total del material", delta: "+10% este mes", detail: "124 items" },
  { title: "PROMEDIO DE ITEMS", value: "2.5", subtitle: "promedio por evento", delta: "+1% este mes", detail: "120 items" },
  { title: "TIPO MAS RECICLADO", value: "PLASTICO", subtitle: "residuo mas reciclado", delta: "+11% este mes", detail: "" },
  { title: "USUARIOS NUEVOS", value: "45", subtitle: "registrados este mes", delta: "+22% este mes", detail: "5 registros" },
];

function MetricCard({
  title,
  value,
  subtitle,
  delta,
  detail,
}: {
  title: string;
  value: string;
  subtitle: string;
  delta: string;
  detail: string;
}) {
  return (
    <article className="relative min-h-[156px] overflow-hidden rounded-lg bg-[#0b2f4e] px-6 py-5 text-white shadow-[0_8px_18px_rgba(11,47,78,0.18)]">
      <div className="absolute right-4 top-4 h-9 w-9 rounded-full bg-[#22c76f]" />
      <p className="text-sm font-extrabold">{title}</p>
      <p className="mt-3 text-[2rem] font-extrabold leading-8">{value}</p>
      <p className="mt-2 text-sm text-white/75">{subtitle}</p>
      <div className="mt-4 flex items-center gap-2 text-[11px]">
        <span className="rounded-full bg-[#0f8f57] px-2 py-1 font-medium text-[#9ff5c6]">{delta}</span>
        {detail ? <span className="text-white/70">{detail}</span> : null}
      </div>
    </article>
  );
}

export default function MetricsDashboard() {
  return (
    <AppPage>
      <h1 className="text-[3rem] font-extrabold leading-none text-[#0b2f4e]">
        Metricas consolidadas
      </h1>

      <AppSurface className="mt-12 rounded-2xl bg-[#eef3f8] px-5 py-6 shadow-[0_3px_0_rgba(15,23,42,0.08),0_12px_24px_rgba(15,23,42,0.06)] md:px-7">
          <h2 className="text-[2rem] font-bold leading-none text-[#0b2f4e]">Filtrar metricas</h2>

          <div className="mt-8 grid gap-4 md:grid-cols-[1fr_1fr_240px] md:items-end">
            <label className="block">
              <span className="mb-2 block text-base font-semibold text-[#0b2f4e]">Rango de fechas</span>
              <div className="flex h-12 items-center justify-between rounded-lg border border-[#d9dee2] bg-white px-4 text-sm text-slate-500 shadow-sm">
                <span>Ultimos 7 dias</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-base font-semibold text-[#0b2f4e]">Tipo de residuo</span>
              <div className="flex h-12 items-center justify-between rounded-lg border border-[#d9dee2] bg-white px-4 text-sm text-slate-500 shadow-sm">
                <span>Todos</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </label>

            <Button className="h-12 rounded-md bg-[#18b566] text-base font-semibold text-white hover:bg-[#129a56]">
              Aplicar filtros
            </Button>
          </div>
      </AppSurface>

      <AppSurface className="mt-8 grid gap-10 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={`${metric.title}-${metric.value}`} {...metric} />
        ))}
      </AppSurface>
    </AppPage>
  );
}
