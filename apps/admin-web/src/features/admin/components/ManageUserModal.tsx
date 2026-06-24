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
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  assignUserRole,
  deactivateUser,
  deactivateUserRole,
  getRoles,
  restoreUser,
  type AppUser,
} from "../services/AdminUsersService";

interface Props {
  user: AppUser;
  onClose: () => void;
  onUpdated: () => void;
}

function toggleClasses(selected: boolean) {
  return `flex-1 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
    selected ? "bg-[#18b566] text-white" : "text-slate-600 hover:bg-slate-100"
  }`;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-2 shrink-0 rounded p-0.5 text-gray-400 transition hover:text-gray-600"
      aria-label="Copiar"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-[#18b566]" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-36 shrink-0 text-gray-500">{label}</span>
      <div className="min-w-0 flex-1 overflow-x-auto">
        <span className={`whitespace-nowrap font-medium text-gray-700 ${mono ? "font-mono text-xs" : ""}`}>
          {value}
        </span>
      </div>
      <div className="shrink-0 pl-2">
        <CopyButton value={value} />
      </div>
    </div>
  );
}

export default function ManageUserModal({ user, onClose, onUpdated }: Props) {
  const [isActive, setIsActive] = useState(user.isActive);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(user.roleId);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: availableRoles = [], isLoading, error } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: getRoles,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const hasRole = !!user.roleId;

  const adminRole = availableRoles.find((r) => r.name.toUpperCase() === "ADMIN");
  const managerRole = availableRoles.find((r) => r.name.toUpperCase() === "MANAGER");

  const activeChanged = isActive !== user.isActive;
  const roleChanged = hasRole && isActive && selectedRoleId !== user.roleId;
  const hasChanges = activeChanged || roleChanged;

  const selectedRoleName = availableRoles.find((r) => r.id === selectedRoleId)?.name ?? "";

  async function handleConfirmSave() {
    setSaving(true);
    try {
      if (activeChanged) {
        if (isActive) await restoreUser(user.id);
        else await deactivateUser(user.id);
      }
      if (roleChanged && selectedRoleId && user.userRoleAssignmentId) {
        await deactivateUserRole(user.userRoleAssignmentId);
        await assignUserRole(user.id, selectedRoleId);
      }
      toast.success("Cambios guardados correctamente");
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Error al guardar cambios:", err);
      toast.error("Error al guardar los cambios");
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="mb-4 text-lg font-bold">Gestionar Cuenta</h2>

          <div className="mb-5 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm">
            <DetailRow label="ID" value={user.id} mono />
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Nombre" value={user.name} />
            <DetailRow
              label="Último login"
              value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("es-PE") : "—"}
            />
            <DetailRow
              label="Últ. modificación"
              value={user.updatedAt ? new Date(user.updatedAt).toLocaleString("es-PE") : "—"}
            />
            <DetailRow
              label="Creado"
              value={new Date(user.createdAt).toLocaleString("es-PE")}
            />
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-400">Cargando...</p>
          ) : error ? (
            <p className="text-sm text-red-500">Error al cargar datos</p>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="mb-2 text-sm font-medium">Estado de la cuenta</p>
                <div className="inline-flex w-full rounded-lg border border-[#d9dee2] bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setIsActive(true)}
                    className={toggleClasses(isActive)}
                  >
                    Activo
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsActive(false)}
                    className={toggleClasses(!isActive)}
                  >
                    Inactivo
                  </button>
                </div>
              </div>

              {hasRole && isActive && (
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="mb-2 text-sm font-medium">Rol asignado</p>
                  <div className="inline-flex w-full rounded-lg border border-[#d9dee2] bg-white p-1">
                    <button
                      type="button"
                      disabled={!adminRole}
                      onClick={() => adminRole && setSelectedRoleId(adminRole.id)}
                      className={toggleClasses(selectedRoleId === adminRole?.id)}
                    >
                      Administrador
                    </button>
                    <button
                      type="button"
                      disabled={!managerRole}
                      onClick={() => managerRole && setSelectedRoleId(managerRole.id)}
                      className={toggleClasses(selectedRoleId === managerRole?.id)}
                    >
                      Manager
                    </button>
                  </div>
                </div>
              )}

              {hasRole && !isActive && (
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-400">
                    El rol no puede modificarse mientras la cuenta esté inactiva.
                  </p>
                </div>
              )}

              <Button
                type="button"
                className="w-full"
                disabled={!hasChanges || saving}
                onClick={() => setShowConfirm(true)}
              >
                Guardar cambios
              </Button>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={(open) => !open && setShowConfirm(false)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Guardar cambios?</AlertDialogTitle>
            <AlertDialogDescription>
              Se aplicarán los siguientes cambios para {user.email}:
              {activeChanged && (
                <span className="mt-2 block">
                  Estado:{" "}
                  <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </span>
              )}
              {roleChanged && (
                <span className="mt-2 block">
                  Rol: <Badge variant="default">{selectedRoleName}</Badge>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={saving} onClick={handleConfirmSave}>
              {saving ? "Guardando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}