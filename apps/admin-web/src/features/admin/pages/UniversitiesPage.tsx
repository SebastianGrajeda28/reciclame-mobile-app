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
import { ArrowUpDown, Building2, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CreateUniversityDialog from "../components/CreateUniversityDialog";
import ManageUniversityModal from "../components/ManageUniversityModal";
import {
    getAdminUniversities,
    type AppUniversity,
    type UniversitySortColumn,
} from "../services/AdminUniversitiesService";

type UniversitiesTab = "active" | "inactive";

const SEARCH_DEBOUNCE_MS = 500;

function tabClasses(selected: boolean) {
  return `flex-1 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none ${
    selected ? "bg-[#18b566] text-white" : "text-slate-600 hover:bg-slate-100"
  }`;
}

export default function UniversitiesPage() {
  const [selectedTab, setSelectedTab] = useState<UniversitiesTab>("active");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState<AppUniversity | null>(null);
  const [showCreate, setShowCreate] = useState(false);
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

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: [
      "admin-universities",
      pagination.pageIndex,
      pagination.pageSize,
      isActive,
      debouncedSearch,
      sortBy,
      sortDir,
    ],
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
        id: "status",
        accessorFn: (row) => row.isActive,
        enableSorting: false,
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</span>
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
          <h1 className="text-[3rem] font-extrabold leading-none text-[#0b2f4e]">Universidades</h1>
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
            <div className={`mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}>
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
                    return (
                      <TableRow
                        key={university.id}
                        className="cursor-pointer border-slate-200 hover:bg-slate-50"
                        onClick={() => setSelectedUniversity(university)}
                      >
                        <TableCell className="w-64 truncate border-r border-slate-200 font-medium text-left">
                          {university.name}
                        </TableCell>
                        <TableCell className="border-r border-slate-200 text-center">
                          <Badge variant={university.isActive ? "default" : "secondary"}>
                            {university.isActive ? "Activa" : "Inactiva"}
                          </Badge>
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
                        <TableCell className="text-center text-sm text-slate-500">
                          {new Date(university.createdAt).toLocaleDateString("es-PE")}
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

      {selectedUniversity && (
        <ManageUniversityModal
          university={selectedUniversity}
          onClose={() => setSelectedUniversity(null)}
          onUpdated={() => refetch()}
        />
      )}

      {showCreate && (
        <CreateUniversityDialog onClose={() => setShowCreate(false)} onCreated={() => refetch()} />
      )}
    </AppPage>
  );
}