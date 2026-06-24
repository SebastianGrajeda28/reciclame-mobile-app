import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { signOutCurrentUser } from "../services/authService";

export default function Logout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const reason = searchParams.get("reason");

    signOutCurrentUser().finally(() => {
      if (reason === "unauthorized") {
        toast.error("La cuenta no tiene permisos para acceder a esta aplicación o está inactiva.");
      }
      navigate("/login", { replace: true });
    });
  }, [navigate, searchParams]);

  return null;
}