import { useMemo, useState } from "react";
import { CalendarIcon, ChevronDown, Package2, Recycle, Scale, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts";
import { AppPage, AppSurface } from "../components/AppPage";

type DatePreset = "last7" | "last30" | "historical" | "custom";

const recyclingMetrics = [
  {
    title: "Eventos de reciclaje",
    value: "567",
    subtitle: "eventos completados",
    delta: "+10% este mes",
    detail: "32 esta semana",
    icon: Recycle,
  },
  {
    title: "Peso reciclado",
    value: "16.2 kg",
    subtitle: "material recolectado",
    delta: "+10% este mes",
    detail: "124 items",
    icon: Scale,
  },
  {
    title: "Promedio de items",
    value: "2.5",
    subtitle: "por evento de reciclaje",
    delta: "+1% este mes",
    detail: "1.9 kg promedio",
    icon: Package2,
  },
];

const categoryMetrics = [
  { key: "plastico", name: "Plástico", weightKg: 42.8, events: 182, share: 42, trend: "+12%" },
  { key: "papel", name: "Papel", weightKg: 27.3, events: 143, share: 27, trend: "+7%" },
  { key: "vidrio", name: "Vidrio", weightKg: 18.9, events: 94, share: 18, trend: "+4%" },
  { key: "metal", name: "Metal", weightKg: 12.7, events: 71, share: 13, trend: "+3%" },
  { key: "carton", name: "Cartón", weightKg: 11.1, events: 63, share: 11, trend: "+6%" },
  { key: "tetrapak", name: "Tetra Pak", weightKg: 9.8, events: 51, share: 10, trend: "+5%" },
  { key: "electronicos", name: "Electrónicos", weightKg: 8.4, events: 26, share: 8, trend: "+9%" },
  { key: "textiles", name: "Textiles", weightKg: 6.2, events: 19, share: 6, trend: "+2%" },
  { key: "organicos", name: "Orgánicos", weightKg: 5.5, events: 14, share: 5, trend: "+4%" },
];

const residueOptions = categoryMetrics.map(({ key, name }) => ({ key, name }));

const categoryChartConfig = {
  share: {
    label: "Participación",
    color: "#22c76f",
  },
} satisfies ChartConfig;

const weeklyChartConfig = {
  value: {
    label: "Eventos",
    color: "#22c76f",
  },
} satisfies ChartConfig;

function SummaryCard({
  title,
  value,
  subtitle,
  delta,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  delta: string;
  detail: string;
  icon: typeof Users;
}) {
  return (
    <article className="relative min-h-[176px] overflow-hidden rounded-lg bg-[#0b2f4e] px-6 py-5 text-white shadow-[0_10px_28px_rgba(11,47,78,0.18)]">
      <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#22c76f] text-[#08324f]">
        <Icon className="h-5 w-5" />
      </div>

      <p className="pr-14 text-sm font-extrabold uppercase tracking-[0.02em]">{title}</p>
      <p className="mt-4 text-[2.2rem] font-extrabold leading-9">{value}</p>
      <p className="mt-2 text-sm text-white/76">{subtitle}</p>

      <div className="mt-6 flex items-center gap-2 text-[11px]">
        <span className="rounded-full bg-[#0f8f57] px-2 py-1 font-medium text-[#9ff5c6]">{delta}</span>
        <span className="text-white/72">{detail}</span>
      </div>
    </article>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function differenceInDaysInclusive(dateFrom: Date, dateTo: Date) {
  const start = startOfDay(dateFrom).getTime();
  const end = startOfDay(dateTo).getTime();
  return Math.max(1, Math.floor((end - start) / 86400000) + 1);
}

function formatShortDay(date: Date) {
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short" }).format(date);
}

function formatShortMonth(date: Date) {
  return new Intl.DateTimeFormat("es-PE", { month: "short", year: "2-digit" }).format(date);
}

function buildMockValue(seed: number, weight = 0) {
  const wave = Math.sin(seed * 1.35 + weight) * 8;
  const pulse = ((seed * 11) % 17) + 14;
  return Math.max(8, Math.round(pulse + wave));
}

function buildActivitySeries(dateFrom: Date, dateTo: Date, selectedResidues: string[]) {
  const totalDays = differenceInDaysInclusive(dateFrom, dateTo);
  const residueWeight = selectedResidues.reduce((sum, residue, index) => sum + residue.length + index * 3, 0) || 11;
  const selectionFactor = Math.max(0.5, selectedResidues.length / residueOptions.length);
  const buildSeriesValue = (seed: number, weight: number, offset = 0) =>
    Math.max(4, Math.round((buildMockValue(seed, weight + residueWeight / 10) + offset) * selectionFactor));

  if (totalDays <= 14) {
    return {
      mode: "bar" as const,
      granularityLabel: "Vista diaria",
      description: `Eventos procesados durante los ultimos ${totalDays} dias.`,
      data: Array.from({ length: totalDays }, (_, index) => {
        const current = addDays(dateFrom, index);
        return {
          label: formatShortDay(current),
          value: buildSeriesValue(index, totalDays / 3),
        };
      }),
    };
  }

  if (totalDays <= 90) {
    const buckets = [];
    let cursor = startOfDay(dateFrom);
    let bucketIndex = 0;

    while (cursor <= dateTo) {
      const bucketStart = cursor;
      const bucketEnd = addDays(bucketStart, 6) > dateTo ? dateTo : addDays(bucketStart, 6);
      buckets.push({
        label: `${formatShortDay(bucketStart)} - ${formatShortDay(bucketEnd)}`,
        value: buildSeriesValue(bucketIndex, totalDays / 5, 18),
      });
      cursor = addDays(bucketEnd, 1);
      bucketIndex += 1;
    }

    return {
      mode: "line" as const,
      granularityLabel: "Vista semanal",
      description: "Eventos agregados por semana dentro del rango seleccionado.",
      data: buckets,
    };
  }

  const buckets = [];
  const cursor = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), 1);
  let bucketIndex = 0;

  while (cursor <= dateTo) {
    buckets.push({
      label: formatShortMonth(cursor),
      value: buildSeriesValue(bucketIndex, totalDays / 7, 26),
    });
    cursor.setMonth(cursor.getMonth() + 1);
    bucketIndex += 1;
  }

  return {
    mode: "line" as const,
    granularityLabel: "Vista mensual",
    description: "Eventos agregados por mes dentro del rango seleccionado.",
    data: buckets,
  };
}

function formatRangeLabel(dateFrom: Date, dateTo: Date) {
  return `${formatDate(dateFrom)} - ${formatDate(dateTo)}`;
}

function ResidueMultiSelect({
  selectedResidues,
  onToggle,
}: {
  selectedResidues: string[];
  onToggle: (key: string) => void;
}) {
  const allSelected = selectedResidues.length === residueOptions.length;
  const buttonLabel = allSelected ? "Todos los residuos" : `${selectedResidues.length} residuos`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-full border border-[#d7e6f2] bg-[#eef3f8] px-3 text-xs font-semibold text-[#0b2f4e] transition hover:border-[#bdd3e4]"
        >
          {buttonLabel}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Residuos visibles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {residueOptions.map((residue) => (
          <DropdownMenuCheckboxItem
            key={residue.key}
            checked={selectedResidues.includes(residue.key)}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={() => onToggle(residue.key)}
          >
            {residue.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function MetricsDashboard() {
  const [dateFrom, setDateFrom] = useState<Date>(new Date(2026, 5, 1));
  const [dateTo, setDateTo] = useState<Date>(new Date(2026, 5, 11));
  const [datePreset, setDatePreset] = useState<DatePreset>("last7");
  const [selectedResidues, setSelectedResidues] = useState<string[]>(() => residueOptions.map((item) => item.key));
  const filteredCategoryMetrics = useMemo(
    () => categoryMetrics.filter((metric) => selectedResidues.includes(metric.key)),
    [selectedResidues]
  );
  const activitySeries = useMemo(
    () => buildActivitySeries(dateFrom, dateTo, selectedResidues),
    [dateFrom, dateTo, selectedResidues]
  );
  const totalDays = useMemo(() => differenceInDaysInclusive(dateFrom, dateTo), [dateFrom, dateTo]);
  const usersMetric = useMemo(
    () => ({
      title: "Usuarios registrados",
      value: "1234",
      subtitle: "base total registrada en la plataforma",
      delta: `+${Math.max(5, Math.round(totalDays * 1.6))} nuevos`,
      detail: formatRangeLabel(dateFrom, dateTo),
      icon: Users,
    }),
    [dateFrom, dateTo, totalDays]
  );
  const categoryChartHeight = Math.max(360, filteredCategoryMetrics.length * 44 + 44);

  const toggleResidue = (key: string) => {
    setSelectedResidues((current) => {
      const exists = current.includes(key);

      if (exists) {
        return current.length === 1 ? current : current.filter((item) => item !== key);
      }

      return [...current, key];
    });
  };

  const applyPreset = (preset: DatePreset) => {
    setDatePreset(preset);

    if (preset === "custom") {
      return;
    }

    const base = new Date(2026, 5, 11);

    if (preset === "last7") {
      setDateFrom(addDays(base, -6));
      setDateTo(base);
      return;
    }

    if (preset === "last30") {
      setDateFrom(addDays(base, -29));
      setDateTo(base);
      return;
    }

    setDateFrom(new Date(2025, 0, 1));
    setDateTo(base);
  };

  return (
    <AppPage>
      <div className="flex flex-col gap-4 md:min-h-[88px] md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[3rem] font-extrabold leading-none text-[#0b2f4e]">
            Metricas consolidadas
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Vista general del rendimiento de reciclaje y participacion dentro de la plataforma.
          </p>
        </div>
        <div className="flex flex-wrap items-center content-center gap-3 md:self-center md:justify-end">
          {[
            { key: "last7", label: "Ultima semana" },
            { key: "last30", label: "Ultimo mes" },
            { key: "historical", label: "Histórico" },
          ].map((preset) => {
            const active =
              (preset.key === "last7" && datePreset === "last7") ||
              (preset.key === "last30" && datePreset === "last30") ||
              (preset.key === "historical" &&
                datePreset !== "last7" &&
                datePreset !== "last30" &&
                datePreset !== "custom");

            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => applyPreset(preset.key === "historical" ? ("historical" as DatePreset) : (preset.key as DatePreset))}
                className={cn(
                  "inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition",
                  active
                    ? "border-[#18b566] bg-[#18b566] text-white"
                    : "border-[#d7e6f2] bg-white text-[#0b2f4e] hover:border-[#b9d8c8]"
                )}
              >
                {preset.label}
              </button>
            );
          })}

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                onClick={() => setDatePreset("custom")}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition",
                  datePreset === "custom"
                    ? "border-[#18b566] bg-[#18b566] text-white"
                    : "border-[#d7e6f2] bg-white text-[#0b2f4e] hover:border-[#b9d8c8]"
                )}
              >
                Custom
                <CalendarIcon className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[340px] p-4">
              <div className="grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#0b2f4e]">Desde</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex h-11 w-full items-center justify-between rounded-lg border border-[#d9dee2] bg-white px-4 text-sm text-slate-500 shadow-sm transition hover:border-slate-300"
                      >
                        <span>{formatDate(dateFrom)}</span>
                        <CalendarIcon className="h-4 w-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={(date) => date && setDateFrom(date)}
                      />
                    </PopoverContent>
                  </Popover>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#0b2f4e]">Hasta</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex h-11 w-full items-center justify-between rounded-lg border border-[#d9dee2] bg-white px-4 text-sm text-slate-500 shadow-sm transition hover:border-slate-300"
                      >
                        <span>{formatDate(dateTo)}</span>
                        <CalendarIcon className="h-4 w-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={(date) => date && setDateTo(date)}
                        disabled={(date) => date < dateFrom}
                      />
                    </PopoverContent>
                  </Popover>
                </label>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <AppSurface className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {recyclingMetrics.map((metric) => (
          <SummaryCard key={metric.title} {...metric} />
        ))}
        <SummaryCard {...usersMetric} />
      </AppSurface>

      <AppSurface className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#0b2f4e]">Reciclaje por categoria</h2>
              <p className="mt-1 text-sm text-slate-500">
                Distribucion porcentual del peso reciclado por tipo de residuo.
              </p>
            </div>
            <ResidueMultiSelect selectedResidues={selectedResidues} onToggle={toggleResidue} />
          </div>

          <div className="mt-6">
            <ChartContainer
              config={categoryChartConfig}
              className="w-full aspect-auto"
              style={{ height: `${categoryChartHeight}px` }}
            >
              <BarChart
                accessibilityLayer
                data={filteredCategoryMetrics}
                layout="vertical"
                margin={{ top: 8, right: 36, left: 12, bottom: 8 }}
                barCategoryGap={18}
              >
                <CartesianGrid horizontal={false} stroke="#e5edf5" />
                <XAxis type="number" hide domain={[0, 50]} />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  width={82}
                  tick={{ fill: "#0b2f4e", fontSize: 14, fontWeight: 600 }}
                />
                <Bar
                  dataKey="share"
                  radius={999}
                  barSize={18}
                  fill="var(--color-share)"
                  isAnimationActive={false}
                  activeBar={false}
                >
                  <LabelList
                    dataKey="share"
                    position="right"
                    offset={10}
                    formatter={(value: number) => `${value}%`}
                    className="fill-[#0b2f4e] text-xs font-semibold"
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#0b2f4e]">Actividad del periodo</h2>
              <p className="mt-1 text-sm text-slate-500">{activitySeries.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {activitySeries.granularityLabel}
              </span>
              <ResidueMultiSelect selectedResidues={selectedResidues} onToggle={toggleResidue} />
            </div>
          </div>

          <div className="mt-8">
            <ChartContainer config={weeklyChartConfig} className="h-[280px] w-full aspect-auto">
              {activitySeries.mode === "bar" ? (
                <BarChart
                  accessibilityLayer
                  data={activitySeries.data}
                  margin={{ top: 16, right: 8, left: 8, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} stroke="#e5edf5" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                    tick={{ fill: "#0b2f4e", fontSize: 14, fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    width={28}
                    tick={{ fill: "#6b7c93", fontSize: 12 }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[14, 14, 0, 0]}
                    fill="var(--color-value)"
                    maxBarSize={56}
                    isAnimationActive={false}
                    activeBar={false}
                  >
                    <LabelList position="top" offset={8} className="fill-[#6b7c93] text-xs font-medium" />
                  </Bar>
                </BarChart>
              ) : (
                <LineChart
                  accessibilityLayer
                  data={activitySeries.data}
                  margin={{ top: 16, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} stroke="#e5edf5" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                    minTickGap={24}
                    tick={{ fill: "#0b2f4e", fontSize: 12, fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    width={28}
                    tick={{ fill: "#6b7c93", fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#22c76f", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#22c76f", strokeWidth: 0 }}
                    isAnimationActive={false}
                  >
                    <LabelList position="top" offset={10} className="fill-[#6b7c93] text-xs font-medium" />
                  </Line>
                </LineChart>
              )}
            </ChartContainer>
          </div>
        </section>
      </AppSurface>

      <AppSurface className="mt-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredCategoryMetrics.map((metric) => (
              <div key={metric.key} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#0b2f4e]">{metric.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{metric.events} eventos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#0b2f4e]">{metric.weightKg.toFixed(1)} kg</p>
                    <p className="text-xs font-semibold text-emerald-600">{metric.trend}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </AppSurface>

    </AppPage>
  );
}
