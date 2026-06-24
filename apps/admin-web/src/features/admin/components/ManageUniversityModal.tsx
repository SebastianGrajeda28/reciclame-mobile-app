import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Check, Copy, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    createUniversityCampuses,
    getUniversityCampuses,
    MAX_CAMPUSES_PER_UNIVERSITY,
    type AppUniversity,
    type CampusSortColumn,
} from "../services/AdminUniversitiesService";

interface Props {
  university: AppUniversity;
  onClose: () => void;
  onUpdated: () => void;
}

type CampusTab = "active" | "inactive";

type DraftCampus = {
  key: string;
  name: string;
  address: string;
};

const SEARCH_DEBOUNCE_MS = 500;

function tabClasses(selected: boolean) {
  return `rounded-md px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
    selected ? "bg-[#18b566] text-white" : "text-slate-600 hover:bg-slate-100"
  }`;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-2 shrink-0 rounded p-0.5 text-gray-400 transition hover:text-gray-600"
      aria-label="Copiar"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-[#18b566]" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-36 shrink-0 text-gray-500">{label}</span>
      <div className="min-w-0 flex-1 overflow-x-auto">
        <span className={`whitespace-nowrap font-medium text-gray-700 ${mono ? "font-mono text-xs" : ""}`}>
          {value}
        </span>
      </div>
      <div className="shrink-0 pl-2">
        <CopyButton value={value} />
      </div>
    </div>
  );
}

