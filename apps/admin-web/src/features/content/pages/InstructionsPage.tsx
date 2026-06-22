import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  InstructionPreviewRail,
} from "../components/InstructionStepsSection";
import InstructionStepsSection from "../components/InstructionStepsSection";
import type { InstructionStep } from "../services/InstructionsService";
import { getBinTypeByWasteTypeId, type BinType } from "../services/BinTypesService";
import {
  createInstruction,
  resetInstruction,
  getInstructions,
  type Instruction,
} from "../services/InstructionsService";
import { getWasteTypes } from "../services/WasteTypesService";
import { getUniversities } from "../services/UniversitiesService";
import { useUser } from "@/shared/context/UserContext";
import { AppPage, AppSurface } from "@/shared/components/AppPage";

const INSTRUCTIONS_QUERY_KEY = ["admin-instructions"];
const WASTE_TYPES_QUERY_KEY = ["admin-waste-types"];
const UNIVERSITIES_QUERY_KEY = ["admin-universities"];

export default function InstructionsPage() {
  const { session } = useUser();
  const queryClient = useQueryClient();
  const [selectedWasteTypeId, setSelectedWasteTypeId] = useState<string>("");
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>("");
  const [confirmResetId, setConfirmResetId] = useState<string | null>(null);
  const [liveSteps, setLiveSteps] = useState<InstructionStep[] | undefined>(undefined);
  const [liveBinType, setLiveBinType] = useState<BinType | null | undefined>(undefined);
  const [liveDeposit, setLiveDeposit] = useState<{ text: string; imageUrl?: string | null } | undefined>(undefined);

  void liveBinType; // used only as reset trigger

  const { data: instructions = [], isLoading: isLoadingInstructions, error: instructionsError } = useQuery({
    queryKey: INSTRUCTIONS_QUERY_KEY,
    queryFn: () => getInstructions(),
    enabled: !!session,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const { data: universities = [] } = useQuery({
    queryKey: UNIVERSITIES_QUERY_KEY,
    queryFn: getUniversities,
    enabled: !!session,
    staleTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  });

  const { data: binType = null } = useQuery({
    queryKey: ["admin-bin-types", selectedWasteTypeId, selectedUniversityId],
    queryFn: () => getBinTypeByWasteTypeId(selectedWasteTypeId, selectedUniversityId || undefined),
    enabled: !!session && !!selectedWasteTypeId,
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

  useEffect(() => {
    if (universities.length > 0 && !selectedUniversityId) {
      setSelectedUniversityId(universities[0].id); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [universities, selectedUniversityId]);

  useEffect(() => {
    setLiveSteps(undefined);
    setLiveBinType(undefined);
    setLiveDeposit(undefined);
  }, [selectedWasteTypeId, selectedUniversityId]);

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

  const resetMutation = useMutation({
    mutationFn: (id: string) => resetInstruction(id),
    onSuccess: async () => {
      toast.success("Instrucción reiniciada");
      setConfirmResetId(null);
      await queryClient.invalidateQueries({ queryKey: INSTRUCTIONS_QUERY_KEY });
    },
    onError: () => toast.error("Error al reiniciar instrucción"),
  });

  const isLoading = isLoadingInstructions || isLoadingWasteTypes;
  const hasError = !!instructionsError || !!wasteTypesError;
  const isMutating = createMutation.isPending || resetMutation.isPending;

  const instructionForType = selectedWasteTypeId
    ? instructions.find((i) => i.wasteTypeId === selectedWasteTypeId) ?? null
    : null;

  // Auto-create instruction when waste type is selected and none exists
  useEffect(() => {
    if (
      !isLoading &&
      !hasError &&
      selectedWasteTypeId &&
      instructions.length > 0 && // instructions loaded
      !instructionForType &&
      !createMutation.isPending
    ) {
      createMutation.mutate(selectedWasteTypeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWasteTypeId, isLoading, hasError, instructionForType]);

  function handleResetRequest(id: string) {
    setConfirmResetId(id);
  }

  function handleResetConfirm() {
    if (confirmResetId) resetMutation.mutate(confirmResetId);
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
        {universities.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-medium text-slate-500">Universidad:</span>
            <Select value={selectedUniversityId} onValueChange={setSelectedUniversityId}>
              <SelectTrigger className="h-9 w-52 border-slate-200 bg-white text-sm">
                <SelectValue placeholder="Selecciona universidad" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {universities.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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
                          binType={binType}
                          onResetRequest={() => handleResetRequest(instructionForType.id)}
                          isMutating={isMutating}
                          onStepsChange={setLiveSteps}
                          onDepositChange={setLiveDeposit}
                        />
                      ) : createMutation.isPending ? (
                        <div className="space-y-3 py-4">
                          <Skeleton className="h-8 w-48 rounded-lg" />
                          <Skeleton className="h-40 w-full rounded-xl" />
                        </div>
                      ) : null}
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
                liveSteps={liveSteps}
                binType={liveDeposit && binType ? { ...binType, depositInstruction: liveDeposit.text, imageUrl: liveDeposit.imageUrl ?? binType.imageUrl } : binType}
              />
            ) : (
              <div className="flex h-full items-center justify-center rounded-[28px] border border-slate-200 bg-slate-50/70 p-5 text-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Vista previa
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Selecciona un tipo de residuo para ver la simulación móvil.
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </AppSurface>

      {/* Reset confirmation dialog */}
      {confirmResetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50">
                <RotateCcw className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">Reiniciar instrucción</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Se eliminarán todos los pasos de esta instrucción. La instrucción seguirá existiendo y podrás volver a agregar pasos.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={resetMutation.isPending}
                onClick={() => setConfirmResetId(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={resetMutation.isPending}
                onClick={handleResetConfirm}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
              >
                {resetMutation.isPending ? "Reiniciando…" : "Reiniciar"}
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
  binType,
  onResetRequest,
  isMutating,
  onStepsChange,
  onDepositChange,
}: {
  instruction: Instruction;
  binType?: BinType | null;
  onResetRequest: () => void;
  isMutating: boolean;
  onStepsChange?: (steps: InstructionStep[]) => void;
  onDepositChange?: (deposit: { text: string; imageUrl?: string | null }) => void;
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
          onClick={onResetRequest}
          className="inline-flex items-center gap-1 rounded-md border border-amber-100 bg-white px-2.5 py-1.5 text-xs font-medium text-amber-600 transition hover:border-amber-200 hover:bg-amber-50 disabled:opacity-50"
        >
          <RotateCcw className="h-3 w-3" />
          Reiniciar
        </button>
      </div>
      <InstructionStepsSection instruction={instruction} binType={binType} onStepsChange={onStepsChange} onDepositChange={onDepositChange} />
    </div>
  );
}
