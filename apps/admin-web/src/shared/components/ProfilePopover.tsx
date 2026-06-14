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
import { updateCurrentUserPassword } from "@/features/auth/services/authService";
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
      await updateCurrentUserPassword(password);
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
            <Avatar className="cursor-pointer transition hover:opacity-80">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-72 overflow-hidden p-0">
          <div className="flex items-center gap-3 border-b bg-gray-50 p-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{account.name || "—"}</p>
              <p className="truncate text-xs text-gray-500">{account.email}</p>
              {account.role && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {ROLE_LABELS[account.role] ?? account.role}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 p-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm"
              onClick={() => {
                setOpenPopover(false);
                setOpenDialog(true);
              }}
            >
              <KeyRound className="h-4 w-4" />
              Cambiar contraseña
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                setOpenPopover(false);
                navigate("/logout");
              }}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleChangePassword} className="mt-2 space-y-4">
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
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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