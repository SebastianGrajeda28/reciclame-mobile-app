import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lightbulb, Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/shared/context/UserContext";
import FunFactCard, { type FunFact } from "../components/FunFactCard";
import {
  createFunFact,
  deactivateFunFact,
  getFunFacts,
  restoreFunFact,
  updateFunFact as updateFunFactRequest,
  type FunFactPayload,
} from "../services/FunFactsService";
import { getWasteTypes, type WasteType } from "../services/WasteTypesService";

type FunFactsTab = "active" | "inactive";

const FUN_FACTS_QUERY_KEY = ["admin-fun-facts"];
const WASTE_TYPES_QUERY_KEY = ["admin-waste-types"];

function getWasteTypeName(wasteTypes: WasteType[], wasteTypeId: string) {
  return wasteTypes.find((type) => type.id === wasteTypeId)?.name ?? "Sin tipo";
}

function FunFactsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-11 w-full sm:w-72" />
      </div>

      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-xl border bg-slate-50 p-5 shadow-sm dark:bg-gray-800/60">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-6 w-44 rounded-md" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FunFactsPage() {
  const { session } = useUser();
  const queryClient = useQueryClient();
  const [wasteTypeId, setWasteTypeId] = useState("");
  const [text, setText] = useState("");
  const [selectedTab, setSelectedTab] = useState<FunFactsTab>("active");
  const [savingFactId, setSavingFactId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: FUN_FACTS_QUERY_KEY,
    queryFn: () => getFunFacts(session!.access_token),
    enabled: !!session,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const {
    data: wasteTypes = [],
    isLoading: isWasteTypesLoading,
    error: wasteTypesError,
  } = useQuery({
    queryKey: WASTE_TYPES_QUERY_KEY,
    queryFn: () => getWasteTypes(session!.access_token),
    enabled: !!session,
    staleTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: (values: FunFactPayload) =>
      createFunFact(session!.access_token, values),
    onSuccess: async () => {
      resetCreateForm();
      setSelectedTab("active");
      toast.success("Dato curioso creado exitosamente");
      await queryClient.invalidateQueries({ queryKey: FUN_FACTS_QUERY_KEY });
    },
    onError: () => {
      toast.error("Error al crear el dato curioso");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: FunFactPayload }) =>
      updateFunFactRequest(session!.access_token, id, values),
    onSuccess: async () => {
      toast.success("Dato curioso actualizado exitosamente");
      await queryClient.invalidateQueries({ queryKey: FUN_FACTS_QUERY_KEY });
    },
    onError: () => {
      toast.error("Error al actualizar el dato curioso");
    },
    onSettled: () => {
      setSavingFactId(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive
        ? restoreFunFact(session!.access_token, id)
        : deactivateFunFact(session!.access_token, id),
    onSuccess: async (_, variables) => {
      setSelectedTab(variables.isActive ? "active" : "inactive");
      toast.success(variables.isActive ? "Dato curioso restaurado" : "Dato curioso desactivado");
      await queryClient.invalidateQueries({ queryKey: FUN_FACTS_QUERY_KEY });
    },
    onError: () => {
      toast.error("Error al cambiar el estado del dato curioso");
    },
    onSettled: () => {
      setSavingFactId(null);
    },
  });

  const funFacts = data ?? [];
  const activeFacts = funFacts.filter((fact) => fact.isActive);
  const inactiveFacts = funFacts.filter((fact) => !fact.isActive);
  const displayedFacts = selectedTab === "active" ? activeFacts : inactiveFacts;
  const isCreating = createMutation.isPending;
  const isMutating = isCreating || updateMutation.isPending || statusMutation.isPending;
  const canSubmit =
    wasteTypeId.trim().length > 0 &&
    text.trim().length > 0 &&
    !isCreating &&
    !isWasteTypesLoading &&
    !wasteTypesError;

  function resetCreateForm() {
    setWasteTypeId("");
    setText("");
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    createMutation.mutate({
      text: text.trim(),
      wasteTypeId,
    });
  }

  async function updateFunFact(id: string, values: Pick<FunFact, "text" | "wasteTypeId">) {
    setSavingFactId(id);
    await updateMutation.mutateAsync({ id, values });
  }

  async function changeFunFactStatus(id: string, isActive: boolean) {
    setSavingFactId(id);
    await statusMutation.mutateAsync({ id, isActive });
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Panel
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestion de Datos Curiosos</h1>
        <p className="text-gray-500">
          Administra los mensajes educativos que se muestran a los usuarios.
        </p>
      </div>

      <Card className="mb-8 bg-slate-50 dark:bg-gray-800/60">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="w-5 h-5 text-emerald-600" />
            Crear nuevo dato curioso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="waste-type" className="text-sm font-medium">
                Tipo de residuo
              </label>
              <Select value={wasteTypeId} onValueChange={setWasteTypeId} disabled={isCreating || isWasteTypesLoading || !!wasteTypesError}>
                <SelectTrigger id="waste-type" className="bg-white dark:bg-gray-900">
                  <SelectValue placeholder={isWasteTypesLoading ? "Cargando tipos..." : "Selecciona un tipo de residuo"} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900">
                  {wasteTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {wasteTypesError && (
                <p className="text-sm text-red-600 dark:text-red-300">
                  No se pudieron cargar los tipos de residuo.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="fun-fact-text" className="text-sm font-medium">
                Texto del dato curioso
              </label>
              <Textarea
                id="fun-fact-text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Escribe un dato curioso sobre reciclaje..."
                disabled={isCreating}
                className="min-h-28 bg-white dark:bg-gray-900"
              />
            </div>

            <Button type="submit" disabled={!canSubmit}>
              <Plus className="w-4 h-4" />
              {isCreating ? "Creando..." : "Crear dato curioso"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-4">
        {isLoading ? (
          <FunFactsSkeleton />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            Error al cargar los datos curiosos: {(error as Error).message}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Datos curiosos existentes</h2>
                <p className="text-sm text-gray-500">
                  {isFetching ? "Actualizando datos..." : "Gestiona datos activos e inactivos."}
                </p>
              </div>

              <div className="inline-flex w-full rounded-lg border bg-white p-1 dark:bg-gray-900 sm:w-auto">
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={() => setSelectedTab("active")}
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none ${selectedTab === "active" ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
                >
                  Datos activos ({activeFacts.length})
                </button>
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={() => setSelectedTab("inactive")}
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none ${selectedTab === "inactive" ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
                >
                  Datos inactivos ({inactiveFacts.length})
                </button>
              </div>
            </div>

            <div className={`space-y-4 transition-opacity ${isFetching && !isLoading ? "opacity-60" : "opacity-100"}`}>
              {displayedFacts.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">
                  {selectedTab === "active"
                    ? "No hay datos curiosos activos."
                    : "No hay datos curiosos inactivos."}
                </div>
              ) : (
                displayedFacts.map((fact) => (
                  <FunFactCard
                    key={fact.id}
                    fact={fact}
                    wasteTypes={wasteTypes}
                    getWasteTypeLabel={(id) => getWasteTypeName(wasteTypes, id)}
                    isSaving={savingFactId === fact.id}
                    onUpdate={updateFunFact}
                    onChangeStatus={changeFunFactStatus}
                  />
                ))
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
