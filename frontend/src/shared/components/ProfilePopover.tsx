import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LogOut, KeyRound, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useUser } from "../context/UserContext";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  MANAGER: "Manager",
  VIEWER: "Viewer",
};

export default function ProfilePopover() {
  const { account } = useUser();
  const navigate = useNavigate();
  const [openPopover, setOpenPopover] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!account) return null;

  const initials = account.name
    ? account.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : account.email[0].toUpperCase();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      toast.error("Mínimo 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
      toast.success("Contraseña actualizada");
      setOpenDialog(false);
      setPassword("");
      setConfirm("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-(--brand) focus:ring-offset-2">
            <Avatar className="cursor-pointer hover:opacity-80 transition">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-72 p-0 overflow-hidden">
          {/* Cabecera del perfil */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 border-b">
            <Avatar className="w-12 h-12">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{account.name || "—"}</p>
              <p className="text-xs text-gray-500 truncate">{account.email}</p>
              {account.role && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {ROLE_LABELS[account.role] ?? account.role}
                </Badge>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="p-2 flex flex-col gap-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm"
              onClick={() => {
                setOpenPopover(false);
                setOpenDialog(true);
              }}
            >
              <KeyRound className="w-4 h-4" />
              Cambiar contraseña
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                setOpenPopover(false);
                navigate("/logout");
              }}
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Diálogo cambiar contraseña */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleChangePassword} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label htmlFor="new-pw">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="new-pw"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirm-pw">Confirmar contraseña</Label>
              <Input
                id="confirm-pw"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Guardando…" : "Guardar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
