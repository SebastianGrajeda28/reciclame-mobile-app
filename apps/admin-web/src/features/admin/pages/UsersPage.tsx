import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppPage, AppSurface } from "@/shared/components/AppPage";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, Eye, Pencil, Search, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import CreateUserDialog from "../components/CreateUserDialog";
import ManageUserModal from "../components/ManageUserModal";
import {
  deactivateEmployee,
  getAdminEmployees,
  restoreUserAccess,
  revokeUserAccess,
  type AppEmployee,
  type RoleFilter,
  type SortColumn,
} from "../services/AdminUsersService";

type UsersTab = "active" | "inactive";

const USERS_QUERY_KEY = "admin-users";
const SEARCH_DEBOUNCE_MS = 500;

function tabClasses(selected: boolean) {
  return `flex-1 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none ${
    selected ? "bg-[#18b566] text-white" : "text-slate-600 hover:bg-slate-100"
  }`;
}

function translateRoleName(roleName: string | null): string {
  if (roleName?.toUpperCase() === "ADMIN") return "Administrador";
  if (roleName?.toUpperCase() === "MANAGER") return "Manager";
  return "—";
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<UsersTab>("active");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AppEmployee | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [pendingRevoke, setPendingRevoke] = useState<AppEmployee | null>(null);
  const [pendingRestore, setPendingRestore] = useState<AppEmployee | null>(null);
  const [pendingDeactivate, setPendingDeactivate] = useState<AppEmployee | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

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

  const queryKey = [
    USERS_QUERY_KEY,
    pagination.pageIndex,
    pagination.pageSize,
    isActive,
    roleFilter,
    debouncedSearch,
    sortBy,
    sortDir,
  ];

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey,
    queryFn: () =>
      getAdminEmployees({
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

  const revokeMutation = useMutation({
    mutationFn: (user: AppEmployee) => revokeUserAccess(user.id),
    onSuccess: () => {
      toast.success("Acceso revocado");
      setPendingRevoke(null);
      void queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
    onError: () => toast.error("Error al revocar el acceso"),
  });

  const restoreMutation = useMutation({
    mutationFn: (user: AppEmployee) => restoreUserAccess(user.id),
    onSuccess: () => {
      toast.success("Acceso restablecido");
      setPendingRestore(null);
      void queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
    onError: () => toast.error("Error al restablecer el acceso"),
  });

  const deactivateMutation = useMutation({
    mutationFn: (user: AppEmployee) => deactivateEmployee(user.id),
    onSuccess: () => {
      toast.success("Empleado desactivado");
      setPendingDeactivate(null);
      void queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
    onError: () => toast.error("Error al desactivar el empleado"),
  });

  const employees = data?.employees ?? [];
  const total = data?.total ?? 0;

  const columns = useMemo<ColumnDef<AppEmployee>[]>(
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
      {
        id: "actions",
        enableSorting: false,
        header: () => (
          <span className="block text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
            Acciones
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: employees,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(next.slice(-1));
    },
    manualSorting: true,
    manualPagination: true,
    pageCount: Math.max(Math.ceil(total / pagination.pageSize), 1),
    getCoreRowModel: getCoreRowModel(),
  });

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
          <h1 className="text-[3rem] font-extrabold leading-none text-[#0b2f4e]">Gestión de Empleados</h1>
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
              Vigentes
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab("inactive")}
              className={tabClasses(selectedTab === "inactive")}
            >
              Revocados
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
                ? "No hay empleados que coincidan con la búsqueda."
                : roleFilter !== "all"
                  ? "No hay empleados para el filtro de rol seleccionado."
                  : selectedTab === "active"
                    ? "No hay empleados con acceso vigente."
                    : "No hay empleados con acceso revocado."}
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
                    const isRevoking = revokeMutation.isPending && pendingRevoke?.id === user.id;
                    const isRestoring = restoreMutation.isPending && pendingRestore?.id === user.id;
                    const isDeactivating = deactivateMutation.isPending && pendingDeactivate?.id === user.id;
                    const isProcessing = isRevoking || isRestoring || isDeactivating;

                    return (
                      <TableRow key={user.id} className="border-slate-200 hover:bg-slate-50">
                        <TableCell className="w-64 truncate border-r border-slate-200 font-medium text-left">
                          {user.email}
                        </TableCell>
                        <TableCell className="border-r border-slate-200 text-center">
                          <Badge variant="outline">{translateRoleName(user.roleName)}</Badge>
                        </TableCell>
                        <TableCell className="border-r border-slate-200 text-center text-sm text-slate-500">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("es-PE") : "—"}
                        </TableCell>
                        <TableCell className="border-r border-slate-200 text-center text-sm text-slate-500">
                          {new Date(user.createdAt).toLocaleDateString("es-PE")}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {selectedTab === "active" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setSelectedUser(user)}
                                  disabled={isProcessing}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40"
                                >
                                  <Pencil className="h-3 w-3" />
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() => setPendingRevoke(user)}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                                >
                                  {isRevoking ? "..." : "Revocar acceso"}
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setSelectedUser(user)}
                                  disabled={isProcessing}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40"
                                >
                                  <Eye className="h-3 w-3" />
                                  Mostrar
                                </button>
                                <button
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() => setPendingRestore(user)}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-40"
                                >
                                  {isRestoring ? "..." : "Restablecer acceso"}
                                </button>
                                <button
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() => setPendingDeactivate(user)}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                                >
                                  {isDeactivating ? "..." : "Desactivar"}
                                </button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <div>
                Mostrando {pageRows.length} de {total} empleados.
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
          onUpdated={() => void queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })}
        />
      )}
      {showCreate && (
        <CreateUserDialog
          onClose={() => setShowCreate(false)}
          onCreated={() => void queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })}
        />
      )}

      <AlertDialog open={!!pendingRevoke} onOpenChange={(open) => !open && setPendingRevoke(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Revocar acceso?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="mt-1 space-y-3">
                <p className="text-sm text-slate-500">Se aplicarán los siguientes cambios:</p>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                  <div className="flex items-center gap-2 py-0.5">
                    <span className="w-16 shrink-0 text-slate-500 text-xs">Empleado</span>
                    <span className="font-medium text-slate-700">{pendingRevoke?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 py-0.5">
                    <span className="w-16 shrink-0 text-slate-500 text-xs">Acceso</span>
                    <span className="font-medium text-slate-700">Vigente</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-semibold text-red-500">Revocado</span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={revokeMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (pendingRevoke) revokeMutation.mutate(pendingRevoke);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {revokeMutation.isPending ? "Revocando..." : "Revocar acceso"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!pendingRestore} onOpenChange={(open) => !open && setPendingRestore(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restablecer acceso?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="mt-1 space-y-3">
                <p className="text-sm text-slate-500">Se aplicarán los siguientes cambios:</p>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                  <div className="flex items-center gap-2 py-0.5">
                    <span className="w-16 shrink-0 text-slate-500 text-xs">Empleado</span>
                    <span className="font-medium text-slate-700">{pendingRestore?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 py-0.5">
                    <span className="w-16 shrink-0 text-slate-500 text-xs">Acceso</span>
                    <span className="font-medium text-slate-700">Revocado</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-semibold text-[#18b566]">Vigente</span>
                  </div>
                  <div className="flex items-center gap-2 py-0.5">
                    <span className="w-16 shrink-0 text-slate-500 text-xs">Rol</span>
                    <span className="font-medium text-slate-700">{translateRoleName(pendingRestore?.roleName ?? null)}</span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoreMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={restoreMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (pendingRestore) restoreMutation.mutate(pendingRestore);
              }}
            >
              {restoreMutation.isPending ? "Restableciendo..." : "Restablecer acceso"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!pendingDeactivate} onOpenChange={(open) => !open && setPendingDeactivate(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar empleado?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="mt-1 space-y-3">
                <p className="text-sm text-slate-500">Se aplicarán los siguientes cambios:</p>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                  <div className="flex items-center gap-2 py-0.5">
                    <span className="w-16 shrink-0 text-slate-500 text-xs">Empleado</span>
                    <span className="font-medium text-slate-700">{pendingDeactivate?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 py-0.5">
                    <span className="w-16 shrink-0 text-slate-500 text-xs">Estado</span>
                    <span className="font-medium text-slate-700">Activo</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-semibold text-red-500">Desactivado</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">El empleado dejará de aparecer en esta lista.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deactivateMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (pendingDeactivate) deactivateMutation.mutate(pendingDeactivate);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {deactivateMutation.isPending ? "Desactivando..." : "Desactivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppPage>
  );
}