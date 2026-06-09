import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) throw new Error(error.message);
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
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al login
          </Link>

          <h2 className="text-3xl font-bold mb-2">¿Olvidaste tu contraseña?</h2>
          <p className="text-gray-500 text-sm mb-6">
            Ingresa tu correo y te enviaremos un enlace para restablecerla.
          </p>

          {sent ? (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-700 text-sm">
              Correo enviado. Revisa tu bandeja de entrada y sigue el enlace para restablecer tu contraseña.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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

              <Button
                type="submit"
                className="w-full py-3 bg-(--brand) text-white rounded-full hover:bg-(--brand-light) transition"
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

export default ForgotPassword;
