import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateCurrentUserPassword } from "../services/authService";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      await updateCurrentUserPassword(password);
      toast.success("Contraseña actualizada correctamente");
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-card">
        <div className="form-panel">
          <h2 className="mb-2 text-3xl font-bold">Nueva contraseña</h2>
          <p className="mb-6 text-sm text-gray-500">Elige una contraseña segura para tu cuenta.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-100 pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirm">Confirmar contraseña</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="bg-gray-100 pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full bg-(--brand) py-3 text-white transition hover:bg-(--brand-light)"
              disabled={loading}
            >
              {loading ? "Guardando…" : "Guardar contraseña"}
            </Button>
          </form>
        </div>

        <div className="media-panel">
          <video src={`${import.meta.env.VITE_BACKEND_URL_MEDIA}/login.mp4`} autoPlay loop muted />
          <div className="media-overlay">
            <h2 className="mb-4 text-5xl font-extrabold text-white md:text-6xl">
              Cada amigo es una nueva aventura.
            </h2>
            <p className="mb-6 text-xl font-bold text-white/90 md:text-2xl">Conectémonos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
