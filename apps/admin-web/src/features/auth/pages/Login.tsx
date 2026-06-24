import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Info, Lock, Mail, Recycle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { signInWithEmail } from "../services/authService";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const expiredErrorHandledRef = useRef(false);

  useEffect(() => {
    const state = location.state as { authError?: string } | null;
    if (state?.authError === "expired_link" && !expiredErrorHandledRef.current) {
      expiredErrorHandledRef.current = true;
      toast.error("El enlace ya expiró o no es válido. Solicita uno nuevo.");
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      navigate("/");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Credenciales incorrectas",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="relative min-h-[calc(100dvh-5rem)] overflow-hidden bg-[#f7f8f6] px-6 py-6 text-slate-900 md:py-8">
      <span
        aria-hidden="true"
        className="absolute right-0 top-24 h-28 w-28 rounded-full bg-emerald-100/80 md:h-36 md:w-36"
      />

      <section className="mx-auto flex min-h-full max-w-[1180px] items-center justify-center">
        <article className="w-full max-w-[420px] rounded-[22px] border border-slate-200/80 bg-[#f8faf9] px-6 py-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] md:px-10 md:py-10">
          <header className="mb-8 flex flex-col items-center text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Recycle className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold text-slate-900">Recíclame</p>
            <h1 className="mt-4 max-w-[240px] text-[28px] font-semibold leading-8 text-slate-900">
              Recicla, gana puntos y cuida el planeta
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Inicia sesión para continuar
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label htmlFor="email" className="block space-y-1.5">
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
                Correo electrónico
              </span>
              <span className="relative block">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ariel@reciclame.pe"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-lg border-slate-200 bg-white pl-9 text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-emerald-500"
                />
              </span>
            </label>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500"
                >
                  Contraseña
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-lg border-slate-200 bg-white pl-9 pr-10 text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="mt-2 h-10 w-full rounded-lg bg-[#0f2f45] text-sm font-semibold text-white hover:bg-[#143a53]"
              disabled={loading}
            >
              {loading ? "Iniciando..." : "Iniciar Sesión"}
            </Button>

            <aside className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Tu sesión se mantendrá iniciada mientras no cierres el
                navegador.
              </p>
            </aside>

            <footer className="px-3 text-center text-[11px] leading-4 text-slate-400">
              Al continuar aceptas nuestros{" "}
              <span className="font-medium text-emerald-700">
                Términos de Servicio
              </span>{" "}
              y{" "}
              <span className="font-medium text-emerald-700">
                Política de Privacidad
              </span>
              .
            </footer>
          </form>
        </article>
      </section>
    </main>
  );
};

export default Login;