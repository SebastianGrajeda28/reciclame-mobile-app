import { useState } from "react";
import { Check, Edit, RotateCcw, Trash2, X } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type WasteType = {
  id: string;
  name: string;
};

export type FunFact = {
  id: string;
  text: string;
  wasteTypeId: string;
  isActive: boolean;
};

type PendingAction = "edit" | "deactivate" | "restore" | null;

type FunFactCardProps = {
  fact: FunFact;
  wasteTypes: WasteType[];
  getWasteTypeLabel: (wasteTypeId: string) => string;
  isSaving?: boolean;
  onUpdate: (id: string, values: Pick<FunFact, "text" | "wasteTypeId">) => Promise<void> | void;
  onChangeStatus: (id: string, isActive: boolean) => Promise<void> | void;
};

export default function FunFactCard({
  fact,
  wasteTypes,
  getWasteTypeLabel,
  isSaving = false,
  onUpdate,
  onChangeStatus,
}: FunFactCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editWasteTypeId, setEditWasteTypeId] = useState(fact.wasteTypeId);
  const [editText, setEditText] = useState(fact.text);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const canSave = editWasteTypeId.trim().length > 0 && editText.trim().length > 0;

  function cancelEdit() {
    setEditWasteTypeId(fact.wasteTypeId);
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
      // El toast de error se muestra desde la mutación de la página.
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
      <div className={`rounded-xl border p-5 shadow-sm ${fact.isActive ? "bg-slate-50 dark:bg-gray-800/60" : "bg-white dark:bg-gray-900 opacity-80"}`}>
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor={`edit-waste-type-${fact.id}`}>
                Tipo de residuo
              </label>
              <Select value={editWasteTypeId} onValueChange={setEditWasteTypeId} disabled={isSaving}>
                <SelectTrigger id={`edit-waste-type-${fact.id}`} className="bg-white dark:bg-gray-900">
                  <SelectValue placeholder="Selecciona un tipo de residuo" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900">
                  {wasteTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor={`edit-text-${fact.id}`}>
                Texto del dato curioso
              </label>
              <Textarea
                id={`edit-text-${fact.id}`}
                value={editText}
                onChange={(event) => setEditText(event.target.value)}
                disabled={isSaving}
                className="min-h-24 bg-white dark:bg-gray-900"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" disabled={!canSave || isSaving} onClick={() => setPendingAction("edit")}>
                <Check className="w-4 h-4" />
                Confirmar cambio
              </Button>
              <Button type="button" variant="outline" size="sm" disabled={isSaving} onClick={cancelEdit}>
                <X className="w-4 h-4" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <p className="text-sm leading-6 text-gray-800 dark:text-gray-100">
                {fact.text}
              </p>
              <Badge
                variant={fact.isActive ? "secondary" : "outline"}
                className={fact.isActive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100" : undefined}
              >
                Tipo de residuo: {getWasteTypeLabel(fact.wasteTypeId)}
              </Badge>
            </div>

            <div className="flex gap-2 sm:shrink-0">
              {fact.isActive ? (
                <>
                  <Button type="button" variant="outline" size="sm" disabled={isSaving} onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button type="button" variant="destructive" size="sm" disabled={isSaving} onClick={() => setPendingAction("deactivate")}>
                    <Trash2 className="w-4 h-4" />
                    Desactivar
                  </Button>
                </>
              ) : (
                <Button type="button" variant="outline" size="sm" disabled={isSaving} onClick={() => setPendingAction("restore")}>
                  <RotateCcw className="w-4 h-4" />
                  Restaurar
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!pendingAction} onOpenChange={(open) => { if (!open) setPendingAction(null); }}>
        <AlertDialogContent className="bg-white dark:bg-gray-900">
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