function createDraftKey() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ManageUniversityModal({ university, onClose, onUpdated }: Props) {
  // Lista de campuses existentes
  const [campusTab, setCampusTab] = useState<CampusTab>("active");
  const [campusSearch, setCampusSearch] = useState("");
  const [debouncedCampusSearch, setDebouncedCampusSearch] = useState("");

  // Filas nuevas (sin guardar todavía)
  const [draftCampuses, setDraftCampuses] = useState<DraftCampus[]>([]);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedCampusSearch(campusSearch.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [campusSearch]);

  const campusIsActive = campusTab === "active";

  const {
    data: campusData,
    isLoading: campusesLoading,
    isFetching: campusesFetching,
    error: campusesError,
    refetch: refetchCampuses,
  } = useQuery({
    queryKey: ["admin-university-campuses", university.id, campusIsActive, debouncedCampusSearch],
    queryFn: () =>
      getUniversityCampuses({
        universityId: university.id,
        limit: MAX_CAMPUSES_PER_UNIVERSITY,
        offset: 0,
        isActive: campusIsActive,
        search: debouncedCampusSearch,
        sortBy: "name" as CampusSortColumn,
        sortDir: "asc",
      }),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const campuses = campusData?.campuses ?? [];

  const validDraftCampuses = draftCampuses.filter((draft) => draft.name.trim().length > 0);
  const hasChanges = validDraftCampuses.length > 0;
  const totalCampusesAfterSave = campuses.length + draftCampuses.length;
  const reachedMax = totalCampusesAfterSave >= MAX_CAMPUSES_PER_UNIVERSITY;

  function handleAddDraftRow() {
    if (reachedMax) return;
    setDraftCampuses((prev) => [...prev, { key: createDraftKey(), name: "", address: "" }]);
  }

  function handleRemoveDraftRow(key: string) {
    setDraftCampuses((prev) => prev.filter((draft) => draft.key !== key));
  }

  function updateDraftRow(key: string, field: "name" | "address", value: string) {
    setDraftCampuses((prev) =>
      prev.map((draft) => (draft.key === key ? { ...draft, [field]: value } : draft))
    );
  }

  async function handleConfirmSave() {
    if (!hasChanges) return;

    setSaving(true);
    try {
      await createUniversityCampuses({
        universityId: university.id,
        campuses: validDraftCampuses.map((draft) => ({
          name: draft.name,
          address: draft.address.trim() ? draft.address.trim() : null,
        })),
      });
      toast.success("Campuses agregados correctamente");
      setDraftCampuses([]);
      refetchCampuses();
      onUpdated();
      setShowConfirm(false);
    } catch (err) {
      console.error("Error al crear campuses:", err);
      toast.error(err instanceof Error ? err.message : "Error al crear los campuses");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="mb-4 text-lg font-bold">Detalle de Universidad</h2>

          <div className="mb-5 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm">
            <DetailRow label="ID" value={university.id} mono />
            <DetailRow label="Nombre" value={university.name} />
            <DetailRow label="Estado" value={university.isActive ? "Activa" : "Inactiva"} />
            <DetailRow label="Campuses" value={String(university.campusCount)} />
            <DetailRow label="Puntos de reciclaje" value={String(university.recyclingPointCount)} />
            <DetailRow
              label="Últ. modificación"
              value={
                university.lastModifiedAt
                  ? new Date(university.lastModifiedAt).toLocaleString("es-PE")
                  : "—"
              }
            />
            <DetailRow label="Creado" value={new Date(university.createdAt).toLocaleString("es-PE")} />
          </div>

          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-gray-700">Campuses</p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-[200px]">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={campusSearch}
                  onChange={(event) => setCampusSearch(event.target.value)}
                  placeholder="Buscar campus..."
                  className="h-8 bg-white pl-8 pr-7 text-xs"
                />
                {campusSearch && (
                  <button
                    type="button"
                    aria-label="Limpiar búsqueda"
                    onClick={() => setCampusSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="inline-flex rounded-lg border border-[#d9dee2] bg-white p-1">
                <button
                  type="button"
                  onClick={() => setCampusTab("active")}
                  className={tabClasses(campusTab === "active")}
                >
                  Activos
                </button>
                <button
                  type="button"
                  onClick={() => setCampusTab("inactive")}
                  className={tabClasses(campusTab === "inactive")}
                >
                  Inactivos
                </button>
              </div>
            </div>
          </div>

          {campusesLoading ? (
            <p className="text-sm text-gray-400">Cargando...</p>
          ) : campusesError ? (
            <p className="text-sm text-red-500">Error al cargar campuses</p>
          ) : (
            <div
              className={`overflow-hidden rounded-xl border border-slate-200 bg-white transition-opacity ${
                campusesFetching ? "opacity-60" : "opacity-100"
              }`}
            >
              <div className="max-h-72 overflow-y-auto">
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow className="border-slate-200 hover:bg-transparent">
                      <TableHead className="border-r border-slate-200 text-left">Nombre</TableHead>
                      <TableHead className="border-r border-slate-200 text-left">Dirección</TableHead>
                      <TableHead className="border-r border-slate-200 text-center">Estado</TableHead>
                      <TableHead className="border-r border-slate-200 text-center">Puntos</TableHead>
                      <TableHead className="w-10 text-center" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campuses.length === 0 && draftCampuses.length === 0 && (
                      <TableRow className="border-slate-200">
                        <TableCell colSpan={5} className="py-6 text-center text-sm text-gray-400">
                          {debouncedCampusSearch
                            ? "No hay campuses que coincidan con la búsqueda."
                            : campusTab === "active"
                              ? "Esta universidad no tiene campuses activos."
                              : "Esta universidad no tiene campuses inactivos."}
                        </TableCell>
                      </TableRow>
                    )}

                    {campuses.map((campus) => (
                      <TableRow key={campus.id} className="border-slate-200">
                        <TableCell className="truncate border-r border-slate-200 text-left font-medium">
                          {campus.name}
                        </TableCell>
                        <TableCell className="truncate border-r border-slate-200 text-left text-sm text-slate-500">
                          {campus.address ?? "—"}
                        </TableCell>
                        <TableCell className="border-r border-slate-200 text-center">
                          <Badge variant={campus.isActive ? "default" : "secondary"}>
                            {campus.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="border-r border-slate-200 text-center text-sm text-slate-500">
                          {campus.recyclingPointCount}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    ))}

                    {draftCampuses.map((draft) => (
                      <TableRow key={draft.key} className="border-slate-200 bg-slate-50/60">
                        <TableCell className="border-r border-slate-200 p-2">
                          <Input
                            autoFocus
                            value={draft.name}
                            onChange={(event) => updateDraftRow(draft.key, "name", event.target.value)}
                            placeholder="Nombre del campus"
                            className="h-8 bg-white text-xs"
                          />
                        </TableCell>
                        <TableCell className="border-r border-slate-200 p-2">
                          <Input
                            value={draft.address}
                            onChange={(event) => updateDraftRow(draft.key, "address", event.target.value)}
                            placeholder="Dirección (opcional)"
                            className="h-8 bg-white text-xs"
                          />
                        </TableCell>
                        <TableCell className="border-r border-slate-200 text-center text-xs text-gray-400">
                          Pendiente
                        </TableCell>
                        <TableCell className="border-r border-slate-200 text-center text-xs text-gray-400">
                          —
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            type="button"
                            aria-label="Eliminar fila"
                            onClick={() => handleRemoveDraftRow(draft.key)}
                            className="rounded-full p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full"
            onClick={handleAddDraftRow}
            disabled={reachedMax}
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar campus
          </Button>

          <Button
            type="button"
            className="mt-3 w-full"
            disabled={!hasChanges || saving}
            onClick={() => setShowConfirm(true)}
          >
            Guardar cambios
          </Button>
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={(open) => !open && !saving && setShowConfirm(false)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Guardar cambios?</AlertDialogTitle>
            <AlertDialogDescription>
              Se agregarán los siguientes campuses a {university.name}:
              <span className="mt-2 block space-y-1">
                {validDraftCampuses.map((draft) => (
                  <span key={draft.key} className="block">
                    <Badge variant="default">{draft.name.trim()}</Badge>
                    {draft.address.trim() && (
                      <span className="ml-2 text-xs text-gray-500">{draft.address.trim()}</span>
                    )}
                  </span>
                ))}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={saving} onClick={handleConfirmSave}>
              {saving ? "Guardando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}