import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

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
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
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
          <h2 className="text-3xl font-bold mb-2">Nueva contraseña</h2>
          <p className="text-gray-500 text-sm mb-6">
            Elige una contraseña segura para tu cuenta.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirm">Confirmar contraseña</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="pl-10 bg-gray-100"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-3 bg-(--brand) text-white rounded-full hover:bg-(--brand-light) transition"
              disabled={loading}
            >
              {loading ? "Guardando…" : "Guardar contraseña"}
            </Button>
          </form>
        </div>

        <div className="media-panel">
          <video src={`${import.meta.env.VITE_BACKEND_URL_MEDIA}/login.mp4`} autoPlay loop muted />
          <div className="media-overlay">
            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
              Cada amigo es una nueva aventura.
            </h2>
            <p className="text-xl md:text-2xl font-bold text-white/90 mb-6">
              Conectémonos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
