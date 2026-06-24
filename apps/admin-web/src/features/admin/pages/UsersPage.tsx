import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppPage, AppSurface } from "@/shared/components/AppPage";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, Search, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CreateUserDialog from "../components/CreateUserDialog";
import ManageUserModal from "../components/ManageUserModal";
import {
  getAdminUsers,
  type AppUser,
  type RoleFilter,
  type SortColumn,
} from "../services/AdminUsersService";

type UsersTab = "active" | "inactive";

const SEARCH_DEBOUNCE_MS = 500;

function tabClasses(selected: boolean) {
  return `flex-1 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none ${
    selected ? "bg-[#18b566] text-white" : "text-slate-600 hover:bg-slate-100"
  }`;
}

function translateRoleName(roleName: string | null): string {
  if (roleName?.toUpperCase() === "ADMIN") return "Administrador";
  if (roleName?.toUpperCase() === "MANAGER") return "Manager";
  if (!roleName) return "Sin rol";
  return roleName;
}

export default function UsersPage() {
  const [selectedTab, setSelectedTab] = useState<UsersTab>("active");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  // Debounce: solo dispara la búsqueda 500ms después de que el usuario deja de escribir.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const isActive = selectedTab === "active";
  const activeSort = sorting[0];
  const sortBy = (activeSort?.id as SortColumn | undefined) ?? "createdAt";
  const sortDir = activeSort ? (activeSort.desc ? "desc" : "asc") : "desc";

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: [
      "admin-users",
      pagination.pageIndex,
      pagination.pageSize,
      isActive,
      roleFilter,
      debouncedSearch,
      sortBy,
      sortDir,
    ],
    queryFn: () =>
      getAdminUsers({
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        isActive,
        roleFilter,
        search: debouncedSearch,
        sortBy,
        sortDir,
      }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  const columns = useMemo<ColumnDef<AppUser>[]>(
    () => [
      {
        accessorKey: "email",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
          >
            Correo
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
      },
      {
        id: "role",
        accessorFn: (row) => row.roleName ?? "",
        enableSorting: false,
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rol</span>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => row.isActive,
        enableSorting: false,
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</span>
        ),
      },
      {
        accessorKey: "lastLoginAt",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
          >
            Último login
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
          >
            Últ. modificación
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
          >
            Creado
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: users,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      // Single-sort: solo nos quedamos con la última columna activada.
      setSorting(next.slice(-1));
    },
    manualSorting: true,
    manualPagination: true,
    pageCount: Math.max(Math.ceil(total / pagination.pageSize), 1),
    getCoreRowModel: getCoreRowModel(),
  });

  // Resetear a la primera página cuando cambian filtros (no al cambiar de página).
  useEffect(() => {
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, [selectedTab, roleFilter, debouncedSearch, sortBy, sortDir]);

  const pageRows = table.getRowModel().rows;
  const canGoPrevious = pagination.pageIndex > 0;
  const canGoNext = (pagination.pageIndex + 1) * pagination.pageSize < total;
  const totalPages = table.getPageCount();

  if (isLoading) {
    return (
      <AppPage>
        <div className="flex flex-col gap-3 md:min-h-[72px] md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <AppSurface className="mt-8">
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </AppSurface>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <div className="flex flex-col gap-3 md:min-h-[72px] md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[3rem] font-extrabold leading-none text-[#0b2f4e]">Gestión de Cuentas</h1>
          <p className="mt-2 text-sm text-slate-500">
            Administra las cuentas con acceso al panel web y sus roles asignados.
          </p>
        </div>
        <Button
          type="button"
          className="h-10 rounded-lg bg-[#18b566] px-5 text-sm font-semibold text-white hover:bg-[#129a56]"
          onClick={() => setShowCreate(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Crear empleado
        </Button>
      </div>

      <AppSurface className="mt-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-[260px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por correo..."
                className="bg-white pl-9 pr-9"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Limpiar búsqueda"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilter)}>
              <SelectTrigger className="w-[200px] bg-white">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
                <SelectItem value="manager">Managers</SelectItem>
                <SelectItem value="none">Sin rol</SelectItem>
              </SelectContent>
            </Select>
            {isFetching && <span className="text-sm text-slate-500">Actualizando...</span>}
          </div>
          <div className="inline-flex rounded-lg border border-[#d9dee2] bg-white p-1">
            <button
              type="button"
              onClick={() => setSelectedTab("active")}
              className={tabClasses(selectedTab === "active")}
            >
              Activos
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab("inactive")}
              className={tabClasses(selectedTab === "inactive")}
            >
              Inactivos
            </button>
          </div>
        </div>

        {!!error && (
          <p className="mt-4 text-sm text-red-600">
            No se pudieron cargar las cuentas. Intenta nuevamente.
          </p>
        )}
        {!error && total === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-[#b7c7d6] bg-[#eef3f8] px-8 py-12 text-center">
            <p className="text-sm text-slate-600">
              {debouncedSearch
                ? "No hay cuentas que coincidan con la búsqueda."
                : roleFilter !== "all"
                  ? "No hay cuentas para el filtro de rol seleccionado."
                  : selectedTab === "active"
                    ? "No hay cuentas activas."
                    : "No hay cuentas inactivas."}
            </p>
          </div>
        )}
        {!error && total > 0 && (
          <>
            <div className={`mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}>
              <Table className="table-fixed">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-slate-200 hover:bg-transparent">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={`border-r border-slate-200 last:border-r-0 ${
                            header.id === "email" ? "w-64 text-left" : "text-center"
                          }`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {pageRows.map((row) => {
                    const user = row.original;
                    return (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer border-slate-200 hover:bg-slate-50"
                        onClick={() => setSelectedUser(user)}
                      >
                        <TableCell className="w-64 truncate border-r border-slate-200 font-medium text-left">
                          {user.email}
                        </TableCell>
                        <TableCell className="border-r border-slate-200 text-center">
                          <Badge variant="outline">{translateRoleName(user.roleName)}</Badge>
                        </TableCell>
                        <TableCell className="border-r border-slate-200 text-center">
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="border-r border-slate-200 text-center text-sm text-slate-500">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("es-PE") : "—"}
                        </TableCell>
                        <TableCell className="border-r border-slate-200 text-center text-sm text-slate-500">
                          {user.updatedAt ? new Date(user.updatedAt).toLocaleString("es-PE") : "—"}
                        </TableCell>
                        <TableCell className="text-center text-sm text-slate-500">
                          {new Date(user.createdAt).toLocaleDateString("es-PE")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <div>
                Mostrando {pageRows.length} de {total} cuentas.
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={String(pagination.pageSize)}
                  onValueChange={(value) => setPagination({ pageIndex: 0, pageSize: Number(value) })}
                >
                  <SelectTrigger className="h-9 w-[110px] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {[10, 20, 50].map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size} por página
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>
                  Página {pagination.pageIndex + 1} de {Math.max(totalPages, 1)}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canGoPrevious}
                  onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canGoNext}
                  onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </>
        )}
      </AppSurface>
      {selectedUser && (
        <ManageUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={() => refetch()}
        />
      )}
      {showCreate && (
        <CreateUserDialog onClose={() => setShowCreate(false)} onCreated={() => refetch()} />
      )}
    </AppPage>
  );
}