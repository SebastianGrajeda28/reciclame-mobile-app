import { buildBackendUrl } from "@/lib/backend-url";

export type Instruction = {
  id: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  wasteTypeId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type StepOrderBody = { stepOrder: string[] };

export type InstructionPayload = {
  title?: string;
  wasteTypeId?: string | null;
  body?: string | null;
};

export function parseStepOrder(instruction: Instruction): string[] {
  if (!instruction.body) return [];
  try {
    const parsed = JSON.parse(instruction.body) as StepOrderBody;
    return Array.isArray(parsed.stepOrder) ? parsed.stepOrder : [];
  } catch {
    return [];
  }
}

export function encodeStepOrder(ids: string[]): string {
  return JSON.stringify({ stepOrder: ids } satisfies StepOrderBody);
}

export async function getInstructions(accessToken: string): Promise<Instruction[]> {
  const res = await fetch(buildBackendUrl("/api/instructions?includeInactive=true"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Error instrucciones ${res.status}`);
  return res.json();
}

export async function createInstruction(accessToken: string, values: InstructionPayload) {
  const res = await fetch(buildBackendUrl("/api/instructions"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!res.ok) throw new Error(`Error crear instruccion ${res.status}`);
  return res.json();
}

export async function updateInstruction(accessToken: string, id: string, values: InstructionPayload) {
  const res = await fetch(buildBackendUrl(`/api/instructions/${id}`), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!res.ok) throw new Error(`Error actualizar instruccion ${res.status}`);
  return res.json();
}

export async function deactivateInstruction(accessToken: string, id: string) {
  const res = await fetch(buildBackendUrl(`/api/instructions/${id}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Error desactivar instruccion ${res.status}`);
  return res.json();
}

export async function restoreInstruction(accessToken: string, id: string) {
  const res = await fetch(buildBackendUrl(`/api/instructions/${id}/restore`), {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Error restaurar instruccion ${res.status}`);
  return res.json();
}
