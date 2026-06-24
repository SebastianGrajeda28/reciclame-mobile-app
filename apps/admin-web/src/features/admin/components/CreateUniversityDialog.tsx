import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createUniversity, createUniversityCampuses } from "../services/AdminUniversitiesService";
import { UniversityForm, type UniversityFormData } from "./UniversityForm";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateUniversityDialog({ onClose, onCreated }: Props) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: UniversityFormData) => {
    setSaving(true);
    try {
      const university = await createUniversity({ name: data.name });

      try {
        await createUniversityCampuses({
          universityId: university.id,
          campuses: data.campuses.map((campus) => ({
            name: campus.name,
            address: campus.address,
          })),
        });
      } catch (campusError: unknown) {
        // La universidad ya quedó creada; este paso falló aparte, no lo tratamos como fallo total.
        toast.error(
          campusError instanceof Error
            ? `Universidad creada, pero falló al agregar campuses: ${campusError.message}`
            : "Universidad creada, pero falló al agregar campuses"
        );
        onCreated();
        onClose();
        return;
      }

      toast.success("Universidad creada correctamente");
      onCreated();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al crear universidad");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
        <h2 className="mb-5 text-lg font-bold">Crear Nueva Universidad</h2>
        <UniversityForm onSubmit={handleSubmit} disabled={saving} />
      </div>
    </div>
  );
}