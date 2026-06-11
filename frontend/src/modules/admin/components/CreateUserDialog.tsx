import { useState } from "react";
import { useUser } from "@/shared/context/UserContext";
import { AccountForm } from "./AccountForm";
import { toast } from "sonner";
import { X } from "lucide-react";

interface AccountFormData {
  name: string;
  email: string;
  password?: string;
  role: "ADMIN" | "MANAGER" | "VIEWER";
}

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateUserDialog({ onClose, onCreated }: Props) {
  const { session } = useUser();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: AccountFormData) => {
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/provision`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          roleName: data.role,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? `Error ${res.status}`);
      }
      toast.success("Empleado creado correctamente");
      onCreated();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al crear empleado");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold mb-5">Crear nuevo empleado</h2>
        <AccountForm mode="register" onSubmit={handleSubmit} disabled={saving} />
      </div>
    </div>
  );
}
