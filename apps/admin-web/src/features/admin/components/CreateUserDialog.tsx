import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { provisionAdminUser } from "../services/AdminProvisioningService";
import { AccountForm } from "./AccountForm";

interface AccountFormData {
  name: string;
  email: string;
  password?: string;
  role: "ADMIN" | "MANAGER";
}

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateUserDialog({ onClose, onCreated }: Props) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: AccountFormData) => {
    setSaving(true);
    try {
      await provisionAdminUser({
        email: data.email,
        password: data.password,
        name: data.name,
        roleName: data.role,
      });

      toast.success("Empleado guardado correctamente");
      onCreated();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al procesar la solicitud");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
        <h2 className="mb-1 text-lg font-bold">Crear Nuevo Empleado</h2>
        <p className="mb-5 text-sm text-slate-500">
          Si el correo ya pertenece a un usuario de la app móvil, se le asignará el rol y se establecerá la contraseña indicada.
        </p>
        <AccountForm mode="register" onSubmit={handleSubmit} disabled={saving} />
      </div>
    </div>
  );
}
