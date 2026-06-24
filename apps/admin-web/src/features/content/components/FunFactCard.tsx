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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check, Pencil, RotateCcw, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { FunFact, FunFactPayload } from "../services/FunFactsService";
import type { WasteType } from "../services/WasteTypesService";

type PendingAction = "edit" | "deactivate" | "restore" | null;

type FunFactCardProps = {
  fact: FunFact;
  wasteTypes: WasteType[];
  isSaving?: boolean;
  onUpdate: (id: string, values: FunFactPayload) => Promise<void> | void;
  onChangeStatus: (id: string, isActive: boolean) => Promise<void> | void;
};

export default function FunFactCard({
  fact,
  wasteTypes,
  isSaving = false,
  onUpdate,
  onChangeStatus,
}: FunFactCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editWasteTypeId, setEditWasteTypeId] = useState(
    fact.wasteTypeId ?? "",
  );
  const [editText, setEditText] = useState(fact.text);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const wasteTypeName =
    wasteTypes.find((type) => type.id === fact.wasteTypeId)?.name ?? "Sin tipo";
  const canSave =
    editWasteTypeId.trim().length > 0 && editText.trim().length > 0;

  function cancelEdit() {
    setEditWasteTypeId(fact.wasteTypeId ?? "");
    setEditText(fact.text);
    setIsEditing(false);
  }

  async function confirmPendingAction() {
    try {
      if (pendingAction === "edit") {
        await onUpdate(fact.id, {
          text: editText.trim(),
          wasteTypeId: editWasteTypeId,
        });
        setIsEditing(false);
      }

      if (pendingAction === "deactivate") {
        await onChangeStatus(fact.id, false);
        setIsEditing(false);
      }

      if (pendingAction === "restore") {
        await onChangeStatus(fact.id, true);
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
        ? "¿Desactivar dato curioso?"
        : "¿Restaurar dato curioso?";

  const actionDescription =
    pendingAction === "edit"
      ? "Se actualizará el texto y/o el tipo de residuo de este dato curioso."
      : pendingAction === "deactivate"
        ? "El dato curioso dejará de aparecer como activo, pero podrá restaurarse desde la pestaña de inactivos."
        : "El dato curioso volverá a aparecer en la lista de activos.";

  return (
    <>
      <article
        className={`rounded-2xl bg-[#eef3f8] px-5 py-5 shadow-[0_3px_0_rgba(15,23,42,0.08)] ${fact.isActive ? "" : "opacity-80"}`}
      >
        {isEditing ? (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#0b2f4e]">
                Tipo de residuo
              </span>
              <Select
                value={editWasteTypeId}
                onValueChange={setEditWasteTypeId}
                disabled={isSaving}
              >
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
              <span className="mb-2 block text-sm font-semibold text-[#0b2f4e]">
                Texto del dato curioso
              </span>
              <Textarea
                value={editText}
                onChange={(event) => setEditText(event.target.value)}
                disabled={isSaving}
                className="min-h-24 resize-none border-[#d9dee2] bg-white shadow-none focus-visible:ring-emerald-500"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                className="bg-[#18b566] text-white hover:bg-[#129a56]"
                disabled={!canSave || isSaving}
                onClick={() => setPendingAction("edit")}
              >
                <Check className="h-4 w-4" />
                Confirmar cambio
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={cancelEdit}
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="text-lg leading-6 text-slate-900">{fact.text}</p>
              <span className="mt-3 inline-flex rounded-full bg-[#d7f5e7] px-3 py-1 text-xs font-medium text-[#0b7a4b]">
                Tipo de residuo: {wasteTypeName}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {fact.isActive ? (
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
      </article>

      <AlertDialog
        open={!!pendingAction}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{actionTitle}</AlertDialogTitle>
            <AlertDialogDescription>{actionDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSaving}
              onClick={confirmPendingAction}
            >
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
