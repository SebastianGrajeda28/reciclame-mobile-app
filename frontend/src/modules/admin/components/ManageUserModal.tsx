import { useState } from "react";
import { useUser } from "@/shared/context/UserContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Role { id: string; name: string; }
interface Assignment { id: string; roleId: string; roleName: string; }
interface RoleData { roles: Role[]; currentAssignment: Assignment | null; }

interface Props {
  userId: string;
  userEmail: string;
  userIsActive: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

async function fetchRoleData(base: string, accessToken: string, userId: string): Promise<RoleData> {
  const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

  const [rolesRes, assignRes] = await Promise.all([
    fetch(`${base}/api/roles`, { headers }),
    fetch(`${base}/api/user-roles?userId=${userId}&includeInactive=false`, { headers }),
  ]);

  if (!rolesRes.ok) throw new Error(`Error roles ${rolesRes.status}`);
  if (!assignRes.ok) throw new Error(`Error asignación ${assignRes.status}`);

  const [roles, assignments]: [Role[], Assignment[]] = await Promise.all([
    rolesRes.json(),
    assignRes.json(),
  ]);

  return {
    roles,
    currentAssignment: assignments[0] ?? null,
  };
}

export default function ManageUserModal({ userId, userEmail, userIsActive, onClose, onUpdated }: Props) {
  const { session } = useUser();
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [isActive, setIsActive] = useState(userIsActive);
  const [saving, setSaving] = useState(false);
  const [pendingRoleId, setPendingRoleId] = useState<string | null>(null);
  const [pendingActiveChange, setPendingActiveChange] = useState(false);

  const token = session?.access_token ?? "";
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const base = import.meta.env.VITE_BACKEND_URL;

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-user-role-data", userId, session?.user.id],
    queryFn: () => fetchRoleData(base, token, userId),
    enabled: !!session,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const availableRoles = data?.roles ?? [];
  const currentAssignment = data?.currentAssignment ?? null;

  // Confirmar cambio/asignación de rol
  const confirmRoleChange = async () => {
    if (!pendingRoleId) return;
    setSaving(true);
    try {
      // Si ya tiene un rol, eliminarlo primero
      if (currentAssignment) {
        await fetch(`${base}/api/user-roles/${currentAssignment.id}`, { method: "DELETE", headers });
      }
      // Asignar el nuevo rol
      const res = await fetch(`${base}/api/user-roles`, {
        method: "POST",
        headers,
        body: JSON.stringify({ userId, roleId: pendingRoleId }),
      });
      if (!res.ok) throw new Error();
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

  // Activar / desactivar cuenta
  const confirmActiveChange = async () => {
    setSaving(true);
    try {
      const endpoint = isActive
        ? `${base}/api/users/${userId}`
        : `${base}/api/users/${userId}/restore`;
      const method = isActive ? "DELETE" : "PATCH";
      const res = await fetch(endpoint, { method, headers });
      if (!res.ok) throw new Error();
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

  const pendingRoleName = availableRoles.find((r) => r.id === pendingRoleId)?.name ?? "";

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 relative">

          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-bold mb-1">Gestionar cuenta</h2>
          <p className="text-sm text-gray-500 mb-5 truncate">{userEmail}</p>

          {isLoading ? (
            <p className="text-sm text-gray-400">Cargando...</p>
          ) : error ? (
            <p className="text-sm text-red-500">Error al cargar datos</p>
          ) : (
            <div className="space-y-6">

              {/* Estado de la cuenta */}
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

              {/* Rol */}
              <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                <p className="text-sm font-medium">Rol asignado</p>

                {currentAssignment ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-sm px-3 py-1">
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
                      <SelectValue className="text-gray-200" placeholder={currentAssignment ? "Selecciona nuevo rol" : "Selecciona un rol"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900">
                      {availableRoles
                        .filter((r) => r.id !== currentAssignment?.roleId)
                        .map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    disabled={!selectedRoleId || saving}
                    onClick={() => setPendingRoleId(selectedRoleId)}
                  >
                    {currentAssignment ? "Cambiar" : "Asignar"}
                  </Button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Confirmación de cambio de rol */}
      <AlertDialog open={!!pendingRoleId} onOpenChange={(open) => { if (!open) setPendingRoleId(null); }}>
        <AlertDialogContent className="bg-white dark:bg-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {currentAssignment ? "¿Cambiar rol?" : "¿Asignar rol?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {currentAssignment
                ? `Se reemplazará el rol "${currentAssignment.roleName}" por "${pendingRoleName}" para ${userEmail}.`
                : `Se asignará el rol "${pendingRoleName}" a ${userEmail}.`}
              {" "}Esta acción puede cambiar los permisos del usuario.
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

      {/* Confirmación de activación/desactivación */}
      <AlertDialog open={pendingActiveChange} onOpenChange={(open) => { if (!open) setPendingActiveChange(false); }}>
        <AlertDialogContent className="bg-white dark:bg-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isActive ? "¿Desactivar cuenta?" : "¿Activar cuenta?"}
            </AlertDialogTitle>
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
