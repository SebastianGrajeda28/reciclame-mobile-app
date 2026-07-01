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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronDown, ChevronUp, Pencil, RotateCcw, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { Instruction, InstructionPayload } from "../services/InstructionsService";
import type { WasteType } from "../services/WasteTypesService";
import InstructionStepsSection from "./InstructionStepsSection";

type PendingAction = "edit" | "deactivate" | "restore" | null;

type InstructionCardProps = {
  instruction: Instruction;
  wasteTypes: WasteType[];
  isSaving?: boolean;
  onUpdate: (id: string, values: InstructionPayload) => Promise<void> | void;
  onChangeStatus: (id: string, isActive: boolean) => Promise<void> | void;
};

export default function InstructionCard({
  instruction,
  wasteTypes,
  isSaving = false,
  onUpdate,
  onChangeStatus,
}: InstructionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(instruction.title);
  const [editWasteTypeId, setEditWasteTypeId] = useState(instruction.wasteTypeId ?? "");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [showSteps, setShowSteps] = useState(false);

  const wasteTypeName =
    wasteTypes.find((type) => type.id === instruction.wasteTypeId)?.name ?? "Sin tipo";

  function cancelEdit() {
    setEditTitle(instruction.title);
    setEditWasteTypeId(instruction.wasteTypeId ?? "");
    setIsEditing(false);
  }

  async function confirmPendingAction() {
    try {
      if (pendingAction === "edit") {
        await onUpdate(instruction.id, {
          title: editTitle.trim(),
          wasteTypeId: editWasteTypeId === "" ? null : editWasteTypeId,
        });
        setIsEditing(false);
      }

      if (pendingAction === "deactivate") {
        await onChangeStatus(instruction.id, false);
        setIsEditing(false);
      }

      if (pendingAction === "restore") {
        await onChangeStatus(instruction.id, true);
      }

      setPendingAction(null);
    } catch {
      // El error se notifica desde la mutación.
    }
  }

  const actionTitle =
    pendingAction === "edit"
      ? "¿Guardar cambios?"
      : pendingAction === "deactivate"
        ? "¿Desactivar instrucción?"
        : "¿Restaurar instrucción?";

  const actionDescription =
    pendingAction === "edit"
      ? "Se actualizará el texto y/o el tipo de residuo de esta instrucción."
      : pendingAction === "deactivate"
        ? "La instrucción y sus pasos dejarán de mostrarse, pero podrá restaurarse desde la pestaña de inactivas."
        : "La instrucción y sus pasos volverán a aparecer en la lista de activas.";

  return (
    <>
      <article
        className={`rounded-2xl bg-[#eef3f8] px-5 py-5 shadow-[0_3px_0_rgba(15,23,42,0.08)] ${instruction.isActive ? "" : "opacity-80"}`}
      >
        {isEditing ? (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#0b2f4e]">Tipo de residuo</span>
              <Select value={editWasteTypeId} onValueChange={setEditWasteTypeId} disabled={isSaving}>
                <SelectTrigger className="w-full border-[#d9dee2] bg-white">
                  <SelectValue placeholder="Selecciona un tipo de residuo" />
                </SelectTrigger>
                <SelectContent className="bg-white">
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
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                disabled={isSaving}
                className="min-h-24 resize-none border-[#d9dee2] bg-white shadow-none focus-visible:ring-emerald-500"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                className="bg-[#18b566] text-white hover:bg-[#129a56]"
                disabled={editTitle.trim().length === 0 || isSaving}
                onClick={() => setPendingAction("edit")}
              >
                <Check className="h-4 w-4" />
                Confirmar cambio
              </Button>
              <Button type="button" variant="outline" disabled={isSaving} onClick={cancelEdit}>
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="text-lg leading-6 text-slate-900">{instruction.title}</p>
              <span className="mt-3 inline-flex rounded-full bg-[#d7f5e7] px-3 py-1 text-xs font-medium text-[#0b7a4b]">
                Tipo de residuo: {wasteTypeName}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {instruction.isActive ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 border-[#9bb7cf] text-[#0b2f4e]"
                    disabled={isSaving}
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={isSaving}
                    onClick={() => setPendingAction("deactivate")}
                  >
                    <Trash2 className="h-4 w-4" />
                    Desactivar
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 border-[#9bb7cf] text-[#0b2f4e]"
                  disabled={isSaving}
                  onClick={() => setPendingAction("restore")}
                >
                  <RotateCcw className="h-4 w-4" />
                  Restaurar
                </Button>
              )}
            </div>
          </div>
        )}

        {!isEditing && instruction.isActive && (
          <>
            <button
              type="button"
              className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#0b2f4e] hover:underline"
              onClick={() => setShowSteps((prev) => !prev)}
            >
              {showSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Gestionar pasos
            </button>
            {showSteps && <InstructionStepsSection instruction={instruction} />}
          </>
        )}
      </article>

      <AlertDialog open={!!pendingAction} onOpenChange={(open) => { if (!open) setPendingAction(null); }}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{actionTitle}</AlertDialogTitle>
            <AlertDialogDescription>{actionDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isSaving} onClick={confirmPendingAction}>
              {isSaving
                ? "Guardando..."
                : pendingAction === "deactivate"
                  ? "Desactivar"
                  : pendingAction === "restore"
                    ? "Restaurar"
                    : "Guardar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
