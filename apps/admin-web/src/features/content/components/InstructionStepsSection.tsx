import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, ImagePlus, Pencil, Plus, Save, Trash2, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/shared/context/UserContext";
import { uploadInstructionStepImage } from "@/features/admin/services/AdminStorageService";
import {
  createInstructionStep,
  deactivateInstructionStep,
  getInstructionSteps,
  updateInstructionStep,
  type InstructionStep,
} from "../services/InstructionStepsService";
import {
  updateInstruction,
  encodeStepOrder,
  parseStepOrder,
  type Instruction,
} from "../services/InstructionsService";

const MAX_STEPS = 3;

// ─── Local step type ─────────────────────────────────────────────────────────

type LocalStep = {
  /** "new-<uuid>" for unsaved, real DB id for existing */
  id: string;
  text: string;
  imageUrl: string | null;
  pendingImageFile?: File;
  pendingImagePreview?: string;
  isNew: boolean;
  isDeleted: boolean;
  isDirty: boolean;
};

function toLocalStep(step: InstructionStep): LocalStep {
  return {
    id: step.id,
    text: step.text,
    imageUrl: step.imageUrl,
    isNew: false,
    isDeleted: false,
    isDirty: false,
  };
}

function makeTempId() {
  return `new-${crypto.randomUUID()}`;
}

type InstructionStepsSectionProps = {
  instruction: Instruction;
};

// ─── Sortable step row ───────────────────────────────────────────────────────

function SortableStepRow({
  step,
  index,
  isEditing,
  editText,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  onDelete,
  onUploadImage,
}: {
  step: LocalStep;
  index: number;
  isEditing: boolean;
  editText: string;
  onEditStart: () => void;
  onEditChange: (v: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDelete: () => void;
  onUploadImage: (file: File) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const previewSrc = step.pendingImagePreview ?? step.imageUrl;

  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-2 rounded-lg bg-slate-50/60 px-3 py-2.5">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing"
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <span className="shrink-0 w-5 text-xs font-semibold text-slate-400">{index + 1}.</span>

      {isEditing ? (
        <>
          <Input
            value={editText}
            onChange={(e) => onEditChange(e.target.value)}
            className="h-8 flex-1 border-slate-200 bg-white text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") onEditSave();
              if (e.key === "Escape") onEditCancel();
            }}
          />
          <button
            type="button"
            disabled={editText.trim().length === 0}
            onClick={onEditSave}
            className="shrink-0 rounded p-1 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onEditCancel} className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </>
      ) : (
        <>
          <label className="shrink-0 cursor-pointer" title={previewSrc ? "Cambiar imagen" : "Subir imagen"}>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadImage(file);
                e.target.value = "";
              }}
            />
            {previewSrc ? (
              <img src={previewSrc} alt="paso" className="h-14 w-14 rounded-lg object-cover ring-1 ring-slate-200 hover:ring-emerald-400 transition" />
            ) : (
              <span className="flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-emerald-400 hover:text-emerald-500 transition">
                <ImagePlus className="h-5 w-5" />
                <span className="text-[9px] font-medium">imagen</span>
              </span>
            )}
          </label>

          <span className="min-w-0 flex-1 text-sm text-slate-700 leading-snug">{step.text}</span>

          <button
            type="button"
            onClick={onEditStart}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Pencil className="h-3 w-3" />
            Editar
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-red-100 bg-white px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
            Eliminar
          </button>
        </>
      )}
    </li>
  );
}

// ─── Mobile preview ──────────────────────────────────────────────────────────

const SCALE = 0.62;
const IMG_SIZE = Math.round(150 * SCALE); // 93
const NUM_SIZE = Math.round(32 * SCALE);  // 20

