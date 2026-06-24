import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, useWatch } from "react-hook-form";

interface AccountFormData {
  name: string;
  email: string;
  password?: string;
  role: "ADMIN" | "MANAGER";
}

interface AccountFormProps {
  mode: "register" | "update";
  initialData?: Partial<AccountFormData>;
  onSubmit: (data: AccountFormData) => void;
  disabled?: boolean;
}

export function AccountForm({ mode, initialData, onSubmit, disabled }: AccountFormProps) {
  const { register, handleSubmit, setValue, control } = useForm<AccountFormData>({
    defaultValues: {
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      password: "",
      role: initialData?.role ?? "MANAGER",
    },
  });

  const role = useWatch({ control, name: "role" });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">

      <div className="space-y-1">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register("name", { required: true })} placeholder="Nombre completo" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Correo</Label>
        <Input id="email" type="email" {...register("email", { required: true })} placeholder="correo@ejemplo.com" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">
          {mode === "update" ? "Contraseña (dejar vacío para no cambiar)" : "Contraseña"}
        </Label>
        <Input
          id="password"
          type="password"
          {...register("password", { required: mode === "register" })}
          placeholder="••••••••"
        />
      </div>

      <div className="space-y-1">
        <Label>Rol</Label>
        <Select value={role} onValueChange={(v) => setValue("role", v as AccountFormData["role"])}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">Administrador</SelectItem>
            <SelectItem value="MANAGER">Manager</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={disabled}>
        {disabled ? "Guardando..." : mode === "register" ? "Crear cuenta" : "Guardar cambios"}
      </Button>

    </form>
  );
}
