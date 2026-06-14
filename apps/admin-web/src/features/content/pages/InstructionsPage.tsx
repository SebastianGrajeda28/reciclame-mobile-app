import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  InstructionPreviewRail,
} from "../components/InstructionStepsSection";
import InstructionStepsSection from "../components/InstructionStepsSection";
import {
  createInstruction,
  getInstructions,
  restoreInstruction,
  deactivateInstruction,
  type Instruction,
} from "../services/InstructionsService";
import { getWasteTypes } from "../services/WasteTypesService";
import { useUser } from "@/shared/context/UserContext";
import { AppPage, AppSurface } from "@/shared/components/AppPage";

type InstructionsTab = "active" | "inactive";

const INSTRUCTIONS_QUERY_KEY = ["admin-instructions"];
const WASTE_TYPES_QUERY_KEY = ["admin-waste-types"];

function tabClasses(selected: boolean) {
  return `flex-1 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none ${
    selected ? "bg-[#18b566] text-white" : "text-slate-600 hover:bg-slate-100"
  }`;
}

export default function InstructionsPage() {
  const { session } = useUser();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<InstructionsTab>("active");
  const [selectedWasteTypeId, setSelectedWasteTypeId] = useState<string>("");

  const { data: instructions = [], isLoading: isLoadingInstructions, error: instructionsError } = useQuery({
    queryKey: INSTRUCTIONS_QUERY_KEY,
    queryFn: () => getInstructions(),
    enabled: !!session,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const { data: wasteTypes = [], isLoading: isLoadingWasteTypes, error: wasteTypesError } = useQuery({
    queryKey: WASTE_TYPES_QUERY_KEY,
    queryFn: () => getWasteTypes(),
    enabled: !!session,
    staleTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (wasteTypes.length > 0 && !selectedWasteTypeId) {
      setSelectedWasteTypeId(wasteTypes[0].id); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [wasteTypes, selectedWasteTypeId]);

  const createMutation = useMutation({
    mutationFn: (wasteTypeId: string) =>
      createInstruction({
        title: wasteTypes.find((wt) => wt.id === wasteTypeId)?.name ?? "Instrucción",
        wasteTypeId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: INSTRUCTIONS_QUERY_KEY });
    },
    onError: () => toast.error("Error al crear instrucción"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive
        ? restoreInstruction(id)
        : deactivateInstruction(id),
    onSuccess: async (_, variables) => {
      toast.success(variables.isActive ? "Instrucción restaurada" : "Instrucción desactivada");
      await queryClient.invalidateQueries({ queryKey: INSTRUCTIONS_QUERY_KEY });
    },
    onError: () => toast.error("Error al cambiar el estado"),
  });

  const activeInstructions = instructions.filter((i) => i.isActive);
  const inactiveInstructions = instructions.filter((i) => !i.isActive);
  const isLoading = isLoadingInstructions || isLoadingWasteTypes;
  const hasError = !!instructionsError || !!wasteTypesError;
  const isMutating = createMutation.isPending || statusMutation.isPending;

  // Active tab: find instruction for selected waste type (or null if none exists yet)
  const activeInstructionForType = selectedWasteTypeId
    ? activeInstructions.find((i) => i.wasteTypeId === selectedWasteTypeId) ?? null
    : null;

  // For the inactive tab, enrich with waste type name for display
  const enrichedInactive = inactiveInstructions.map((i) => ({
    ...i,
    wasteTypeName: wasteTypes.find((wt) => wt.id === i.wasteTypeId)?.name ?? "Sin tipo",
  }));

  async function handleEnsureInstruction(): Promise<Instruction | null> {
    if (activeInstructionForType) return activeInstructionForType;
    if (!selectedWasteTypeId) return null;
    try {
      const created = await createMutation.mutateAsync(selectedWasteTypeId);
      return created as Instruction;
    } catch {
      return null;
    }
  }

  return (
    <AppPage>
      <div className="flex flex-col gap-3 md:min-h-[72px] md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[3rem] font-extrabold leading-none text-[#0b2f4e]">
            Gestionar instrucciones
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Configura los pasos guiados que verá cada usuario según el tipo de residuo seleccionado.
          </p>
        </div>
      </div>

      <AppSurface className="mt-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,34vw)] xl:items-stretch">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600">Tipo de residuo:</span>
                  <Select
                    value={selectedWasteTypeId}
                    onValueChange={setSelectedWasteTypeId}
                    disabled={isMutating || selectedTab === "inactive"}
                  >
                  <SelectTrigger className="h-9 w-52 border-slate-200 bg-white text-sm">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {wasteTypes.map((wt) => (
                      <SelectItem key={wt.id} value={wt.id}>
                        {wt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>

                <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    disabled={isMutating}
                    onClick={() => setSelectedTab("active")}
                    className={tabClasses(selectedTab === "active")}
                  >
                    Activas ({activeInstructions.length})
                  </button>
                  <button
                    type="button"
                    disabled={isMutating}
                    onClick={() => setSelectedTab("inactive")}
                    className={tabClasses(selectedTab === "inactive")}
                  >
                    Inactivas ({inactiveInstructions.length})
                  </button>
                </div>
              </div>

              {isLoading && (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-64 rounded-lg" />
                  <Skeleton className="h-[480px] w-full rounded-2xl" />
                </div>
              )}

              {!isLoading && hasError && (
                <p className="text-sm text-red-600">
                  No se pudieron cargar los datos. Intenta nuevamente.
                </p>
              )}

              {!isLoading && !hasError && selectedTab === "active" && (
                <div>
                  {selectedWasteTypeId && (
                    <div className="rounded-[26px] border border-slate-200 bg-linear-to-br from-white via-white to-slate-50 p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
                      {activeInstructionForType ? (
                        <ActiveEditor
                          instruction={activeInstructionForType}
                          onDeactivate={() =>
                            statusMutation.mutate({ id: activeInstructionForType.id, isActive: false })
                          }
                          isMutating={isMutating}
                        />
                      ) : (
                        <EmptyInstructionState
                          wasteTypeName={wasteTypes.find((wt) => wt.id === selectedWasteTypeId)?.name ?? ""}
                          isCreating={createMutation.isPending}
                          onCreate={() => handleEnsureInstruction()}
                        />
                      )}
                    </div>
                  )}

                  {!selectedWasteTypeId && wasteTypes.length === 0 && (
                    <p className="text-sm text-slate-500">No hay tipos de residuo disponibles.</p>
                  )}
                </div>
              )}
              {!isLoading && !hasError && selectedTab === "inactive" && (
                <div>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-[#0b2f4e]">Archivo de instrucciones</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Restaura cualquier flujo inactivo para volver a editar sus pasos.
                    </p>
                  </div>
                  {enrichedInactive.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#b7c7d6] bg-[#eef3f8] px-8 py-12 text-center">
                      <p className="text-sm text-slate-600">No hay instrucciones inactivas.</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {enrichedInactive.map((inst) => (
                        <li
                          key={inst.id}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700">{inst.title}</p>
                            <span className="mt-2 inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-500">
                              {inst.wasteTypeName}
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={isMutating}
                            onClick={() => statusMutation.mutate({ id: inst.id, isActive: true })}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Restaurar
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
          <aside className="flex h-full flex-col">
            {selectedTab === "active" && activeInstructionForType ? (
              <InstructionPreviewRail
                instruction={activeInstructionForType}
                wasteTypeName={wasteTypes.find((wt) => wt.id === selectedWasteTypeId)?.name}
              />
            ) : (
              <div className="flex h-full items-center justify-center rounded-[28px] border border-slate-200 bg-slate-50/70 p-5 text-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Vista previa
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {selectedTab === "inactive"
                      ? "Restaura una instrucción para ver la vista previa."
                      : "Crea una instrucción activa para ver la simulación móvil."}
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </AppSurface>
    </AppPage>
  );
}

// ─── Active editor wrapper ────────────────────────────────────────────────────

function ActiveEditor({
  instruction,
  onDeactivate,
  isMutating,
}: {
  instruction: Instruction;
  onDeactivate: () => void;
  isMutating: boolean;
}) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-[#0b2f4e]">
          {instruction.title}
        </h2>
        <button
          type="button"
          disabled={isMutating}
          onClick={onDeactivate}
          className="inline-flex items-center gap-1 rounded-md border border-red-100 bg-white px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-3 w-3" />
          Desactivar
        </button>
      </div>
      <InstructionStepsSection instruction={instruction} />
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyInstructionState({
  wasteTypeName,
  isCreating,
  onCreate,
}: {
  wasteTypeName: string;
  isCreating: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center">
      <p className="text-sm text-slate-500">
        No hay instrucción activa para <span className="font-semibold text-slate-700">{wasteTypeName}</span>.
      </p>
      <p className="mt-2 max-w-md text-xs text-slate-400">
        Crea una para poder agregar pasos.
      </p>
      <button
        type="button"
        disabled={isCreating}
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#18b566] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#129a56] disabled:opacity-50"
      >
        {isCreating ? "Creando..." : "Crear instrucción"}
      </button>
    </div>
  );
}
