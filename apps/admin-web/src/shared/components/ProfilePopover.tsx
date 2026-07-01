import usuarioPerfil from "@/assets/usuario_perfil.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { selfRevokeAccess, updateCurrentUserPassword } from "@/features/auth/services/authService";
import { Eye, EyeOff, KeyRound, LogOut, UserX } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUser } from "../context/UserContext";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  MANAGER: "Manager",
  VIEWER: "Viewer",
};

const CONFIRM_PHRASE = "Darme de baja";

export default function ProfilePopover() {
  const { account } = useUser();
  const navigate = useNavigate();
  const [openPopover, setOpenPopover] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const [openRevokeDialog, setOpenRevokeDialog] = useState(false);
  const [revokeConfirmText, setRevokeConfirmText] = useState("");
  const [revokeLoading, setRevokeLoading] = useState(false);

  if (!account) return null;

  const isManager = (account.role ?? "").toUpperCase() === "MANAGER";

  const hasName = Boolean(account.name && account.name.trim().length > 0);
  const firstLetter = hasName
    ? account.name!.trim()[0].toUpperCase()
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

  const handleSelfRevoke = async () => {
    setRevokeLoading(true);
    try {
      await selfRevokeAccess(account.id);
      toast.success("Se ha dado de baja tu acceso");
      setOpenRevokeDialog(false);
      navigate("/logout");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al dar de baja el acceso");
    } finally {
      setRevokeLoading(false);
    }
  };

  const canConfirmRevoke = revokeConfirmText.trim() === CONFIRM_PHRASE;

  return (
    <>
      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-(--brand) focus:ring-offset-2">
            <Avatar className="cursor-pointer transition hover:opacity-80">
              {hasName ? (
                <AvatarFallback className="bg-slate-700 text-lg font-semibold text-white">
                  {firstLetter}
                </AvatarFallback>
              ) : (
                <>
                  <AvatarImage src={usuarioPerfil} alt="Foto de perfil" />
                  <AvatarFallback>{firstLetter}</AvatarFallback>
                </>
              )}
            </Avatar>
          </button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-72 overflow-hidden p-0">
          <div className="flex items-center gap-3 border-b bg-gray-50 p-4">
            <Avatar className="h-12 w-12">
              {hasName ? (
                <AvatarFallback className="bg-slate-700 text-lg font-semibold text-white">
                  {firstLetter}
                </AvatarFallback>
              ) : (
                <>
                  <AvatarImage src={usuarioPerfil} alt="Foto de perfil" />
                  <AvatarFallback className="text-lg">{firstLetter}</AvatarFallback>
                </>
              )}
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

            {isManager && (
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  setOpenPopover(false);
                  setOpenRevokeDialog(true);
                }}
              >
                <UserX className="h-4 w-4" />
                Darme de baja
              </Button>
            )}
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

      {isManager && (
        <Dialog
          open={openRevokeDialog}
          onOpenChange={(open) => {
            setOpenRevokeDialog(open);
            if (!open) setRevokeConfirmText("");
          }}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-red-600">Darme de baja</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Esta acción quitará tu acceso a la plataforma de administración. Tu rol actual
                quedará desactivado y no podrás volver a iniciar sesión hasta que un administrador
                te lo restaure.
              </p>

              <div className="space-y-1">
                <Label htmlFor="revoke-confirm">
                  Escribe <span className="font-semibold">"{CONFIRM_PHRASE}"</span> para confirmar
                </Label>
                <Input
                  id="revoke-confirm"
                  value={revokeConfirmText}
                  onChange={(e) => setRevokeConfirmText(e.target.value)}
                  placeholder={CONFIRM_PHRASE}
                  autoComplete="off"
                />
              </div>

              <Button
                type="button"
                variant="destructive"
                className="w-full"
                disabled={!canConfirmRevoke || revokeLoading}
                onClick={handleSelfRevoke}
              >
                {revokeLoading ? "Procesando…" : "Confirmar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}