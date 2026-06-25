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
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, Pencil, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  getRoles,
  setEmployeeRole,
  updateEmployee,
  type AppEmployee,
} from "../services/AdminUsersService";

interface Props {
  user: AppEmployee;
  onClose: () => void;
  onUpdated: () => void;
}

function toggleClasses(selected: boolean, disabled = false) {
  return `flex-1 rounded-md px-4 py-2 text-sm font-semibold transition ${
    selected
      ? "bg-[#18b566] text-white"
      : disabled
        ? "cursor-not-allowed text-slate-400"
        : "text-slate-600 hover:bg-slate-100"
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
      className="shrink-0 rounded p-0.5 text-gray-400 transition hover:text-gray-600"
      aria-label="Copiar"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-[#18b566]" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function EditableDetailRow({
  label,
  value,
  editable = false,
  canEdit = true,
  onChange,
}: {
  label: string;
  value: string;
  editable?: boolean;
  canEdit?: boolean;
  onChange?: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-36 shrink-0 text-gray-500">{label}</span>
      <div className="min-w-0 flex-1 overflow-x-auto">
        {editing && editable && canEdit ? (
          <Input
            autoFocus
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onBlur={() => setEditing(false)}
            className="h-7 text-sm"
          />
        ) : (
          <span className="whitespace-nowrap font-medium text-gray-700">
            {value || "—"}
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1 pl-1">
        {editable && canEdit && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded p-0.5 text-gray-400 transition hover:text-gray-600"
            aria-label="Editar"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
        <CopyButton value={value} />
      </div>
    </div>
  );
}

type RoleOption = "manager" | "admin";

function resolveRoleOption(roleName: string | null): RoleOption {
  if (roleName?.toUpperCase() === "ADMIN") return "admin";
  return "manager";
}

const roleLabel: Record<RoleOption, string> = {
  manager: "Manager",
  admin: "Administrador",
};

function ChangeRow({ label, from, to }: { label: string; from: string; to: string }) {
  return (
    <div className="flex items-center gap-2 py-1 text-sm">
      <span className="w-16 shrink-0 text-slate-500">{label}</span>
      <span className="max-w-[120px] truncate font-medium text-slate-700">{from}</span>
      <span className="text-slate-400">→</span>
      <span className="max-w-[120px] truncate font-semibold text-[#18b566]">{to}</span>
    </div>
  );
}

export default function ManageUserModal({ user, onClose, onUpdated }: Props) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [selectedRole, setSelectedRole] = useState<RoleOption>(resolveRoleOption(user.roleName));
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const canEdit = user.isActive;

  const { data: availableRoles = [], isLoading, error } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: getRoles,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const adminRole   = availableRoles.find((r) => r.name.toUpperCase() === "ADMIN");
  const managerRole = availableRoles.find((r) => r.name.toUpperCase() === "MANAGER");

  const originalRole = resolveRoleOption(user.roleName);
  const nameChanged  = name.trim() !== user.name;
  const emailChanged = email.trim() !== user.email;
  const dataChanged  = nameChanged || emailChanged;
  const roleChanged  = selectedRole !== originalRole;
  const hasChanges   = canEdit && (dataChanged || roleChanged);

  async function handleConfirmSave() {
    setSaving(true);
    try {
      if (dataChanged) {
        await updateEmployee(user.id, {
          name: name.trim(),
          email: emailChanged ? email.trim() : undefined,
        });
      }

      if (roleChanged) {
        const newRoleId = selectedRole === "admin" ? adminRole?.id : managerRole?.id;
        if (newRoleId) {
          await setEmployeeRole(user.id, newRoleId);
        }
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

          <h2 className="mb-1 text-lg font-bold">Gestionar Cuenta</h2>
          {!canEdit && (
            <p className="mb-4 text-xs text-slate-400">
              Esta cuenta está inactiva. Restáurala para poder editar.
            </p>
          )}
          {canEdit && <div className="mb-4" />}

          <div className="mb-5 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm">
            <EditableDetailRow label="Nombre" value={name} editable canEdit={canEdit} onChange={setName} />
            <EditableDetailRow label="Email"  value={email} editable canEdit={canEdit} onChange={setEmail} />
            <EditableDetailRow
              label="Último login"
              value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("es-PE") : "—"}
            />
            <EditableDetailRow
              label="Creado"
              value={new Date(user.createdAt).toLocaleString("es-PE")}
            />
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-400">Cargando roles...</p>
          ) : error ? (
            <p className="text-sm text-red-500">Error al cargar roles</p>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="mb-2 text-sm font-medium text-gray-700">Rol</p>
                <div className="inline-flex w-full rounded-lg border border-[#d9dee2] bg-white p-1">
                  <button
                    type="button"
                    disabled={!canEdit || !managerRole}
                    onClick={() => canEdit && managerRole && setSelectedRole("manager")}
                    className={toggleClasses(selectedRole === "manager", !canEdit)}
                  >
                    Manager
                  </button>
                  <button
                    type="button"
                    disabled={!canEdit || !adminRole}
                    onClick={() => canEdit && adminRole && setSelectedRole("admin")}
                    className={toggleClasses(selectedRole === "admin", !canEdit)}
                  >
                    Administrador
                  </button>
                </div>
              </div>

              {canEdit && (
                <Button
                  type="button"
                  className="w-full"
                  disabled={!hasChanges || saving}
                  onClick={() => setShowConfirm(true)}
                >
                  Guardar cambios
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={(open) => !open && setShowConfirm(false)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Guardar cambios?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="mt-1">
                <p className="mb-3 text-sm text-slate-500">
                  Se aplicarán los siguientes cambios para la cuenta:
                </p>
                <div className="space-y-1">
                  {nameChanged  && <ChangeRow label="Nombre" from={user.name}          to={name.trim()} />}
                  {emailChanged && <ChangeRow label="Email"  from={user.email}         to={email.trim()} />}
                  {roleChanged  && <ChangeRow label="Rol"    from={roleLabel[originalRole]} to={roleLabel[selectedRole]} />}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmSave();
              }}
            >
              {saving ? "Guardando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}