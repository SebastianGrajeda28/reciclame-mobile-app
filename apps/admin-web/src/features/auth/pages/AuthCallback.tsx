import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "../services/authService";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const subscription = onAuthStateChanged((event) => {
      if (event === "PASSWORD_RECOVERY") {
        navigate("/reset-password", { replace: true });
      } else if (event === "SIGNED_IN") {
        navigate("/", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Iniciando sesión...</p>
    </div>
  );
}
