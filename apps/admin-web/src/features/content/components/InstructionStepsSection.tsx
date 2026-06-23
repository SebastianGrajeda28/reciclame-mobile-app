import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Eraser, GripVertical, ImagePlus, Plus, Save, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadBinTypeImage, uploadInstructionStepImage } from "@/features/admin/services/AdminStorageService";
import {
  encodeSteps,
  parseSteps,
  updateInstruction,
  type Instruction,
  type InstructionStep,
} from "../services/InstructionsService";
import { updateBinType, type BinType } from "../services/BinTypesService";

const MAX_STEPS = 3;

// ─── Local step type ─────────────────────────────────────────────────────────

type LocalStep = InstructionStep & {
  pendingImageFile?: File;
  pendingImagePreview?: string;
  isNew: boolean;
  isDeleted: boolean;
  isDirty: boolean;
};

function makeTempId() {
  return `new-${crypto.randomUUID()}`;
}

function toLocalStep(step: InstructionStep): LocalStep {
  return { ...step, isNew: false, isDeleted: false, isDirty: false };
}

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
  onClear,
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
  onClear: () => void;
  onUploadImage: (file: File) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });
  const cancellingRef = useRef(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const previewSrc = step.pendingImagePreview ?? step.imageUrl;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg px-3 py-2.5 transition-colors ${
        isEditing
          ? "border border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-200"
          : "bg-slate-50/60"
      }`}
    >
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

      <label className="group shrink-0 cursor-pointer" title={previewSrc ? "Cambiar imagen" : "Subir imagen"}>
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
          <span className="relative flex h-14 w-14 shrink-0">
            <img src={previewSrc} alt="paso" className="h-14 w-14 rounded-lg object-cover ring-1 ring-slate-200 transition group-hover:ring-emerald-400" />
            <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition group-hover:bg-black/40">
              <ImagePlus className="h-5 w-5 text-white opacity-0 transition group-hover:opacity-100" />
            </span>
          </span>
        ) : (
          <span className="flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-emerald-400 hover:text-emerald-500 transition">
            <ImagePlus className="h-5 w-5" />
            <span className="text-[9px] font-medium">imagen</span>
          </span>
        )}
      </label>

      {isEditing ? (
        <input
          value={editText}
          onChange={(e) => onEditChange(e.target.value)}
          placeholder="Texto del paso…"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 leading-snug outline-none placeholder:text-slate-400"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") { cancellingRef.current = false; onEditSave(); }
            if (e.key === "Escape") { cancellingRef.current = true; onEditCancel(); }
          }}
          onBlur={() => { if (!cancellingRef.current) onEditSave(); cancellingRef.current = false; }}
        />
      ) : (
        <span
          className="min-w-0 flex-1 cursor-text text-sm text-slate-700 leading-snug select-none"
          onDoubleClick={onEditStart}
          title="Doble clic para editar"
        >
          {step.text}
        </span>
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="h-7 shrink-0 gap-1 px-2 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      >
        <Eraser className="h-3 w-3" />
        Limpiar
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="h-7 shrink-0 gap-1 px-2 text-xs text-red-400 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-3 w-3" />
        Eliminar
      </Button>
    </li>
  );
}

// ─── Mobile preview ──────────────────────────────────────────────────────────

const SCALE = 0.62;
const IMG_SIZE = Math.round(150 * SCALE);
const NUM_SIZE = Math.round(32 * SCALE);

type DepositStep = { text: string; imageUrl?: string | null };

export function MobilePreview({
  steps,
  wasteTypeName,
  depositStep,
}: {
  steps: (InstructionStep | LocalStep)[];
  wasteTypeName?: string;
  depositStep?: DepositStep;
}) {
  const finalDeposit: DepositStep = depositStep ?? { text: "Deposita en el contenedor correcto" };
  const allSteps = [...steps, null] as ((InstructionStep | LocalStep) | null)[];

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
          <div className="shrink-0 px-4 pb-3 pt-1">
            <span
              className="inline-block rounded-full border px-3 py-1 text-[11px] font-medium"
              style={{ borderColor: "#43DF8B", color: "#43DF8B" }}
            >
              {wasteTypeName ?? "Residuo"} · Contenedor
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2">
            <div className="flex flex-col gap-4">
              {allSteps.map((step, i) => {
                const isLocked = step === null;
                const imageFirst = i % 2 === 0;
                const imageUrl = isLocked
                  ? null
                  : (step as LocalStep).pendingImagePreview ?? step.imageUrl;

                const lockedImageUrl = isLocked ? (finalDeposit.imageUrl ?? null) : null;
                const displayImageUrl = isLocked ? lockedImageUrl : imageUrl;

                const imageBlock = !displayImageUrl ? (
                  <div
                    className="shrink-0 rounded-xl"
                    style={{ width: IMG_SIZE, height: IMG_SIZE, backgroundColor: isLocked ? "#C8CDD1" : "#D9DEE2" }}
                  />
                ) : (
                  <img
                    src={displayImageUrl}
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
                      {finalDeposit.text}
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
                      {step.text || <span className="italic text-slate-400">Paso {i + 1}</span>}
                    </p>
                  </div>
                );

                return (
                  <div key={step?.id ?? "__bin__"} className="flex flex-row items-center gap-2">
                    {imageFirst ? imageBlock : textBlock}
                    {imageFirst ? textBlock : imageBlock}
                  </div>
                );
              })}

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

        <div className="flex justify-center bg-white pb-2 pt-1">
          <div className="h-1 w-16 rounded-full bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

// ─── Preview rail ─────────────────────────────────────────────────────────────

export function InstructionPreviewRail({
  instruction,
  wasteTypeName,
  liveSteps,
  binType,
}: {
  instruction: Instruction;
  wasteTypeName?: string;
  liveSteps?: InstructionStep[];
  binType?: BinType | null;
}) {
  const steps = useMemo(
    () => liveSteps ?? parseSteps(instruction),
    [liveSteps, instruction],
  );

  const depositStep: DepositStep | undefined = binType
    ? { text: binType.depositInstruction ?? "Deposita en el contenedor correcto", imageUrl: binType.imageUrl }
    : undefined;

  return (
    <div className="flex h-full flex-col items-center justify-center rounded-[28px] border border-slate-200 bg-linear-to-b from-slate-50 via-white to-white px-5 py-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <div className="mb-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Vista previa</p>
      </div>
      <div className="flex justify-center">
        <MobilePreview steps={steps} wasteTypeName={wasteTypeName} depositStep={depositStep} />
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function InstructionStepsSection({
  instruction,
  binType,
  onStepsChange,
  onDepositChange,
}: {
  instruction: Instruction;
  binType?: BinType | null;
  onStepsChange?: (steps: InstructionStep[]) => void;
  onDepositChange?: (deposit: DepositStep) => void;
}) {
  const queryClient = useQueryClient();
  const queryKey = ["admin-instructions"];
  const binTypeQueryKey = ["admin-bin-types"];

  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [localSteps, setLocalSteps] = useState<LocalStep[]>([]);
  const seededRef = useRef(false);

  // Local bin type state for the deposit step
  const [depositText, setDepositText] = useState(binType?.depositInstruction ?? "Deposita en el contenedor correcto");
  const [depositImageFile, setDepositImageFile] = useState<File | undefined>();
  const [depositImagePreview, setDepositImagePreview] = useState<string | undefined>(binType?.imageUrl ?? undefined);
  const [isEditingDeposit, setIsEditingDeposit] = useState(false);
  const depositCancellingRef = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDepositText(binType?.depositInstruction ?? "Deposita en el contenedor correcto");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDepositImagePreview(binType?.imageUrl ?? undefined);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDepositImageFile(undefined);
  }, [binType?.id]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // Seed from instruction.body on mount or when instruction changes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    seededRef.current = true;
    setLocalSteps(parseSteps(instruction).map(toLocalStep));
    setEditingStepId(null);
  }, [instruction.id]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const visibleSteps = localSteps.filter((s) => !s.isDeleted);

  const onStepsChangeRef = useRef(onStepsChange);
  const onDepositChangeRef = useRef(onDepositChange);

  useLayoutEffect(() => {
    onStepsChangeRef.current = onStepsChange;
    onDepositChangeRef.current = onDepositChange;
  });

  useEffect(() => {
    const visible = localSteps.filter((s) => !s.isDeleted);
    onStepsChangeRef.current?.(visible.map(({ id, text, imageUrl, pendingImagePreview }) => ({
      id,
      text: editingStepId === id ? editText : text,
      imageUrl: pendingImagePreview ?? imageUrl,
    })));
  }, [localSteps, editingStepId, editText]);

  useEffect(() => {
    onDepositChangeRef.current?.({ text: depositText, imageUrl: depositImagePreview });
  }, [depositText, depositImagePreview]);

  const isDirty = useMemo(() => {
    if (localSteps.some((s) => s.isNew || s.isDeleted || s.isDirty || s.pendingImageFile)) return true;
    // Check order vs saved
    const saved = parseSteps(instruction).map((s) => s.id);
    const current = visibleSteps.map((s) => s.id);
    if (saved.length !== current.length) return true;
    return current.some((id, i) => id !== saved[i]);
  }, [localSteps, visibleSteps, instruction]);

  function handleAddStep() {
    if (visibleSteps.length >= MAX_STEPS) return;
    const newId = makeTempId();
    setLocalSteps((prev) => [
      ...prev,
      { id: newId, text: "", imageUrl: null, isNew: true, isDeleted: false, isDirty: false },
    ]);
    setEditingStepId(newId);
    setEditText("");
  }

  function handleEditSave() {
    if (!editingStepId) return;
    const trimmed = editText.trim();
    if (!trimmed) {
      // Discard new empty step on save with no text
      setLocalSteps((prev) => {
        const step = prev.find((s) => s.id === editingStepId);
        if (step?.isNew) return prev.filter((s) => s.id !== editingStepId);
        return prev;
      });
      setEditingStepId(null);
      return;
    }
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

  function handleClear(id: string) {
    setLocalSteps((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, text: "", imageUrl: null, pendingImageFile: undefined, pendingImagePreview: undefined, isDirty: s.isNew ? s.isDirty : true }
          : s,
      ),
    );
    setEditingStepId(id);
    setEditText("");
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

  const saveMutation = useMutation({
    mutationFn: async () => {
      // 1. Upload pending images
      const withImages: LocalStep[] = await Promise.all(
        localSteps.map(async (s) => {
          if (!s.pendingImageFile) return s;
          const url = await uploadInstructionStepImage(s.id, s.pendingImageFile);
          return { ...s, imageUrl: url, pendingImageFile: undefined, pendingImagePreview: undefined };
        }),
      );

      // 2. Build final steps array (visible only, stripped of local flags)
      const finalSteps = withImages
        .filter((s) => !s.isDeleted)
        .map(({ id, text, imageUrl }) => ({ id, text, imageUrl }));

      await updateInstruction(instruction.id, { body: encodeSteps(finalSteps) });
    },
    onSuccess: async () => {
      toast.success("Pasos guardados");
      seededRef.current = false;
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: () => toast.error("Error al guardar los pasos"),
  });

  const binTypeMutation = useMutation({
    mutationFn: async () => {
      if (!binType) return;
      let imageUrl = binType.imageUrl;
      if (depositImageFile) {
        imageUrl = await uploadBinTypeImage(binType.id, depositImageFile);
      }
      await updateBinType(binType.id, {
        imageUrl,
        depositInstruction: depositText.trim() || null,
      });
    },
    onSuccess: async () => {
      toast.success("Paso de depósito guardado");
      setDepositImageFile(undefined);
      await queryClient.invalidateQueries({ queryKey: binTypeQueryKey });
    },
    onError: () => toast.error("Error al guardar el paso de depósito"),
  });

  const isDepositDirty =
    !!depositImageFile ||
    depositText !== (binType?.depositInstruction ?? "Deposita en el contenedor correcto");

  function handleDiscard() {
    setLocalSteps(parseSteps(instruction).map(toLocalStep));
    setEditingStepId(null);
  }

  function handleDepositImageUpload(file: File) {
    setDepositImagePreview(URL.createObjectURL(file));
    setDepositImageFile(file);
  }

  const atMax = visibleSteps.length >= MAX_STEPS;

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#0b2f4e]">
            Pasos ({visibleSteps.length + 1}/{MAX_STEPS + 1})
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">Arrastra para reordenar.</p>
        </div>
      </div>

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
                  onEditCancel={() => {
                    // If new step was never given text, discard it entirely
                    if (step.isNew && !step.text) {
                      setLocalSteps((prev) => prev.filter((s) => s.id !== step.id));
                    }
                    setEditingStepId(null);
                  }}
                  onDelete={() => handleDelete(step.id)}
                  onClear={() => handleClear(step.id)}
                  onUploadImage={(file) => handleUploadImage(step.id, file)}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}

      {atMax ? (
        <p className="mt-3 text-xs text-amber-600">Máximo {MAX_STEPS} pasos editables (+ el paso de depósito).</p>
      ) : (
        <div className="mt-3 flex justify-start">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saveMutation.isPending}
            onClick={handleAddStep}
            className="h-7 gap-1 px-2 text-xs text-slate-500"
          >
            <Plus className="h-3 w-3" />
            Agregar paso
          </Button>
        </div>
      )}

      {/* ── Deposit step (special, permanent) ───────────────────────── */}
      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2.5">
        <div className="flex items-center gap-2">
          {/* Grip placeholder — same width as grip button to keep columns aligned */}
          <span className="shrink-0 w-4" />

          {/* Step number — always visibleSteps.length + 1 */}
          <span className="shrink-0 w-5 text-xs font-semibold text-amber-400">{visibleSteps.length + 1}.</span>

          {/* Bin image upload */}
          <label className="group shrink-0 cursor-pointer" title={depositImagePreview ? "Cambiar imagen del tacho" : "Subir imagen del tacho"}>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleDepositImageUpload(file);
                e.target.value = "";
              }}
            />
            {depositImagePreview ? (
              <span className="relative flex h-14 w-14 shrink-0">
                <img src={depositImagePreview} alt="tacho" className="h-14 w-14 rounded-lg object-cover ring-1 ring-amber-200 transition group-hover:ring-amber-400" />
                <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition group-hover:bg-black/40">
                  <ImagePlus className="h-5 w-5 text-white opacity-0 transition group-hover:opacity-100" />
                </span>
              </span>
            ) : (
              <span className="flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-amber-300 bg-amber-50 text-amber-400 hover:border-amber-400 hover:text-amber-500 transition">
                <ImagePlus className="h-5 w-5" />
                <span className="text-[9px] font-medium">tacho</span>
              </span>
            )}
          </label>

          {/* Deposit instruction text */}
          {isEditingDeposit ? (
            <input
              value={depositText}
              onChange={(e) => setDepositText(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 leading-snug outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") { depositCancellingRef.current = false; setIsEditingDeposit(false); }
                if (e.key === "Escape") { depositCancellingRef.current = true; setIsEditingDeposit(false); }
              }}
              onBlur={() => { if (!depositCancellingRef.current) setIsEditingDeposit(false); depositCancellingRef.current = false; }}
            />
          ) : (
            <span
              className="min-w-0 flex-1 cursor-text text-sm text-slate-700 leading-snug select-none"
              onDoubleClick={() => setIsEditingDeposit(true)}
              title="Doble clic para editar"
            >
              {depositText}
            </span>
          )}

          {/* Right side: save button or "sin tacho" + label */}
          {isDepositDirty && binType ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={binTypeMutation.isPending}
              onClick={() => binTypeMutation.mutate()}
              className="h-7 shrink-0 gap-1 px-2 text-xs text-amber-600 hover:bg-amber-100 hover:text-amber-700"
            >
              <Save className="h-3 w-3" />
              {binTypeMutation.isPending ? "Guardando…" : "Guardar"}
            </Button>
          ) : (
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">
                Paso final
              </span>
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-700">
                siempre visible
              </span>
            </div>
          )}
        </div>

        {!binType && (
          <p className="mt-1.5 pl-[calc(1rem+1.25rem+0.5rem)] text-[11px] text-slate-400 italic">Sin tacho asignado para este tipo de residuo</p>
        )}
      </div>

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
    </div>
  );
}
