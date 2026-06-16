import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOutCurrentUser } from "../services/authService";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    signOutCurrentUser().finally(() => {
      navigate("/login", { replace: true });
    });
  }, [navigate]);

  return null;
}
