import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { MAX_CAMPUSES_PER_UNIVERSITY } from "../services/AdminUniversitiesService";

export interface CampusFormData {
  name: string;
  address?: string;
}

export interface UniversityFormData {
  name: string;
  campuses: CampusFormData[];
}

interface UniversityFormProps {
  onSubmit: (data: UniversityFormData) => void;
  disabled?: boolean;
}

export function UniversityForm({ onSubmit, disabled }: UniversityFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UniversityFormData>({
    defaultValues: {
      name: "",
      campuses: [{ name: "", address: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "campuses" });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div className="space-y-1">
        <Label htmlFor="name">Nombre de la universidad</Label>
        <Input
          id="name"
          {...register("name", { required: true })}
          placeholder="Universidad ejemplo"
        />
        {errors.name && <p className="text-xs text-red-600">El nombre es requerido</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Campuses</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: "", address: "" })}
            disabled={fields.length >= MAX_CAMPUSES_PER_UNIVERSITY}
          >
            <Plus className="mr-1 h-3 w-3" />
            Agregar campus
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-2 rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Campus {index + 1}</span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-slate-400 hover:text-red-600"
                    aria-label="Eliminar campus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor={`campuses.${index}.name`}>Nombre del campus</Label>
                <Input
                  id={`campuses.${index}.name`}
                  {...register(`campuses.${index}.name` as const, { required: true })}
                  placeholder="Campus Centro"
                />
                {errors.campuses?.[index]?.name && (
                  <p className="text-xs text-red-600">El nombre del campus es requerido</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor={`campuses.${index}.address`}>Dirección (opcional)</Label>
                <Input
                  id={`campuses.${index}.address`}
                  {...register(`campuses.${index}.address` as const)}
                  placeholder="Av. Principal 123"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={disabled}>
        {disabled ? "Guardando..." : "Crear universidad"}
      </Button>
    </form>
  );
}