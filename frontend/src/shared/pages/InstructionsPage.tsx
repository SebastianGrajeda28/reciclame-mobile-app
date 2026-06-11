import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import InstructionCard from "@/modules/admin/components/InstructionCard";
import {
  createInstruction,
  deactivateInstruction,
  getInstructions,
  restoreInstruction,
  updateInstruction,
  type InstructionPayload,
} from "@/modules/admin/services/InstructionsService";
import { getWasteTypes } from "@/modules/admin/services/WasteTypesService";
import { useUser } from "../context/UserContext";
import { AppPage, AppSurface } from "../components/AppPage";

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

  const [newTitle, setNewTitle] = useState("");
  const [newWasteTypeId, setNewWasteTypeId] = useState("");
  const [selectedTab, setSelectedTab] = useState<InstructionsTab>("active");
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data: instructions = [], isLoading, isFetching, error } = useQuery({
    queryKey: INSTRUCTIONS_QUERY_KEY,
    queryFn: () => getInstructions(session!.access_token),
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
    mutationFn: (values: InstructionPayload) => createInstruction(session!.access_token, values),
    onSuccess: async () => {
      setNewTitle("");
      setNewWasteTypeId("");
      setSelectedTab("active");
      toast.success("Instrucción creada exitosamente");
      await queryClient.invalidateQueries({ queryKey: INSTRUCTIONS_QUERY_KEY });
    },
    onError: () => toast.error("Error al crear la instrucción"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: InstructionPayload }) =>
      updateInstruction(session!.access_token, id, values),
    onSuccess: async () => {
      toast.success("Instrucción actualizada exitosamente");
      await queryClient.invalidateQueries({ queryKey: INSTRUCTIONS_QUERY_KEY });
    },
    onError: () => toast.error("Error al actualizar la instrucción"),
    onSettled: () => setSavingId(null),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive
        ? restoreInstruction(session!.access_token, id)
        : deactivateInstruction(session!.access_token, id),
    onSuccess: async (_, variables) => {
      setSelectedTab(variables.isActive ? "active" : "inactive");
      toast.success(variables.isActive ? "Instrucción restaurada" : "Instrucción desactivada");
      await queryClient.invalidateQueries({ queryKey: INSTRUCTIONS_QUERY_KEY });
    },
    onError: () => toast.error("Error al cambiar el estado de la instrucción"),
    onSettled: () => setSavingId(null),
  });

  const activeInstructions = instructions.filter((instruction) => instruction.isActive);
  const inactiveInstructions = instructions.filter((instruction) => !instruction.isActive);
  const displayed = selectedTab === "active" ? activeInstructions : inactiveInstructions;
  const isCreating = createMutation.isPending;
  const isMutating = isCreating || updateMutation.isPending || statusMutation.isPending;

  function handleCreate() {
    createMutation.mutate({
      title: newTitle.trim(),
      wasteTypeId: newWasteTypeId === "" ? null : newWasteTypeId,
    });
  }

  async function handleUpdate(id: string, values: InstructionPayload) {
    setSavingId(id);
    await updateMutation.mutateAsync({ id, values });
  }

  async function handleChangeStatus(id: string, isActive: boolean) {
    setSavingId(id);
    await statusMutation.mutateAsync({ id, isActive });
  }

  return (
    <AppPage>
      <h1 className="text-[3rem] font-extrabold leading-none text-[#0b2f4e]">
        Gestionar instrucciones
      </h1>

      <AppSurface className="mt-8 rounded-2xl bg-[#eef3f8] px-6 py-5 shadow-[0_3px_0_rgba(15,23,42,0.08),0_12px_24px_rgba(15,23,42,0.06)]">
        <h2 className="text-2xl font-bold text-[#0b2f4e]">Agregar nueva instrucción</h2>

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
            <span className="mb-2 block text-sm font-semibold text-[#0b2f4e]">Texto de la instrucción</span>
            <Textarea
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="Escribe aqui el contenido"
              disabled={isCreating}
              className="min-h-32 resize-none border-[#d9dee2] bg-white shadow-none focus-visible:ring-emerald-500"
            />
          </label>

          <Button
            type="button"
            className="h-11 rounded-md bg-[#18b566] px-6 text-sm font-semibold text-white hover:bg-[#129a56]"
            disabled={newTitle.trim().length === 0 || isCreating}
            onClick={handleCreate}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isCreating ? "Creando..." : "Agregar instrucción"}
          </Button>
        </div>
      </AppSurface>

      <AppSurface className="mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-2xl font-bold text-[#0b2f4e]">Instrucciones existentes</h2>

          <div className="inline-flex w-full rounded-lg border border-[#d9dee2] bg-white p-1 sm:w-auto">
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
          <div className="mt-4 space-y-6">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        )}

        {!!error && (
          <p className="mt-4 text-sm text-red-600">
            No se pudieron cargar las instrucciones. Intenta nuevamente.
          </p>
        )}

        {!isLoading && !error && displayed.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-[#b7c7d6] bg-[#eef3f8] px-8 py-12 text-center">
            <p className="text-sm text-slate-600">
              {selectedTab === "active"
                ? "No hay instrucciones activas."
                : "No hay instrucciones inactivas."}
            </p>
          </div>
        )}

        <div className={`mt-4 space-y-6 transition-opacity ${isFetching && !isLoading ? "opacity-60" : "opacity-100"}`}>
          {displayed.map((instruction) => (
            <InstructionCard
              key={instruction.id}
              instruction={instruction}
              wasteTypes={wasteTypes}
              isSaving={savingId === instruction.id}
              onUpdate={handleUpdate}
              onChangeStatus={handleChangeStatus}
            />
          ))}
        </div>
      </AppSurface>
    </AppPage>
  );
}
