import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "../context/UserContext";
import { AppPage, AppSurface } from "../components/AppPage";

export default function UserPage() {
  const { account } = useUser();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleMockSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Completa ambos campos.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    toast.success("Cambio de credenciales pendiente de implementacion.");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <AppPage>
      <h1 className="text-[3rem] font-extrabold leading-none text-[#0b2f4e]">
        Mi cuenta
      </h1>

      <AppSurface
        width="form"
        className="mt-10 rounded-2xl bg-[#eef3f8] px-6 py-6 shadow-[0_3px_0_rgba(15,23,42,0.08),0_12px_24px_rgba(15,23,42,0.06)]"
      >
        <p className="text-sm font-medium uppercase tracking-[0.08em] text-slate-500">Nombre</p>
        <p className="mt-2 text-2xl font-semibold text-[#0b2f4e]">{account?.name || "Sin nombre"}</p>

        <form onSubmit={handleMockSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="h-11 border-[#d9dee2] bg-white shadow-none focus-visible:ring-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="••••••••"
              className="h-11 border-[#d9dee2] bg-white shadow-none focus-visible:ring-emerald-500"
            />
          </div>

          <Button type="submit" className="h-11 rounded-md bg-[#18b566] px-6 text-sm font-semibold text-white hover:bg-[#129a56]">
            Guardar cambios
          </Button>
        </form>
      </AppSurface>
    </AppPage>
  );
}
