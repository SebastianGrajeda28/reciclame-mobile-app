import { useEffect, useState } from "react";
import { useUser } from "@/shared/context/UserContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus } from "lucide-react";
import AssignRoleModal from "../components/AssignRoleModal";
import CreateUserDialog from "../components/CreateUserDialog";

interface AppUser {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string | null;
  lastLoginAt: string | null;
  isActive: boolean;
}

interface UserRoleRow {
  userId: string;
  roleName: string;
}

type RoleFilter = "all" | "with" | "without";

export default function UsersPage() {
  const { session } = useUser();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [roleMap, setRoleMap] = useState<Map<string, string>>(new Map());
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("with");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadUsers = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${session.access_token}` };
      const base = import.meta.env.VITE_BACKEND_URL;

      const [usersRes, rolesRes] = await Promise.all([
        fetch(`${base}/api/users?includeInactive=true`, { headers }),
        fetch(`${base}/api/user-roles?includeInactive=false`, { headers }),
      ]);

      if (!usersRes.ok) throw new Error(`Error ${usersRes.status}`);
      if (!rolesRes.ok) throw new Error(`Error ${rolesRes.status}`);

      const [usersData, rolesData]: [AppUser[], UserRoleRow[]] = await Promise.all([
        usersRes.json(),
        rolesRes.json(),
      ]);

      setUsers(usersData);
      setRoleMap(new Map(rolesData.map((r) => [r.userId, r.roleName])));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, [session]);

  const filtered = users.filter((u) => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const hasRole = roleMap.has(u.id);
    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "with" && hasRole) ||
      (roleFilter === "without" && !hasRole);
    return matchesSearch && matchesRole;
  });

  if (loading) return <p className="p-6 text-gray-500">Cargando usuarios...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestión de Cuentas</h1>
        <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Crear empleado
        </Button>
      </div>

      {/* Barra de filtros */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="with">Con rol asignado</SelectItem>
            <SelectItem value="without">Sin rol asignado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Último login</TableHead>
              <TableHead>Creado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedUser(user)}
                >
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    {roleMap.has(user.id) ? (
                      <Badge variant="outline">{roleMap.get(user.id)}</Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin rol</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString("es-PE")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString("es-PE")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <AssignRoleModal
          userId={selectedUser.id}
          userEmail={selectedUser.email}
          userIsActive={selectedUser.isActive}
          onClose={() => setSelectedUser(null)}
          onUpdated={loadUsers}
        />
      )}

      {showCreate && (
        <CreateUserDialog
          onClose={() => setShowCreate(false)}
          onCreated={loadUsers}
        />
      )}
    </div>
  );
}
