import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/shared/context/UserContext";
import {
  createInstructionStep,
  deactivateInstructionStep,
  getInstructionSteps,
  updateInstructionStep,
} from "../services/InstructionStepsService";

type InstructionStepsSectionProps = {
  instructionId: string;
};

export default function InstructionStepsSection({ instructionId }: InstructionStepsSectionProps) {
  const { session } = useUser();
  const queryClient = useQueryClient();
  const queryKey = ["admin-instruction-steps", instructionId];

  const [newStepText, setNewStepText] = useState("");
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [stepToDelete, setStepToDelete] = useState<string | null>(null);

  const { data: steps = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getInstructionSteps(session!.access_token, instructionId),
    enabled: !!session,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: (text: string) =>
      createInstructionStep(session!.access_token, { instructionId, text }),
    onSuccess: async () => {
      setNewStepText("");
      toast.success("Paso agregado");
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: () => toast.error("Error al agregar el paso"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      updateInstructionStep(session!.access_token, id, text),
    onSuccess: async () => {
      setEditingStepId(null);
      toast.success("Paso actualizado");
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: () => toast.error("Error al actualizar el paso"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deactivateInstructionStep(session!.access_token, id),
    onSuccess: async () => {
      toast.success("Paso eliminado");
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: () => toast.error("Error al eliminar el paso"),
    onSettled: () => setStepToDelete(null),
  });

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  // Sin columna de orden en BD: el orden de los pasos es su orden de creación.
  const orderedSteps = [...steps].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <div className="mt-4 border-t border-[#d9dee2] pt-4">
      <h3 className="text-sm font-semibold text-[#0b2f4e]">Pasos de la instrucción</h3>

      {isLoading && (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      )}

      {!!error && (
        <p className="mt-3 text-sm text-red-600">No se pudieron cargar los pasos.</p>
      )}

      {!isLoading && !error && (
        <>
          {orderedSteps.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Esta instrucción aún no tiene pasos.</p>
          ) : (
            <ol className="mt-3 space-y-2">
              {orderedSteps.map((step, index) => (
                <li
                  key={step.id}
                  className="flex items-center gap-3 rounded-lg bg-white px-4 py-2.5"
                >
                  {editingStepId === step.id ? (
                    <>
                      <Input
                        value={editText}
                        onChange={(event) => setEditText(event.target.value)}
                        disabled={isMutating}
                        className="h-9 border-[#d9dee2] bg-white"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="shrink-0 bg-[#18b566] text-white hover:bg-[#129a56]"
                        disabled={editText.trim().length === 0 || isMutating}
                        onClick={() => updateMutation.mutate({ id: step.id, text: editText.trim() })}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        disabled={isMutating}
                        onClick={() => setEditingStepId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="shrink-0 text-sm font-semibold text-[#0b2f4e]">
                        Paso {index + 1}.
                      </span>
                      <span className="min-w-0 flex-1 text-sm text-slate-700">{step.text}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="shrink-0 border-[#9bb7cf] text-[#0b2f4e]"
                        disabled={isMutating}
                        onClick={() => {
                          setEditingStepId(step.id);
                          setEditText(step.text);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="shrink-0 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        disabled={isMutating}
                        onClick={() => setStepToDelete(step.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </li>
              ))}
            </ol>
          )}

          <div className="mt-3 flex items-center gap-3">
            <Input
              value={newStepText}
              onChange={(event) => setNewStepText(event.target.value)}
              placeholder="Escribe el texto del paso"
              disabled={isMutating}
              className="h-10 border-[#d9dee2] bg-white"
            />
            <Button
              type="button"
              className="h-10 shrink-0 rounded-md bg-[#18b566] px-4 text-sm font-semibold text-white hover:bg-[#129a56]"
              disabled={newStepText.trim().length === 0 || isMutating}
              onClick={() => createMutation.mutate(newStepText.trim())}
            >
              <Plus className="mr-1 h-4 w-4" />
              Agregar paso
            </Button>
          </div>
        </>
      )}

      <AlertDialog open={!!stepToDelete} onOpenChange={(open) => { if (!open) setStepToDelete(null); }}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar paso?</AlertDialogTitle>
            <AlertDialogDescription>
              El paso dejará de mostrarse en esta instrucción.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={() => stepToDelete && deleteMutation.mutate(stepToDelete)}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
