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
import { ArrowUpDown, Building2, Eye, Pencil, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import CreateUniversityDialog from "../components/CreateUniversityDialog";
import ManageUniversityModal from "../components/ManageUniversityModal";
import {
  deactivateUniversity,
  getAdminUniversities,
  restoreUniversity,
  type AppUniversity,
  type UniversitySortColumn,
} from "../services/UniversitiesService";

type UniversitiesTab = "active" | "inactive";

const UNIVERSITIES_QUERY_KEY = "admin-universities";
const SEARCH_DEBOUNCE_MS = 500;

function tabClasses(selected: boolean) {
  return `flex-1 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none ${
    selected ? "bg-[#18b566] text-white" : "text-slate-600 hover:bg-slate-100"
  }`;
}

export default function UniversitiesPage() {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<UniversitiesTab>("active");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState<AppUniversity | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [pendingStatusUniversity, setPendingStatusUniversity] = useState<AppUniversity | null>(null);
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
  const sortBy = (activeSort?.id as UniversitySortColumn | undefined) ?? "createdAt";
  const sortDir = activeSort ? (activeSort.desc ? "desc" : "asc") : "desc";

  const queryKey = [
    UNIVERSITIES_QUERY_KEY,
    pagination.pageIndex,
    pagination.pageSize,
    isActive,
    debouncedSearch,
    sortBy,
    sortDir,
  ];

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey,
    queryFn: () =>
      getAdminUniversities({
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        isActive,
        search: debouncedSearch,
        sortBy,
        sortDir,
      }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const statusMutation = useMutation({
    mutationFn: ({ universityId, activate }: { universityId: string; activate: boolean }) =>
      activate ? restoreUniversity(universityId) : deactivateUniversity(universityId),
    onSuccess: (_, variables) => {
      toast.success(variables.activate ? "Universidad restaurada" : "Universidad desactivada");
      setPendingStatusUniversity(null);
      void queryClient.invalidateQueries({ queryKey: [UNIVERSITIES_QUERY_KEY] });
    },
    onError: () => toast.error("Error al cambiar el estado de la universidad"),
  });

  const universities = data?.universities ?? [];
  const total = data?.total ?? 0;

  const columns = useMemo<ColumnDef<AppUniversity>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
          >
            Nombre
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
      },
      {
        accessorKey: "campusCount",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
          >
            Campuses
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
      },
      {
        accessorKey: "recyclingPointCount",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
          >
            Puntos de reciclaje
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
      },
      {
        accessorKey: "lastModifiedAt",
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
    data: universities,
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
  }, [selectedTab, debouncedSearch, sortBy, sortDir]);

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
          <h1 className="text-[3rem] font-extrabold leading-none text-[#0b2f4e]">Gestión de Universidades</h1>
          <p className="mt-2 text-sm text-slate-500">
            Gestión de universidades registradas en la plataforma.
          </p>
        </div>
        <Button
          type="button"
          className="h-10 rounded-lg bg-[#18b566] px-5 text-sm font-semibold text-white hover:bg-[#129a56]"
          onClick={() => setShowCreate(true)}
        >
          <Building2 className="mr-2 h-4 w-4" />
          Crear universidad
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
                placeholder="Buscar por nombre..."
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
            {isFetching && <span className="text-sm text-slate-500">Actualizando...</span>}
          </div>

          <div className="inline-flex rounded-lg border border-[#d9dee2] bg-white p-1">
            <button
              type="button"
              onClick={() => setSelectedTab("active")}
              className={tabClasses(selectedTab === "active")}
            >
              Activas
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab("inactive")}
              className={tabClasses(selectedTab === "inactive")}
            >
              Inactivas
            </button>
          </div>
        </div>

        {!!error && (
          <p className="mt-4 text-sm text-red-600">
            No se pudieron cargar las universidades. Intenta nuevamente.
          </p>
        )}

        {!error && total === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-[#b7c7d6] bg-[#eef3f8] px-8 py-12 text-center">
            <p className="text-sm text-slate-600">
              {debouncedSearch
                ? "No hay universidades que coincidan con la búsqueda."
                : selectedTab === "active"
                  ? "No hay universidades activas."
                  : "No hay universidades inactivas."}
            </p>
          </div>
        )}

        {!error && total > 0 && (
          <>
            <div
              className={`mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white transition-opacity ${
                isFetching ? "opacity-60" : "opacity-100"
              }`}
            >
              <Table className="table-fixed">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-slate-200 hover:bg-transparent">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={`border-r border-slate-200 last:border-r-0 ${
                            header.id === "name" ? "w-64 text-left" : "text-center"
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
                    const university = row.original;
                    const isProcessing =
                      statusMutation.isPending &&
                      statusMutation.variables?.universityId === university.id;

                    return (
                      <TableRow key={university.id} className="border-slate-200 hover:bg-slate-50">
                        <TableCell className="w-64 truncate border-r border-slate-200 font-medium text-left">
                          {university.name}
                        </TableCell>
                        <TableCell className="border-r border-slate-200 text-center text-sm text-slate-500">
                          {university.campusCount}
                        </TableCell>
                        <TableCell className="border-r border-slate-200 text-center text-sm text-slate-500">
                          {university.recyclingPointCount}
                        </TableCell>
                        <TableCell className="border-r border-slate-200 text-center text-sm text-slate-500">
                          {university.lastModifiedAt
                            ? new Date(university.lastModifiedAt).toLocaleString("es-PE")
                            : "—"}
                        </TableCell>
                        <TableCell className="border-r border-slate-200 text-center text-sm text-slate-500">
                          {new Date(university.createdAt).toLocaleDateString("es-PE")}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {university.isActive ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setSelectedUniversity(university)}
                                  disabled={isProcessing}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40"
                                >
                                  <Pencil className="h-3 w-3" />
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() => setPendingStatusUniversity(university)}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                                >
                                  {isProcessing ? "..." : "Desactivar"}
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setSelectedUniversity(university)}
                                  disabled={isProcessing}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40"
                                >
                                  <Eye className="h-3 w-3" />
                                  Mostrar
                                </button>
                                <button
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() => setPendingStatusUniversity(university)}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-40"
                                >
                                  {isProcessing ? "..." : "Restaurar"}
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
                Mostrando {pageRows.length} de {total} universidades.
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
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))
                  }
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canGoNext}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))
                  }
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </>
        )}
      </AppSurface>

      {selectedUniversity && (
        <ManageUniversityModal
          university={selectedUniversity}
          onClose={() => setSelectedUniversity(null)}
          onUpdated={() => void queryClient.invalidateQueries({ queryKey: [UNIVERSITIES_QUERY_KEY] })}
        />
      )}

      {showCreate && (
        <CreateUniversityDialog
          onClose={() => setShowCreate(false)}
          onCreated={() => void queryClient.invalidateQueries({ queryKey: [UNIVERSITIES_QUERY_KEY] })}
        />
      )}

      <AlertDialog
        open={!!pendingStatusUniversity}
        onOpenChange={(open) => !open && setPendingStatusUniversity(null)}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatusUniversity?.isActive ? "¿Desactivar universidad?" : "¿Restaurar universidad?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatusUniversity?.isActive
                ? `La universidad "${pendingStatusUniversity.name}" quedará inactiva.`
                : `La universidad "${pendingStatusUniversity?.name}" volverá a estar activa.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={statusMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (pendingStatusUniversity) {
                  statusMutation.mutate({
                    universityId: pendingStatusUniversity.id,
                    activate: !pendingStatusUniversity.isActive,
                  });
                }
              }}
              className={pendingStatusUniversity?.isActive ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {statusMutation.isPending
                ? "Guardando..."
                : pendingStatusUniversity?.isActive
                  ? "Desactivar"
                  : "Restaurar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppPage>
  );
}