import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import FunFactCard from "@/modules/admin/components/FunFactCard";
import {
  createFunFact,
  deactivateFunFact,
  getFunFacts,
  restoreFunFact,
  updateFunFact,
  type FunFactPayload,
} from "@/modules/admin/services/FunFactsService";
import { getWasteTypes } from "@/modules/admin/services/WasteTypesService";
import { useUser } from "../context/UserContext";
import { AppPage, AppSurface } from "../components/AppPage";

type FunFactsTab = "active" | "inactive";

const FUN_FACTS_QUERY_KEY = ["admin-fun-facts"];
const WASTE_TYPES_QUERY_KEY = ["admin-waste-types"];

function tabClasses(selected: boolean) {
  return `flex-1 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none ${
    selected ? "bg-[#18b566] text-white" : "text-slate-600 hover:bg-slate-100"
  }`;
}

export default function FunFactsPage() {
  const { session } = useUser();
  const queryClient = useQueryClient();

  const [newText, setNewText] = useState("");
  const [newWasteTypeId, setNewWasteTypeId] = useState("");
  const [selectedTab, setSelectedTab] = useState<FunFactsTab>("active");
  const [savingFactId, setSavingFactId] = useState<string | null>(null);

  const { data: funFacts = [], isLoading, isFetching, error } = useQuery({
    queryKey: FUN_FACTS_QUERY_KEY,
    queryFn: () => getFunFacts(session!.access_token),
    enabled: !!session,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const { data: wasteTypes = [], isLoading: isWasteTypesLoading, error: wasteTypesError } = useQuery({
    queryKey: WASTE_TYPES_QUERY_KEY,
    queryFn: () => getWasteTypes(session!.access_token),
    enabled: !!session,
    staleTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: (values: FunFactPayload) => createFunFact(session!.access_token, values),
    onSuccess: async () => {
      setNewText("");
      setNewWasteTypeId("");
      setSelectedTab("active");
      toast.success("Dato curioso creado exitosamente");
      await queryClient.invalidateQueries({ queryKey: FUN_FACTS_QUERY_KEY });
    },
    onError: () => toast.error("Error al crear el dato curioso"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: FunFactPayload }) =>
      updateFunFact(session!.access_token, id, values),
    onSuccess: async () => {
      toast.success("Dato curioso actualizado exitosamente");
      await queryClient.invalidateQueries({ queryKey: FUN_FACTS_QUERY_KEY });
    },
    onError: () => toast.error("Error al actualizar el dato curioso"),
    onSettled: () => setSavingFactId(null),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive
        ? restoreFunFact(session!.access_token, id)
        : deactivateFunFact(session!.access_token, id),
    onSuccess: async (_, variables) => {
      setSelectedTab(variables.isActive ? "active" : "inactive");
      toast.success(variables.isActive ? "Dato curioso restaurado" : "Dato curioso desactivado");
      await queryClient.invalidateQueries({ queryKey: FUN_FACTS_QUERY_KEY });
    },
    onError: () => toast.error("Error al cambiar el estado del dato curioso"),
    onSettled: () => setSavingFactId(null),
  });

  const activeFacts = funFacts.filter((fact) => fact.isActive);
  const inactiveFacts = funFacts.filter((fact) => !fact.isActive);
  const displayedFacts = selectedTab === "active" ? activeFacts : inactiveFacts;
  const isCreating = createMutation.isPending;
  const isMutating = isCreating || updateMutation.isPending || statusMutation.isPending;
  const canSubmit =
    newWasteTypeId.trim().length > 0 &&
    newText.trim().length > 0 &&
    !isCreating &&
    !isWasteTypesLoading &&
    !wasteTypesError;

  function handleCreate() {
    if (!canSubmit) return;
    createMutation.mutate({ text: newText.trim(), wasteTypeId: newWasteTypeId });
  }

  async function handleUpdate(id: string, values: FunFactPayload) {
    setSavingFactId(id);
    await updateMutation.mutateAsync({ id, values });
  }

  async function handleChangeStatus(id: string, isActive: boolean) {
    setSavingFactId(id);
    await statusMutation.mutateAsync({ id, isActive });
  }

  return (
    <AppPage>
      <h1 className="text-[3rem] font-extrabold leading-none text-[#0b2f4e]">
        Gestionar fun facts
      </h1>

      <AppSurface className="mt-8 rounded-2xl bg-[#eef3f8] px-6 py-5 shadow-[0_3px_0_rgba(15,23,42,0.08),0_12px_24px_rgba(15,23,42,0.06)]">
        <h2 className="text-2xl font-bold text-[#0b2f4e]">Agregar nuevo fun fact</h2>

        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#0b2f4e]">Tipo de residuo</span>
            <Select
              value={newWasteTypeId}
              onValueChange={setNewWasteTypeId}
              disabled={isCreating || isWasteTypesLoading || !!wasteTypesError}
            >
              <SelectTrigger className="h-12 w-full border-[#d9dee2] bg-white">
                <SelectValue
                  placeholder={isWasteTypesLoading ? "Cargando tipos..." : "Selecciona un tipo de residuo"}
                />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {wasteTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!!wasteTypesError && (
              <p className="mt-2 text-sm text-red-600">No se pudieron cargar los tipos de residuo.</p>
            )}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#0b2f4e]">Texto del fun fact</span>
            <Textarea
              value={newText}
              onChange={(event) => setNewText(event.target.value)}
              placeholder="Escribe aqui el contenido"
              disabled={isCreating}
              className="min-h-32 resize-none border-[#d9dee2] bg-white shadow-none focus-visible:ring-emerald-500"
            />
          </label>

          <Button
            type="button"
            className="h-11 rounded-md bg-[#18b566] px-6 text-sm font-semibold text-white hover:bg-[#129a56]"
            disabled={!canSubmit}
            onClick={handleCreate}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isCreating ? "Creando..." : "Agregar fun fact"}
          </Button>
        </div>
      </AppSurface>

      <AppSurface className="mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-2xl font-bold text-[#0b2f4e]">Fun facts existentes</h2>

          <div className="inline-flex w-full rounded-lg border border-[#d9dee2] bg-white p-1 sm:w-auto">
            <button
              type="button"
              disabled={isMutating}
              onClick={() => setSelectedTab("active")}
              className={tabClasses(selectedTab === "active")}
            >
              Activos ({activeFacts.length})
            </button>
            <button
              type="button"
              disabled={isMutating}
              onClick={() => setSelectedTab("inactive")}
              className={tabClasses(selectedTab === "inactive")}
            >
              Inactivos ({inactiveFacts.length})
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="mt-4 space-y-6">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        )}

        {!!error && (
          <p className="mt-4 text-sm text-red-600">
            No se pudieron cargar los datos curiosos. Intenta nuevamente.
          </p>
        )}

        {!isLoading && !error && displayedFacts.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-[#b7c7d6] bg-[#eef3f8] px-8 py-12 text-center">
            <p className="text-sm text-slate-600">
              {selectedTab === "active"
                ? "No hay datos curiosos activos."
                : "No hay datos curiosos inactivos."}
            </p>
          </div>
        )}

        <div className={`mt-4 space-y-6 transition-opacity ${isFetching && !isLoading ? "opacity-60" : "opacity-100"}`}>
          {displayedFacts.map((fact) => (
            <FunFactCard
              key={fact.id}
              fact={fact}
              wasteTypes={wasteTypes}
              isSaving={savingFactId === fact.id}
              onUpdate={handleUpdate}
              onChangeStatus={handleChangeStatus}
            />
          ))}
        </div>
      </AppSurface>
    </AppPage>
  );
}
