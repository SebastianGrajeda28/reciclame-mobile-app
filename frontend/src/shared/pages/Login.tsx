import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      navigate("/");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log("[Google Login] Iniciando OAuth con Google...");
    console.log("[Google Login] redirectTo:", `${window.location.origin}/auth/callback`);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("[Google Login] Error al llamar signInWithOAuth:", error);
      toast.error("Error al iniciar sesión con Google");
      return;
    }

    console.log("[Google Login] signInWithOAuth OK, redirigiendo a:", data.url);
  };

  return (
    <div className="auth-background">
      <div className="auth-card">
        <div className="form-panel">
          <h2 className="text-3xl font-bold mb-6">
            Inicio de Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={handleGoogleLogin}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Continuar con Google
              </Button>
            </div>

            <div className="relative flex items-center gap-2">
              <div className="flex-1 border-t border-gray-300" />
              <span className="text-xs text-gray-400">o</span>
              <div className="flex-1 border-t border-gray-300" />
            </div>

            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-gray-100"
                />
              </div>
            </div>

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

            <p className="text-sm text-right">
              <Link to="/forgot-password" className="text-(--brand) hover:underline">
                ¿Olvidaste la contraseña?
              </Link>
            </p>

            <Button
              type="submit"
              className="w-full py-3 bg-(--brand) text-white rounded-full hover:bg-(--brand-light) transition"
              disabled={loading}
            >
              {loading ? "Ingresando…" : "Ingresar"}
            </Button>

            <p className="text-sm text-center">
              ¿No tienes una cuenta?{" "}
              <Link to="/register" className="text-(--brand) hover:underline">
                Regístrate ahora
              </Link>
            </p>
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

export default Login;
