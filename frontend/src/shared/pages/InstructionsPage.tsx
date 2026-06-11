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
  updateInstruction,
  type InstructionPayload,
} from "@/modules/admin/services/InstructionsService";
import { getWasteTypes } from "@/modules/admin/services/WasteTypesService";
import { useUser } from "../context/UserContext";
import { AppPage, AppSurface } from "../components/AppPage";

const INSTRUCTIONS_QUERY_KEY = ["admin-instructions"];
const WASTE_TYPES_QUERY_KEY = ["admin-waste-types"];

// Valor sentinela: SelectItem no admite value="" y wasteTypeId es opcional.
const NO_WASTE_TYPE = "none";

export default function InstructionsPage() {
  const { session } = useUser();
  const queryClient = useQueryClient();

  const [newTitle, setNewTitle] = useState("");
  const [newWasteTypeId, setNewWasteTypeId] = useState(NO_WASTE_TYPE);
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data: instructions = [], isLoading, error } = useQuery({
    queryKey: INSTRUCTIONS_QUERY_KEY,
    queryFn: () => getInstructions(session!.access_token),
    enabled: !!session,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const { data: wasteTypes = [] } = useQuery({
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
      setNewWasteTypeId(NO_WASTE_TYPE);
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deactivateInstruction(session!.access_token, id),
    onSuccess: async () => {
      toast.success("Instrucción eliminada");
      await queryClient.invalidateQueries({ queryKey: INSTRUCTIONS_QUERY_KEY });
    },
    onError: () => toast.error("Error al eliminar la instrucción"),
    onSettled: () => setSavingId(null),
  });

  function handleCreate() {
    createMutation.mutate({
      title: newTitle.trim(),
      wasteTypeId: newWasteTypeId === NO_WASTE_TYPE ? null : newWasteTypeId,
    });
  }

  async function handleUpdate(id: string, values: InstructionPayload) {
    setSavingId(id);
    await updateMutation.mutateAsync({ id, values });
  }

  async function handleDelete(id: string) {
    setSavingId(id);
    await deleteMutation.mutateAsync(id);
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
              disabled={createMutation.isPending}
            >
              <SelectTrigger className="h-12 w-full border-[#d9dee2] bg-white">
                <SelectValue placeholder="Selecciona un tipo de residuo" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value={NO_WASTE_TYPE}>Sin tipo de residuo</SelectItem>
                {wasteTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#0b2f4e]">Texto de la instrucción</span>
            <Textarea
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="Escribe aqui el contenido"
              disabled={createMutation.isPending}
              className="min-h-32 resize-none border-[#d9dee2] bg-white shadow-none focus-visible:ring-emerald-500"
            />
          </label>

          <Button
            type="button"
            className="h-11 rounded-md bg-[#18b566] px-6 text-sm font-semibold text-white hover:bg-[#129a56]"
            disabled={newTitle.trim().length === 0 || createMutation.isPending}
            onClick={handleCreate}
          >
            <Plus className="mr-2 h-4 w-4" />
            {createMutation.isPending ? "Creando..." : "Agregar instrucción"}
          </Button>
        </div>
      </AppSurface>

      <AppSurface className="mt-8">
        <h2 className="text-2xl font-bold text-[#0b2f4e]">Instrucciones existentes</h2>

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

        {!isLoading && !error && instructions.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-[#b7c7d6] bg-[#eef3f8] px-8 py-12 text-center">
            <p className="text-sm text-slate-600">Aún no hay instrucciones registradas.</p>
          </div>
        )}

        <div className="mt-4 space-y-6">
          {instructions.map((instruction) => (
            <InstructionCard
              key={instruction.id}
              instruction={instruction}
              wasteTypes={wasteTypes}
              isSaving={savingId === instruction.id}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </AppSurface>
    </AppPage>
  );
}
