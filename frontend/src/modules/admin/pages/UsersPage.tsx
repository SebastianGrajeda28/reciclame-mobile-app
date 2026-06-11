import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, UserPlus, X } from "lucide-react";
import { useUser } from "@/shared/context/UserContext";
import { buildBackendUrl } from "@/lib/backend-url";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ManageUserModal from "../components/ManageUserModal";
import CreateUserDialog from "../components/CreateUserDialog";

type AppUser = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string | null;
  lastLoginAt: string | null;
  isActive: boolean;
};

type UserRoleRow = {
  userId: string;
  roleName: string;
};

type AdminUsersData = {
  users: AppUser[];
  roleMap: Map<string, string>;
};

type RoleFilter = "all" | "with" | "without";

function UsersTableSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-9 w-36" />
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Skeleton className="h-9 max-w-sm min-w-48 flex-1" />
        <Skeleton className="h-9 w-44" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
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
            {Array.from({ length: 6 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

async function fetchAdminUsers(accessToken: string): Promise<AdminUsersData> {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const [usersRes, rolesRes] = await Promise.all([
    fetch(buildBackendUrl("/api/users?includeInactive=true"), { headers }),
    fetch(buildBackendUrl("/api/user-roles?includeInactive=false"), { headers }),
  ]);

  if (!usersRes.ok) throw new Error(`Error usuarios ${usersRes.status}`);
  if (!rolesRes.ok) throw new Error(`Error roles ${rolesRes.status}`);

  const [users, roles]: [AppUser[], UserRoleRow[]] = await Promise.all([
    usersRes.json(),
    rolesRes.json(),
  ]);

  return {
    users,
    roleMap: new Map(roles.map((role) => [role.userId, role.roleName])),
  };
}

export default function UsersPage() {
  const { session } = useUser();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("with");
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-users", session?.user.id],
    queryFn: () => fetchAdminUsers(session!.access_token),
    enabled: !!session,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const users = data?.users ?? [];
  const roleMap = data?.roleMap ?? new Map<string, string>();

  const filtered = users.filter((user) => {
    const matchesSearch = user.email.toLowerCase().includes(search.toLowerCase());
    const hasRole = roleMap.has(user.id);
    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "with" && hasRole) ||
      (roleFilter === "without" && !hasRole);
    return matchesSearch && matchesRole;
  });

  if (isLoading) return <UsersTableSkeleton />;
  if (error) return <p>Error: {(error as Error).message}</p>;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Cuentas</h1>
        <div className="flex items-center gap-3">
          {isFetching && <span className="text-sm text-gray-500">Actualizando...</span>}
          <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Crear empleado
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative max-w-sm min-w-48 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilter)}>
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

      <div className={`overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}>
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
                <TableCell colSpan={5} className="py-8 text-center text-gray-400">
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
                      <span className="text-sm text-gray-500 dark:text-gray-300">Sin rol</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 dark:text-gray-300">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("es-PE") : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 dark:text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString("es-PE")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <ManageUserModal
          userId={selectedUser.id}
          userEmail={selectedUser.email}
          userIsActive={selectedUser.isActive}
          onClose={() => setSelectedUser(null)}
          onUpdated={() => refetch()}
        />
      )}

      {showCreate && (
        <CreateUserDialog
          onClose={() => setShowCreate(false)}
          onCreated={() => refetch()}
        />
      )}
    </div>
  );
}
