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
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getUniversityCampuses,
  MAX_CAMPUSES_PER_UNIVERSITY,
  updateUniversity,
  updateUniversityCampuses,
  type AppCampus,
  type AppUniversity,
  type CampusSortColumn,
} from "../services/AdminUniversitiesService";

interface Props {
  university: AppUniversity;
  onClose: () => void;
  onUpdated: () => void;
}

type DraftCampus = {
  key: string;
  name: string;
  address: string;
};

const SEARCH_DEBOUNCE_MS = 500;


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

function EditableDetailRow({
  label,
  value,
  canEdit = true,
  onChange,
}: {
  label: string;
  value: string;
  canEdit?: boolean;
  onChange?: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-36 shrink-0 text-gray-500">{label}</span>
      <div className="min-w-0 flex-1 overflow-x-auto">
        {editing && canEdit ? (
          <Input
            autoFocus
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onBlur={() => setEditing(false)}
            className="h-7 text-sm"
          />
        ) : (
          <span className="whitespace-nowrap font-medium text-gray-700">{value || "—"}</span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1 pl-1">
        {canEdit && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded p-0.5 text-gray-400 transition hover:text-gray-600"
            aria-label="Editar"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
        <CopyButton value={value} />
      </div>
    </div>
  );
}

function EditableCampusCell({
  value,
  placeholder,
  pending,
  readonly,
  onChange,
}: {
  value: string;
  placeholder?: string;
  pending?: boolean;
  readonly?: boolean;
  onChange?: (val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(() => value);

  if (pending) {
    return (
      <Input
        autoFocus
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="h-8 bg-white text-xs"
      />
    );
  }

  if (readonly) {
    return (
      <div className="flex w-full min-w-0 items-center gap-1">
        <span className="min-w-0 flex-1 truncate font-medium text-gray-700">{localValue || "—"}</span>
        <CopyButton value={localValue} />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 w-full items-center gap-1">
      {editing ? (
        <Input
          autoFocus
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() => {
            setEditing(false);
            onChange?.(localValue);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setEditing(false);
              onChange?.(localValue);
            } else if (e.key === "Escape") {
              setEditing(false);
              setLocalValue(value);
            }
          }}
          className="h-7 text-xs"
        />
      ) : (
        <>
          <span className="min-w-0 flex-1 truncate font-medium text-gray-700">{localValue || "—"}</span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 rounded p-0.5 text-gray-400 transition hover:text-gray-600"
            aria-label="Editar"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <CopyButton value={localValue} />
        </>
      )}
    </div>
  );
}

function createDraftKey() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ManageUniversityModal({ university, onClose, onUpdated }: Props) {
  const canEdit = university.isActive;
  const queryClient = useQueryClient();

  const [name, setName] = useState(university.name);
  // Tracks the last successfully saved name so nameChanged resets after saving
  // without relying on the stale `university` prop (which comes from the parent
  // list and only updates after onUpdated → invalidateQueries resolves).
  const [savedName, setSavedName] = useState(university.name);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const nameChanged = name.trim() !== savedName;

  const [campusEdits, setCampusEdits] = useState<Record<string, { name: string; address: string }>>({});
  // campusId → true=deactivate, false=restore
  const [pendingStatusChanges, setPendingStatusChanges] = useState<Record<string, boolean>>({});

  const [campusSearch, setCampusSearch] = useState("");
  const [debouncedCampusSearch, setDebouncedCampusSearch] = useState("");

  const [tableRevision, setTableRevision] = useState(0);

  const [draftCampuses, setDraftCampuses] = useState<DraftCampus[]>([]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedCampusSearch(campusSearch.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [campusSearch]);

  const campusIsActive = null;

  const {
    data: campusData,
    isLoading: campusesLoading,
    isFetching: campusesFetching,
    error: campusesError,
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

  const validDraftCampuses = draftCampuses.filter((d) => d.name.trim().length > 0);
  const totalCampusesAfterSave = campuses.length + draftCampuses.length;
  const reachedMax = totalCampusesAfterSave >= MAX_CAMPUSES_PER_UNIVERSITY;

  // Campuses with edits (name or address changed) — status changes handled separately
  const changedCampusEdits = Object.entries(campusEdits).filter(([campusId, edits]) => {
    const original = campuses.find((c) => c.id === campusId);
    if (!original) return false;
    const nameChanged = edits.name.trim() !== original.name;
    const addressChanged = (edits.address?.trim() || null) !== (original.address ?? null);
    return nameChanged || addressChanged;
  });

  const hasCampusUpserts =
    changedCampusEdits.length > 0 ||
    validDraftCampuses.length > 0 ||
    Object.keys(pendingStatusChanges).length > 0;

  const hasAnyChanges = nameChanged || hasCampusUpserts;

  function handleAddDraftRow() {
    if (reachedMax) return;
    setDraftCampuses((prev) => [...prev, { key: createDraftKey(), name: "", address: "" }]);
  }

  function handleRemoveDraftRow(key: string) {
    setDraftCampuses((prev) => prev.filter((d) => d.key !== key));
  }

  function updateDraftRow(key: string, field: "name" | "address", value: string) {
    setDraftCampuses((prev) =>
      prev.map((d) => (d.key === key ? { ...d, [field]: value } : d))
    );
  }

  function handleCampusFieldEdit(campus: AppCampus, field: "name" | "address", value: string) {
    setCampusEdits((prev) => ({
      ...prev,
      [campus.id]: {
        name: prev[campus.id]?.name ?? campus.name,
        address: prev[campus.id]?.address ?? (campus.address ?? ""),
        [field]: value,
      },
    }));
  }

  // Toggle pending status change for a campus.
  // active campus  → mark for deactivation (pendingStatusChanges[id] = false)
  // inactive campus → mark for restoration  (pendingStatusChanges[id] = true)
  // toggling again removes the pending change.
  function toggleStatusChange(campus: AppCampus) {
    setPendingStatusChanges((prev) => {
      if (campus.id in prev) {
        const next = { ...prev };
        delete next[campus.id];
        return next;
      }
      return { ...prev, [campus.id]: !campus.isActive };
    });
  }

  async function handleConfirmSave() {
    setSaving(true);
    const errors: string[] = [];

    // 1. Update university name
    if (nameChanged) {
      try {
        await updateUniversity(university.id, name.trim());
        setSavedName(name.trim());
      } catch (err) {
        errors.push(err instanceof Error ? err.message : "Error al actualizar la universidad");
      }
    }

    // 2. Single RPC call: edited campuses (name/address) + status changes + new drafts.
    //    Status-only campuses need their current name/address preserved in the payload.
    if (hasCampusUpserts) {
      try {
        // Build a merged map of all existing-campus changes keyed by id
        const existingById: Record<string, { name: string; address: string | null; isActive?: boolean }> = {};

        for (const [campusId, edits] of changedCampusEdits) {
          existingById[campusId] = {
            name: edits.name,
            address: edits.address || null,
            // Carry over pending status if also being toggled
            ...(campusId in pendingStatusChanges ? { isActive: pendingStatusChanges[campusId] } : {}),
          };
        }

        // Status-only changes (not already in changedCampusEdits)
        for (const [campusId, nextActive] of Object.entries(pendingStatusChanges)) {
          if (campusId in existingById) continue;
          const original = campuses.find((c) => c.id === campusId);
          if (!original) continue;
          existingById[campusId] = {
            name: original.name,
            address: original.address,
            isActive: nextActive,
          };
        }

        const upsertPayload = [
          ...Object.entries(existingById).map(([campusId, data]) => ({
            id: campusId,
            ...data,
          })),
          // New draft campuses (no id → INSERT in the RPC)
          ...validDraftCampuses.map((d) => ({
            name: d.name,
            address: d.address.trim() ? d.address.trim() : null,
          })),
        ];

        await updateUniversityCampuses({
          universityId: university.id,
          campuses: upsertPayload,
        });

        setCampusEdits({});
        setDraftCampuses([]);
        setPendingStatusChanges({});
      } catch (err) {
        errors.push(err instanceof Error ? err.message : "Error al actualizar los campuses");
      }
    }

    setSaving(false);
    setShowConfirm(false);

    if (errors.length > 0) {
      toast.error(errors[0]);
    } else {
      toast.success("Cambios guardados correctamente");
    }

    setTableRevision((r) => r + 1);
    // invalidateQueries bypasses staleTime and forces a fresh fetch,
    // ensuring the table reflects the saved state immediately.
    void queryClient.invalidateQueries({
      queryKey: ["admin-university-campuses", university.id],
    });
    onUpdated();
  }

  function getCampusDisplayName(campus: AppCampus) {
    return campusEdits[campus.id]?.name ?? campus.name;
  }

  function getCampusDisplayAddress(campus: AppCampus) {
    return campusEdits[campus.id]?.address ?? (campus.address ?? "");
  }

  // pendingStatusChanges[id] = true  → being restored
  // pendingStatusChanges[id] = false → being deactivated
  const isMarkedForDeactivation = (campusId: string) =>
    campusId in pendingStatusChanges && pendingStatusChanges[campusId] === false;

  const isMarkedForRestoration = (campusId: string) =>
    campusId in pendingStatusChanges && pendingStatusChanges[campusId] === true;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-xl">
          <div className="shrink-0 px-6 pt-6">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-1 text-lg font-bold">Gestionar Universidad</h2>
            {!canEdit && (
              <p className="mb-4 text-xs text-slate-400">
                Esta universidad está inactiva. Restáurala para poder editar.
              </p>
            )}
            {canEdit && <div className="mb-4" />}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2">
            <div className="mb-5 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm">
              <EditableDetailRow
                label="Nombre"
                value={name}
                canEdit={canEdit}
                onChange={setName}
              />
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
              <DetailRow
                label="Creado"
                value={new Date(university.createdAt).toLocaleString("es-PE")}
              />
            </div>

            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-gray-700">Campuses</p>
              <div className="relative w-full sm:w-[200px]">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={campusSearch}
                  onChange={(e) => setCampusSearch(e.target.value)}
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
                <div className="max-h-60 overflow-x-auto overflow-y-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="border-slate-200 hover:bg-transparent">
                        <TableHead className="min-w-[160px] border-r border-slate-200 text-left">Nombre</TableHead>
                        <TableHead className="min-w-[160px] border-r border-slate-200 text-left">Dirección</TableHead>
                        <TableHead className="min-w-[140px] border-r border-slate-200 text-center">Puntos de reciclaje</TableHead>
                        <TableHead
                          className={`min-w-[100px] text-center ${canEdit ? "border-r border-slate-200" : ""}`}
                        >
                          Estado
                        </TableHead>
                        {canEdit && (
                          <TableHead className="min-w-[110px] text-center">Acción</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campuses.length === 0 && draftCampuses.length === 0 && (
                        <TableRow className="border-slate-200">
                          <TableCell colSpan={canEdit ? 5 : 4} className="py-6 text-center text-sm text-gray-400">
                            {debouncedCampusSearch
                              ? "No hay campuses que coincidan con la búsqueda."
                              : "Esta universidad no tiene campuses registrados."}
                          </TableCell>
                        </TableRow>
                      )}

                      {campuses.map((campus) => {
                        const markedDeactivate = isMarkedForDeactivation(campus.id);
                        const markedRestore = isMarkedForRestoration(campus.id);
                        const isInactive = !campus.isActive;

                        return (
                          <TableRow
                            key={campus.id}
                            className={`border-slate-200 ${markedDeactivate ? "bg-red-50/50" : markedRestore ? "bg-green-50/50" : ""}`}
                          >
                            <TableCell className="border-r border-slate-200 p-2">
                              {isInactive ? (
                                <div className="flex w-full min-w-0 items-center gap-1">
                                  <span className="min-w-0 flex-1 truncate font-medium text-gray-700">
                                    {campus.name}
                                  </span>
                                  <CopyButton value={campus.name} />
                                </div>
                              ) : (
                                <EditableCampusCell
                                  key={`${campus.id}-name-${tableRevision}`}
                                  value={getCampusDisplayName(campus)}
                                  readonly={!canEdit || markedDeactivate}
                                  onChange={(val) => handleCampusFieldEdit(campus, "name", val)}
                                />
                              )}
                            </TableCell>

                            <TableCell className="border-r border-slate-200 p-2">
                              {isInactive ? (
                                <div className="flex w-full min-w-0 items-center gap-1">
                                  <span className="min-w-0 flex-1 truncate text-sm text-slate-500">
                                    {campus.address ?? "—"}
                                  </span>
                                  {campus.address && <CopyButton value={campus.address} />}
                                </div>
                              ) : (
                                <EditableCampusCell
                                  key={`${campus.id}-address-${tableRevision}`}
                                  value={getCampusDisplayAddress(campus)}
                                  placeholder="Sin dirección"
                                  readonly={!canEdit || markedDeactivate}
                                  onChange={(val) => handleCampusFieldEdit(campus, "address", val)}
                                />
                              )}
                            </TableCell>

                            <TableCell className="border-r border-slate-200 text-center text-sm text-slate-500">
                              {campus.recyclingPointCount}
                            </TableCell>

                            <TableCell className={`text-center ${canEdit ? "border-r border-slate-200" : ""}`}>
                              {markedDeactivate ? (
                                <Badge variant="destructive" className="opacity-70">
                                  Desactivando
                                </Badge>
                              ) : markedRestore ? (
                                <Badge variant="default" className="opacity-70">
                                  Restaurando
                                </Badge>
                              ) : (
                                <Badge variant={campus.isActive ? "default" : "destructive"}>
                                  {campus.isActive ? "Activo" : "Inactivo"}
                                </Badge>
                              )}
                            </TableCell>

                            {canEdit && (
                              <TableCell className="text-center">
                                {isInactive ? (
                                  <button
                                    type="button"
                                    onClick={() => toggleStatusChange(campus)}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50"
                                  >
                                    Restaurar
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => toggleStatusChange(campus)}
                                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition ${
                                      markedDeactivate
                                        ? "border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50"
                                        : "border-red-200 bg-white text-red-600 hover:bg-red-50"
                                    }`}
                                  >
                                    {markedDeactivate ? "Restaurar" : "Desactivar"}
                                  </button>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}

                      {draftCampuses.map((draft) => (
                        <TableRow key={draft.key} className="border-slate-200 bg-slate-50/60">
                          <TableCell className="border-r border-slate-200 p-2">
                            <Input
                              autoFocus
                              value={draft.name}
                              onChange={(e) => updateDraftRow(draft.key, "name", e.target.value)}
                              placeholder="Nombre del campus"
                              className="h-8 bg-white text-xs"
                            />
                          </TableCell>
                          <TableCell className="border-r border-slate-200 p-2">
                            <Input
                              value={draft.address}
                              onChange={(e) => updateDraftRow(draft.key, "address", e.target.value)}
                              placeholder="Dirección (opcional)"
                              className="h-8 bg-white text-xs"
                            />
                          </TableCell>
                          <TableCell className="border-r border-slate-200 text-center text-xs text-gray-400">
                            —
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

            {canEdit && (
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
            )}
          </div>

          {canEdit && (
            <div className="shrink-0 border-t border-slate-100 px-6 py-4">
              <Button
                type="button"
                className="w-full"
                disabled={!hasAnyChanges || saving}
                onClick={() => setShowConfirm(true)}
              >
                Guardar cambios
              </Button>
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={showConfirm}
        onOpenChange={(open) => !open && !saving && setShowConfirm(false)}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Guardar cambios?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="mt-1 space-y-4">
                <p className="text-sm text-slate-500">Se aplicarán los siguientes cambios:</p>

                {nameChanged && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Universidad
                    </p>
                    <div className="flex items-center gap-2 py-1 text-sm">
                      <span className="w-16 shrink-0 text-slate-500">Nombre</span>
                      <span className="max-w-[110px] truncate font-medium text-slate-700">
                        {university.name}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="max-w-[110px] truncate font-semibold text-[#18b566]">
                        {name.trim()}
                      </span>
                    </div>
                  </div>
                )}

                {changedCampusEdits.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Ediciones de campuses
                    </p>
                    <div className="space-y-2">
                      {changedCampusEdits.map(([campusId, edits]) => {
                        const original = campuses.find((c) => c.id === campusId);
                        if (!original) return null;
                        const nameEdited = edits.name.trim() !== original.name;
                        const addressEdited =
                          (edits.address?.trim() || null) !== (original.address ?? null);
                        return (
                          <div key={campusId} className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-sm">
                            <p className="mb-1 font-medium text-slate-600">{original.name}</p>
                            {nameEdited && (
                              <div className="flex items-center gap-2 py-0.5">
                                <span className="w-16 shrink-0 text-slate-500 text-xs">Nombre</span>
                                <span className="max-w-[90px] truncate text-slate-700">{original.name}</span>
                                <span className="text-slate-400">→</span>
                                <span className="max-w-[90px] truncate font-semibold text-[#18b566]">
                                  {edits.name.trim()}
                                </span>
                              </div>
                            )}
                            {addressEdited && (
                              <div className="flex items-center gap-2 py-0.5">
                                <span className="w-16 shrink-0 text-slate-500 text-xs">Dirección</span>
                                <span className="max-w-[90px] truncate text-slate-700">
                                  {original.address ?? "—"}
                                </span>
                                <span className="text-slate-400">→</span>
                                <span className="max-w-[90px] truncate font-semibold text-[#18b566]">
                                  {edits.address?.trim() || "—"}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {validDraftCampuses.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Campuses nuevos
                    </p>
                    <div className="space-y-1">
                      {validDraftCampuses.map((draft) => (
                        <div key={draft.key} className="flex items-center gap-2">
                          <Badge variant="default">{draft.name.trim()}</Badge>
                          {draft.address.trim() && (
                            <span className="text-xs text-gray-500">{draft.address.trim()}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Object.entries(pendingStatusChanges).some(([, v]) => !v) && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Campuses a desactivar
                    </p>
                    <div className="space-y-1">
                      {Object.entries(pendingStatusChanges)
                        .filter(([, nextActive]) => !nextActive)
                        .map(([campusId]) => {
                          const campus = campuses.find((c) => c.id === campusId);
                          return (
                            <Badge key={campusId} variant="destructive">
                              {campus?.name ?? campusId}
                            </Badge>
                          );
                        })}
                    </div>
                  </div>
                )}

                {Object.entries(pendingStatusChanges).some(([, v]) => v) && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Campuses a restaurar
                    </p>
                    <div className="space-y-1">
                      {Object.entries(pendingStatusChanges)
                        .filter(([, nextActive]) => nextActive)
                        .map(([campusId]) => {
                          const campus = campuses.find((c) => c.id === campusId);
                          return (
                            <Badge key={campusId} variant="default">
                              {campus?.name ?? campusId}
                            </Badge>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmSave();
              }}
            >
              {saving ? "Guardando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}