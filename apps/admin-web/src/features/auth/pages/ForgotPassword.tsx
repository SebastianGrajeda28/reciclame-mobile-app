import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { requestPasswordReset } from "../services/authService";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email, `${window.location.origin}/auth/callback`);
      setSent(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al enviar el correo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-card">
        <div className="form-panel">
          <Link
            to="/login"
            className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al login
          </Link>

          <h2 className="mb-2 text-3xl font-bold">¿Olvidaste tu contraseña?</h2>
          <p className="mb-6 text-sm text-gray-500">
            Ingresa tu correo y te enviaremos un enlace para restablecerla.
          </p>

          {sent ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              Correo enviado. Revisa tu bandeja de entrada y sigue el enlace para restablecer tu contraseña.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                {loading ? "Enviando…" : "Enviar enlace"}
              </Button>
            </form>
          )}
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

export default ForgotPassword;
