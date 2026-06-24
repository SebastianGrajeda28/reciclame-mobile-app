//import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClipboardList, Home, Info, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

export default function EmployeeNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const { account, loading } = useUser();

  // Estilos
  const baseBtn = "flex items-center gap-2 h-auto p-0";
  const activeBtn = "text-[#142e38]";
  const inactiveBtn = "text-[var(--brand)] hover:text-[#1e4e3e]";

  if (loading || !account) return null; // aún cargando o no hay cuenta

  const userRole = account.role;

  const isEmployeeDashboard = path === "/employee-event/espacios";
  const isAdminHome = path === "/admin";
  const isAdminAccounts =
    ["/admin/accounts", "/admin/accounts/nuevo"].includes(path) ||
    /^\/admin\/accounts\/\d+$/.test(path);

  const isAdminConfig =
    ["/admin/config", "/admin/config/ajustes"].includes(path) ||
    /^\/admin\/config\/.+$/.test(path);

  return (
    <div className="flex justify-center w-full p-2.5">
      <Card className="flex flex-row items-center justify-center gap-8 p-4 rounded-2xl shadow-md background-custom">
        {/* MANAGER */}
        {userRole === "MANAGER" && (
          <>
            <Button
              variant="ghost"
              onClick={() => navigate("/manager/dashboard")}
              className={`${baseBtn} ${isEmployeeDashboard ? activeBtn : inactiveBtn}`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-lg font-medium">Dashboard</span>
            </Button>
          </>
        )}

        {/* ADMIN */}
        {userRole === "ADMIN" && (
          <>
            <Button
              variant="ghost"
              onClick={() => navigate("/admin")}
              className={`${baseBtn} ${isAdminHome ? activeBtn : inactiveBtn}`}
            >
              <Home className="w-5 h-5" />
              <span className="text-lg font-medium">Inicio</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate("/admin/accounts")}
              className={`${baseBtn} ${isAdminAccounts ? activeBtn : inactiveBtn}`}
            >
              <Users className="w-5 h-5" />
              <span className="text-lg font-medium">Gestión de Cuentas</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate("/admin/config")}
              className={`${baseBtn} ${isAdminConfig ? activeBtn : inactiveBtn}`}
            >
              <Info className="w-5 h-5" />
              <span className="text-lg font-medium">
                Configuración del Club
              </span>
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
