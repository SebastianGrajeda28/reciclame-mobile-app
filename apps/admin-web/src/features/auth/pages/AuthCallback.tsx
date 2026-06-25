import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "../services/authService";

function isRecoveryFlow(): boolean {
  const queryParams = new URLSearchParams(window.location.search);
  if (queryParams.get("type") === "recovery") return true;

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return hashParams.get("type") === "recovery";
}

function getUrlError(): string | null {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return hashParams.get("error_code") ?? hashParams.get("error");
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const [recoveryDetected] = useState(isRecoveryFlow);
  const [urlError] = useState(getUrlError);

  useEffect(() => {
    if (urlError) {
      navigate("/login", {
        replace: true,
        state: { authError: "expired_link" },
      });
      return;
    }

    if (recoveryDetected) {
      navigate("/reset-password", { replace: true });
      return;
    }

    const subscription = onAuthStateChanged((event) => {
      if (event === "PASSWORD_RECOVERY") {
        navigate("/reset-password", { replace: true });
      } else if (event === "SIGNED_IN") {
        navigate("/", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, recoveryDetected, urlError]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Iniciando sesión...</p>
    </div>
  );
}