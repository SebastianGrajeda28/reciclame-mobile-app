import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { assignUserRole, deactivateUser, deactivateUserRole, getRoles, getUserRoleAssignments, restoreUser } from "../services/AdminUsersService";

interface Role {
  id: string;
  name: string;
}

interface Assignment {
  id: string;
  roleId: string;
  roleName: string;
}

interface RoleData {
  roles: Role[];
  currentAssignment: Assignment | null;
}

interface Props {
  userId: string;
  userEmail: string;
  userIsActive: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

async function fetchRoleData(userId: string): Promise<RoleData> {
  const [roles, assignments] = await Promise.all([
    getRoles(),
    getUserRoleAssignments(userId),
  ]);

  return {
    roles,
    currentAssignment: assignments[0] ?? null,
  };
}

export default function ManageUserModal({ userId, userEmail, userIsActive, onClose, onUpdated }: Props) {
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [isActive, setIsActive] = useState(userIsActive);
  const [saving, setSaving] = useState(false);
  const [pendingRoleId, setPendingRoleId] = useState<string | null>(null);
  const [pendingActiveChange, setPendingActiveChange] = useState(false);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-user-role-data", userId],
    queryFn: () => fetchRoleData(userId),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const availableRoles = data?.roles ?? [];
  const currentAssignment = data?.currentAssignment ?? null;

  const confirmRoleChange = async () => {
    if (!pendingRoleId) return;
    setSaving(true);
    try {
      if (currentAssignment) {
        await deactivateUserRole(currentAssignment.id);
      }

      await assignUserRole(userId, pendingRoleId);
      toast.success(currentAssignment ? "Rol actualizado" : "Rol asignado");
      setSelectedRoleId("");
      await refetch();
      onUpdated();
    } catch {
      toast.error("Error al asignar rol");
    } finally {
      setSaving(false);
      setPendingRoleId(null);
    }
  };

  const confirmActiveChange = async () => {
    setSaving(true);
    try {
      if (isActive) {
        await deactivateUser(userId);
      } else {
        await restoreUser(userId);
      }
      setIsActive(!isActive);
      toast.success(isActive ? "Cuenta desactivada" : "Cuenta activada");
      onUpdated();
    } catch {
      toast.error("Error al cambiar estado de la cuenta");
    } finally {
      setSaving(false);
      setPendingActiveChange(false);
    }
  };

  const pendingRoleName = availableRoles.find((role) => role.id === pendingRoleId)?.name ?? "";

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>

          <h2 className="mb-1 text-lg font-bold">Gestionar cuenta</h2>
          <p className="mb-5 truncate text-sm text-gray-500">{userEmail}</p>

          {isLoading ? (
            <p className="text-sm text-gray-400">Cargando...</p>
          ) : error ? (
            <p className="text-sm text-red-500">Error al cargar datos</p>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                <div>
                  <p className="text-sm font-medium">Estado de la cuenta</p>
                  <Badge variant={isActive ? "default" : "secondary"} className="mt-1">
                    {isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <Button
                  variant={isActive ? "destructive" : "default"}
                  size="sm"
                  disabled={saving}
                  onClick={() => setPendingActiveChange(true)}
                >
                  {isActive ? "Desactivar" : "Activar"}
                </Button>
              </div>

              <div className="space-y-3 rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-medium">Rol asignado</p>

                {currentAssignment ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="px-3 py-1 text-sm">
                      {currentAssignment.roleName}
                    </Badge>
                    <span className="text-xs text-gray-400">— cambiar:</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Sin rol asignado.</p>
                )}

                <div className="flex gap-2">
                  <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                    <SelectTrigger className="flex-1 bg-white dark:bg-gray-900">
                      <SelectValue
                        className="text-gray-200"
                        placeholder={currentAssignment ? "Selecciona nuevo rol" : "Selecciona un rol"}
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900">
                      {availableRoles
                        .filter((role) => role.id !== currentAssignment?.roleId)
                        .map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button disabled={!selectedRoleId || saving} onClick={() => setPendingRoleId(selectedRoleId)}>
                    {currentAssignment ? "Cambiar" : "Asignar"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!pendingRoleId} onOpenChange={(open) => { if (!open) setPendingRoleId(null); }}>
        <AlertDialogContent className="bg-white dark:bg-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle>{currentAssignment ? "¿Cambiar rol?" : "¿Asignar rol?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {currentAssignment
                ? `Se reemplazará el rol "${currentAssignment.roleName}" por "${pendingRoleName}" para ${userEmail}.`
                : `Se asignará el rol "${pendingRoleName}" a ${userEmail}.`} {" "}
              Esta acción puede cambiar los permisos del usuario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={saving} onClick={confirmRoleChange}>
              {saving ? "Guardando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={pendingActiveChange} onOpenChange={(open) => { if (!open) setPendingActiveChange(false); }}>
        <AlertDialogContent className="bg-white dark:bg-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle>{isActive ? "¿Desactivar cuenta?" : "¿Activar cuenta?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isActive
                ? `Se desactivará la cuenta de ${userEmail}. El usuario perderá acceso a las funciones protegidas.`
                : `Se activará la cuenta de ${userEmail}. El usuario volverá a aparecer como activo.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={saving} onClick={confirmActiveChange}>
              {saving ? "Guardando..." : isActive ? "Desactivar" : "Activar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
