import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  InstructionPreviewRail,
} from "../components/InstructionStepsSection";
import InstructionStepsSection from "../components/InstructionStepsSection";
import {
  createInstruction,
  deleteInstruction,
  getInstructions,
  type Instruction,
} from "../services/InstructionsService";
import { getWasteTypes } from "../services/WasteTypesService";
import { useUser } from "@/shared/context/UserContext";
import { AppPage, AppSurface } from "@/shared/components/AppPage";

const INSTRUCTIONS_QUERY_KEY = ["admin-instructions"];
const WASTE_TYPES_QUERY_KEY = ["admin-waste-types"];

export default function InstructionsPage() {
  const { session } = useUser();
  const queryClient = useQueryClient();
  const [selectedWasteTypeId, setSelectedWasteTypeId] = useState<string>("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInstruction(id),
    onSuccess: async () => {
      toast.success("Instrucción eliminada");
      setConfirmDeleteId(null);
      await queryClient.invalidateQueries({ queryKey: INSTRUCTIONS_QUERY_KEY });
    },
    onError: () => toast.error("Error al eliminar instrucción"),
  });

  const isLoading = isLoadingInstructions || isLoadingWasteTypes;
  const hasError = !!instructionsError || !!wasteTypesError;
  const isMutating = createMutation.isPending || deleteMutation.isPending;

  const instructionForType = selectedWasteTypeId
    ? instructions.find((i) => i.wasteTypeId === selectedWasteTypeId) ?? null
    : null;

  async function handleEnsureInstruction(): Promise<Instruction | null> {
    if (instructionForType) return instructionForType;
    if (!selectedWasteTypeId) return null;
    try {
      const created = await createMutation.mutateAsync(selectedWasteTypeId);
      return created as Instruction;
    } catch {
      return null;
    }
  }

  function handleDeleteRequest(id: string) {
    setConfirmDeleteId(id);
  }

  function handleDeleteConfirm() {
    if (confirmDeleteId) deleteMutation.mutate(confirmDeleteId);
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
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600">Tipo de residuo:</span>
                <Select
                  value={selectedWasteTypeId}
                  onValueChange={setSelectedWasteTypeId}
                  disabled={isMutating}
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

              {!isLoading && !hasError && (
                <div>
                  {selectedWasteTypeId && (
                    <div className="rounded-[26px] border border-slate-200 bg-linear-to-br from-white via-white to-slate-50 p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
                      {instructionForType ? (
                        <ActiveEditor
                          instruction={instructionForType}
                          onDeleteRequest={() => handleDeleteRequest(instructionForType.id)}
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
            </div>
          </div>
          <aside className="flex h-full flex-col">
            {instructionForType ? (
              <InstructionPreviewRail
                instruction={instructionForType}
                wasteTypeName={wasteTypes.find((wt) => wt.id === selectedWasteTypeId)?.name}
              />
            ) : (
              <div className="flex h-full items-center justify-center rounded-[28px] border border-slate-200 bg-slate-50/70 p-5 text-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Vista previa
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Crea una instrucción para ver la simulación móvil.
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </AppSurface>

      {/* Delete confirmation dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">Eliminar instrucción</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Esta acción eliminará permanentemente la instrucción y todos sus pasos. No se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppPage>
  );
}

// ─── Active editor wrapper ────────────────────────────────────────────────────

function ActiveEditor({
  instruction,
  onDeleteRequest,
  isMutating,
}: {
  instruction: Instruction;
  onDeleteRequest: () => void;
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
          onClick={onDeleteRequest}
          className="inline-flex items-center gap-1 rounded-md border border-red-100 bg-white px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-3 w-3" />
          Eliminar
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
        No hay instrucción para <span className="font-semibold text-slate-700">{wasteTypeName}</span>.
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