export function MobilePreview({
  steps,
  wasteTypeName,
}: {
  steps: (InstructionStep | LocalStep)[];
  wasteTypeName?: string;
}) {
  const allSteps = [...steps, null]; // null = locked bin step

  return (
    <div className="flex flex-col items-center xl:items-end">
      <div
        className="relative flex flex-col overflow-hidden rounded-[36px] border-[4px] border-slate-800 bg-white shadow-2xl"
        style={{ width: 320, height: 640 }}
      >
        {/* Status bar */}
        <div className="flex shrink-0 items-center justify-between bg-white px-4 pt-2 pb-1">
          <span className="text-[9px] font-semibold text-slate-800">9:41</span>
          <div className="flex items-center gap-1">
            <div className="h-[6px] w-[6px] rounded-full bg-slate-800" />
            <div className="h-[6px] w-[6px] rounded-full bg-slate-800" />
            <div className="h-[6px] w-[6px] rounded-full bg-slate-800" />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
          {/* Tag pill */}
          <div className="shrink-0 px-4 pb-3 pt-1">
            <span
              className="inline-block rounded-full border px-3 py-1 text-[11px] font-medium"
              style={{ borderColor: "#43DF8B", color: "#43DF8B" }}
            >
              {wasteTypeName ?? "Residuo"} · Contenedor
            </span>
          </div>

          {/* Step list */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <div className="flex flex-col gap-4">
              {allSteps.map((step, i) => {
                const isLocked = step === null;
                const imageFirst = i % 2 === 0;
                const imageUrl = step == null
                  ? null
                  : "pendingImagePreview" in step
                    ? (step.pendingImagePreview ?? step.imageUrl)
                    : (step as InstructionStep).imageUrl;

                const imageBlock = isLocked || !imageUrl ? (
                  <div
                    className="shrink-0 rounded-xl"
                    style={{ width: IMG_SIZE, height: IMG_SIZE, backgroundColor: isLocked ? "#C8CDD1" : "#D9DEE2" }}
                  />
                ) : (
                  <img
                    src={imageUrl}
                    alt={`paso ${i + 1}`}
                    className="shrink-0 rounded-xl object-cover"
                    style={{ width: IMG_SIZE, height: IMG_SIZE }}
                  />
                );

                const textBlock = isLocked ? (
                  <div className="flex flex-1 flex-row items-start gap-2">
                    <div
                      className="flex shrink-0 items-center justify-center rounded-full"
                      style={{ width: NUM_SIZE, height: NUM_SIZE, backgroundColor: "#C8CDD1" }}
                    >
                      <span className="text-[7px] font-bold text-white">{i + 1}</span>
                    </div>
                    <p className="flex-1 text-[12px] leading-snug text-slate-400 italic">
                      Deposita en el contenedor correcto
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-1 flex-row items-start gap-2">
                    <div
                      className="flex shrink-0 items-center justify-center rounded-full"
                      style={{ width: NUM_SIZE, height: NUM_SIZE, backgroundColor: "#43DF8B" }}
                    >
                      <span className="text-[7px] font-bold text-white">{i + 1}</span>
                    </div>
                    <p className="flex-1 text-[12px] leading-snug line-clamp-4" style={{ color: "#0E1114" }}>
                      {(step as InstructionStep | LocalStep).text || (
                        <span className="italic text-slate-400">Paso {i + 1}</span>
                      )}
                    </p>
                  </div>
                );

                return (
                  <div key={(step as InstructionStep | LocalStep | null)?.id ?? "__bin__"} className="flex flex-row items-center gap-2">
                    {imageFirst ? imageBlock : textBlock}
                    {imageFirst ? textBlock : imageBlock}
                  </div>
                );
              })}

              {steps.length === 0 && (
                <p className="py-2 text-center text-[10px] italic text-slate-400">Sin pasos aún</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t px-4 py-3" style={{ borderColor: "#D9DEE2" }}>
          <div className="mb-2 flex items-center gap-2">
            <div className="h-4 w-4 rounded-sm border-2" style={{ borderColor: "#43DF8B" }} />
            <p className="text-[11px]" style={{ color: "#6B757D" }}>Seguir mostrando instrucciones</p>
          </div>
          <div
            className="w-full rounded-full py-3 text-center text-[12px] font-semibold text-white"
            style={{ backgroundColor: "#43DF8B" }}
          >
            Confirmar finalización
          </div>
        </div>

        {/* Home indicator */}
        <div className="flex justify-center bg-white pb-2 pt-1">
          <div className="h-1 w-16 rounded-full bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

// ─── Preview rail (independent fetch) ────────────────────────────────────────

export function InstructionPreviewRail({
  instruction,
  wasteTypeName,
}: {
  instruction: Instruction;
  wasteTypeName?: string;
}) {
  const { session } = useUser();

  const { data: steps = [], isLoading } = useQuery({
    queryKey: ["admin-instruction-steps", instruction.id],
    queryFn: () => getInstructionSteps(instruction.id),
    enabled: !!session,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const orderedSteps = useMemo(() => {
    const active = steps.filter((s) => s.isActive);
    const savedOrder = parseStepOrder(instruction);
    if (savedOrder.length === 0) {
      return [...active].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    const byId = new Map(active.map((s) => [s.id, s]));
    const sorted: InstructionStep[] = [];
    for (const id of savedOrder) {
      const s = byId.get(id);
      if (s) sorted.push(s);
    }
    for (const s of active) {
      if (!savedOrder.includes(s.id)) sorted.push(s);
    }
    return sorted;
  }, [instruction, steps]);

  return (
    <div className="flex h-full flex-col items-center justify-center rounded-[28px] border border-slate-200 bg-linear-to-b from-slate-50 via-white to-white px-5 py-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <div className="mb-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Vista previa</p>
      </div>
      {isLoading ? (
        <Skeleton className="rounded-[36px]" style={{ width: 320, height: 640 }} />
      ) : (
        <div className="flex justify-center">
          <MobilePreview steps={orderedSteps} wasteTypeName={wasteTypeName} />
        </div>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function InstructionStepsSection({
  instruction,
}: InstructionStepsSectionProps) {
  const { session } = useUser();
  const queryClient = useQueryClient();
  const queryKey = ["admin-instruction-steps", instruction.id];

  const [newStepText, setNewStepText] = useState("");
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [localSteps, setLocalSteps] = useState<LocalStep[]>([]);
  const seededRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const { data: serverSteps = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getInstructionSteps(instruction.id),
    enabled: !!session,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  function buildOrderedLocal(steps: InstructionStep[], inst: Instruction): LocalStep[] {
    const active = steps.filter((s) => s.isActive);
    const savedOrder = parseStepOrder(inst);
    let ordered: InstructionStep[];
    if (savedOrder.length > 0) {
      const byId = new Map(active.map((s) => [s.id, s]));
      ordered = [];
      for (const id of savedOrder) {
        const s = byId.get(id);
        if (s) ordered.push(s);
      }
      for (const s of active) {
        if (!savedOrder.includes(s.id)) ordered.push(s);
      }
    } else {
      ordered = [...active].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    return ordered.map(toLocalStep);
  }

  // Seed local state once after initial fetch
  useEffect(() => {
    if (seededRef.current || serverSteps.length === 0) return;
    seededRef.current = true;
    setLocalSteps(buildOrderedLocal(serverSteps, instruction));
  }, [serverSteps, instruction]);

  // Reset when instruction changes (different waste type selected)
  const prevInstructionId = useRef(instruction.id);
  useEffect(() => {
    if (prevInstructionId.current === instruction.id) return;
    prevInstructionId.current = instruction.id;
    seededRef.current = false;
    setLocalSteps([]);
    setEditingStepId(null);
    setNewStepText("");
  }, [instruction.id]);

  const visibleSteps = localSteps.filter((s) => !s.isDeleted);

  const isDirty = useMemo(() => {
    if (localSteps.some((s) => s.isNew || s.isDeleted || s.isDirty || s.pendingImageFile)) return true;
    // Order changed vs saved order
    const savedOrder = parseStepOrder(instruction);
    const serverActive = serverSteps.filter((s) => s.isActive);
    const referenceIds = savedOrder.length > 0
      ? savedOrder
      : serverActive.map((s) => s.id);
    const visIds = visibleSteps.map((s) => s.id);
    if (visIds.length !== referenceIds.length) return true;
    return visIds.some((id, i) => id !== referenceIds[i]);
  }, [localSteps, visibleSteps, serverSteps, instruction]);

  // ── Local mutations ─────────────────────────────────────────────────────────

  function handleAddStep() {
    const text = newStepText.trim();
    if (!text || visibleSteps.length >= MAX_STEPS) return;
    setLocalSteps((prev) => [
      ...prev,
      { id: makeTempId(), text, imageUrl: null, isNew: true, isDeleted: false, isDirty: false },
    ]);
    setNewStepText("");
  }

  function handleEditSave() {
    if (!editingStepId) return;
    const trimmed = editText.trim();
    if (!trimmed) return;
    setLocalSteps((prev) =>
      prev.map((s) =>
        s.id === editingStepId
          ? { ...s, text: trimmed, isDirty: s.isNew ? s.isDirty : true }
          : s,
      ),
    );
    setEditingStepId(null);
  }

  function handleDelete(id: string) {
    setLocalSteps((prev) => prev.map((s) => s.id === id ? { ...s, isDeleted: true } : s));
    if (editingStepId === id) setEditingStepId(null);
  }

  function handleUploadImage(id: string, file: File) {
    const preview = URL.createObjectURL(file);
    setLocalSteps((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, pendingImageFile: file, pendingImagePreview: preview, isDirty: s.isNew ? s.isDirty : true }
          : s,
      ),
    );
  }

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLocalSteps((prev) => {
      const vis = prev.filter((s) => !s.isDeleted);
      const del = prev.filter((s) => s.isDeleted);
      const oldIndex = vis.findIndex((s) => s.id === active.id);
      const newIndex = vis.findIndex((s) => s.id === over.id);
      return [...arrayMove(vis, oldIndex, newIndex), ...del];
    });
  }, []);

  // ── Save ────────────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: async () => {

      // 1. Upload pending images (against step id — temp or real)
      const withImages: LocalStep[] = await Promise.all(
        localSteps.map(async (s) => {
          if (!s.pendingImageFile) return s;
          const url = await uploadInstructionStepImage(s.id, s.pendingImageFile);
          return { ...s, imageUrl: url, pendingImageFile: undefined, pendingImagePreview: undefined };
        }),
      );

      // 2. Soft-delete removed existing steps
      await Promise.all(
        withImages
          .filter((s) => s.isDeleted && !s.isNew)
          .map((s) => deactivateInstructionStep(s.id)),
      );

      // 3. Create new steps; map temp id → real id
      const createdIds = new Map<string, string>();
      await Promise.all(
        withImages
          .filter((s) => s.isNew && !s.isDeleted)
          .map(async (s) => {
            const created: InstructionStep = await createInstructionStep({
              instructionId: instruction.id,
              text: s.text,
            });
            createdIds.set(s.id, created.id);
            // Attach image if one was uploaded (url was stored against temp id path)
            if (s.imageUrl) {
              await updateInstructionStep(created.id, { imageUrl: s.imageUrl });
            }
          }),
      );

      // 4. Update dirty existing steps
      await Promise.all(
        withImages
          .filter((s) => !s.isNew && !s.isDeleted && s.isDirty)
          .map((s) => updateInstructionStep(s.id, { text: s.text, imageUrl: s.imageUrl })),
      );

      // 5. Save order (resolve real ids for new steps)
      const finalOrder = withImages
        .filter((s) => !s.isDeleted)
        .map((s) => createdIds.get(s.id) ?? s.id);
      await updateInstruction(instruction.id, { body: encodeStepOrder(finalOrder) });
    },
    onSuccess: async () => {
      toast.success("Pasos guardados");
      seededRef.current = false;
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: () => toast.error("Error al guardar los pasos"),
  });

  function handleDiscard() {
    seededRef.current = true;
    setLocalSteps(buildOrderedLocal(serverSteps, instruction));
    setEditingStepId(null);
    setNewStepText("");
  }

  const atMax = visibleSteps.length >= MAX_STEPS;

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#0b2f4e]">
            Pasos ({visibleSteps.length}/{MAX_STEPS})
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">Arrastra para reordenar.</p>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!!error && <p className="text-sm text-red-600">No se pudieron cargar los pasos.</p>}

      {!isLoading && !error && (
        <>
          {visibleSteps.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Sin pasos aún. Agrega uno abajo.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={visibleSteps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <ol className="space-y-2">
                  {visibleSteps.map((step, i) => (
                    <SortableStepRow
                      key={step.id}
                      step={step}
                      index={i}
                      isEditing={editingStepId === step.id}
                      editText={editText}
                      onEditStart={() => { setEditingStepId(step.id); setEditText(step.text); }}
                      onEditChange={setEditText}
                      onEditSave={handleEditSave}
                      onEditCancel={() => setEditingStepId(null)}
                      onDelete={() => handleDelete(step.id)}
                      onUploadImage={(file) => handleUploadImage(step.id, file)}
                    />
                  ))}
                </ol>
              </SortableContext>
            </DndContext>
          )}

          {atMax ? (
            <p className="mt-3 text-xs text-amber-600">Máximo {MAX_STEPS} pasos por instrucción.</p>
          ) : (
            <div className="mt-4 flex items-center gap-2">
              <Input
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                placeholder="Texto del nuevo paso…"
                disabled={saveMutation.isPending}
                className="h-9 flex-1 border-slate-200 bg-white text-sm"
                onKeyDown={(e) => { if (e.key === "Enter" && newStepText.trim().length > 0) handleAddStep(); }}
              />
              <Button
                type="button"
                className="h-9 shrink-0 bg-[#18b566] px-3 text-sm font-semibold text-white hover:bg-[#129a56]"
                disabled={newStepText.trim().length === 0 || saveMutation.isPending}
                onClick={handleAddStep}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Save / Discard */}
          <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={!isDirty || saveMutation.isPending}
              onClick={handleDiscard}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40"
            >
              <Undo2 className="h-3 w-3" />
              Descartar
            </button>
            <button
              type="button"
              disabled={!isDirty || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#18b566] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#129a56] disabled:opacity-40"
            >
              <Save className="h-3 w-3" />
              {saveMutation.isPending ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
