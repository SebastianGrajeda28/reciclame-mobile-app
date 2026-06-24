import { useState } from "react";

export type ResidueDetailRow = {
  residue: string;
  scans: number;
  confirmed: number;
  rate: number;
  kilograms: number;
};

type ResidueComparisonGridProps = {
  rows: ResidueDetailRow[];
};

const PALETTE = ["#0b2f4e", "#22c76f", "#1c8fdf", "#f4b740", "#e2557c", "#7b5cf0", "#129a56", "#d97706", "#0ea5b3", "#94a3b8"];

function colorFor(index: number) {
  return PALETTE[index % PALETTE.length];
}

function fmt(value: number): string {
  if (value >= 1_000_000) {
    const n = value / 1_000_000;
    return `${n % 1 === 0 ? n.toFixed(0) : parseFloat(n.toFixed(2))}M`;
  }
  if (value >= 1_000) {
    const n = value / 1_000;
    return `${n % 1 === 0 ? n.toFixed(0) : parseFloat(n.toFixed(1))}k`;
  }
  return `${value}`;
}

function lighten(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 0xff) + 80);
  const g = Math.min(255, ((n >> 8) & 0xff) + 80);
  const b = Math.min(255, (n & 0xff) + 80);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function GroupedBarChart({ rows }: { rows: ResidueDetailRow[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; row: ResidueDetailRow } | null>(null);
  const totalScans = rows.reduce((sum, r) => sum + r.scans, 0);
  const totalConfirmed = rows.reduce((sum, r) => sum + r.confirmed, 0);
  const maxVal = Math.max(...rows.flatMap((r) => [r.scans, r.confirmed]), 1);

  return (
    <>
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 flex flex-col gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-xs text-center"
          style={{ top: tooltip.y - 36, left: tooltip.x + 24 }}
        >
          <p className="font-bold text-[#0b2f4e] mb-1">{tooltip.row.residue}</p>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: lighten(colorFor(rows.indexOf(tooltip.row))) }} />
            <span className="text-slate-500">Escaneos</span>
            <span className="font-bold text-[#0b2f4e] ml-1">{tooltip.row.scans.toLocaleString("es-PE")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: colorFor(rows.indexOf(tooltip.row)) }} />
            <span className="text-slate-500">Registros</span>
            <span className="font-bold text-[#0b2f4e] ml-1">{tooltip.row.confirmed.toLocaleString("es-PE")}</span>
          </div>
          <div className="mt-1 border-t border-slate-100 pt-1 w-full text-center">
            <span className="text-slate-400">Tasa </span>
            <span className="font-bold text-[#0b2f4e]">
              {tooltip.row.scans > 0 ? `${Math.round((tooltip.row.confirmed / tooltip.row.scans) * 100)}%` : "—"}
            </span>
          </div>
        </div>
      )}
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start gap-x-6 gap-y-1">
        <div>
          <h4 className="text-[1.05rem] font-bold text-[#0b2f4e]">Escaneos vs Registros</h4>
        </div>
        <div className="flex gap-4 mt-0.5">
          <p className="text-[1.4rem] font-extrabold text-[#0b2f4e] leading-none">
            {fmt(totalScans)}
            <span className="ml-1 text-xs font-medium text-slate-400">escaneos</span>
          </p>
          <p className="text-[1.4rem] font-extrabold text-[#0b2f4e] leading-none">
            {fmt(totalConfirmed)}
            <span className="ml-1 text-xs font-medium text-slate-400">registros</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-5">
        {rows.map((row, index) => {
          const dark = colorFor(index);
          const light = lighten(dark);
          const scanPct = Math.max(row.scans / maxVal, 0.02);
          const confPct = Math.max(row.confirmed / maxVal, 0.02);

          return (
            <div
              key={row.residue}
              className="relative flex items-center gap-3"
              onMouseLeave={() => setTooltip(null)}
            >
              <span className="w-[100px] shrink-0 text-xs font-semibold text-[#0b2f4e] text-right">{row.residue}</span>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 rounded-full"
                    style={{ width: `${Math.round(scanPct * 100)}%`, backgroundColor: light }}
                    onMouseMove={(e) => setTooltip({ x: e.clientX, y: e.clientY, row })}
                  />
                  <span className="text-[10px] font-bold text-slate-500">{fmt(row.scans)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 rounded-full"
                    style={{ width: `${Math.round(confPct * 100)}%`, backgroundColor: dark }}
                    onMouseMove={(e) => setTooltip({ x: e.clientX, y: e.clientY, row })}
                  />
                  <span className="text-[10px] font-bold text-slate-500">{fmt(row.confirmed)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}

function KgVerticalBar({ rows }: { rows: ResidueDetailRow[] }) {
  const hasData = rows.length > 0 && rows.some((row) => row.kilograms > 0);
  const total = rows.reduce((sum, row) => sum + row.kilograms, 0);
  const maxVal = Math.max(...rows.map((r) => r.kilograms), 1);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; row: ResidueDetailRow } | null>(null);

    return (
    <>
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 flex flex-col gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-xs text-center"
          style={{ top: tooltip.y - 28, left: tooltip.x + 24 }}
        >
          <p className="font-bold text-[#0b2f4e] mb-1">{tooltip.row.residue}</p>
          <p className="text-slate-600">{tooltip.row.kilograms.toLocaleString("es-PE")}</p>
          <p className="text-slate-400">
            {(() => {
              const pct = (tooltip.row.kilograms / total) * 100;
              const fixed2 = parseFloat(pct.toFixed(2));
              return `${fixed2}%`;
            })()}
          </p>
        </div>
      )}
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h4 className="text-[1.05rem] font-bold text-[#0b2f4e]">Kg totales</h4>
      <p className="mt-0.5 text-[1.4rem] font-extrabold text-[#0b2f4e] leading-none">
        {fmt(total)}
        <span className="ml-1 text-xs font-medium text-slate-400">kg totales</span>
      </p>
      <div className="mt-3 flex flex-1 overflow-x-auto pb-1">
        <div className="flex min-w-full items-end justify-center gap-2">
        {hasData ? (
          rows.map((row, index) => {
            const pct = Math.max(row.kilograms / maxVal, 0.03);
            return (
               <div
                    key={row.residue}
                    className="flex w-[150px] shrink-0 flex-col items-center justify-end gap-1"
                    onMouseMove={(e) => setTooltip({ x: e.clientX, y: e.clientY, row })}
                    onMouseLeave={() => setTooltip(null)}
                >
                <span className="text-[10px] font-bold text-[#0b2f4e]">{fmt(row.kilograms)}</span>
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{
                    height: `${Math.round(pct * 160)}px`,
                    backgroundColor: colorFor(index),
                  }}
                />
                <span
                  className="text-[10px] font-semibold text-[#0b2f4e] text-center w-full truncate"
                  title={row.residue}
                >
                  {row.residue}
                </span>
              </div>
            );
          })
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold text-[#0b2f4e]">Sin datos</p>
            <p className="mt-1 text-xs text-slate-500">No hay kg registrados en el periodo.</p>
          </div>
        )}
      </div>
      </div>
    </div>
    </>
  );
}

export function ResidueComparisonGrid({ rows }: ResidueComparisonGridProps) {
  return (
    <div className="flex flex-col gap-4">
      <GroupedBarChart rows={rows} />
      <KgVerticalBar rows={rows} />
    </div>
  );
}

