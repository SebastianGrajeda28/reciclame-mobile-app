import { buildBackendUrl } from "@/lib/backend-url";

export type InstructionStep = {
  id: string;
  instructionId: string;
  text: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export async function getInstructionSteps(
  accessToken: string,
  instructionId: string,
): Promise<InstructionStep[]> {
  const res = await fetch(buildBackendUrl(`/api/instruction-steps?instructionId=${instructionId}`), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Error pasos ${res.status}`);
  return res.json();
}

export async function createInstructionStep(
  accessToken: string,
  values: { instructionId: string; text: string },
) {
  const res = await fetch(buildBackendUrl("/api/instruction-steps"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!res.ok) throw new Error(`Error crear paso ${res.status}`);
  return res.json();
}

export async function updateInstructionStep(accessToken: string, id: string, text: string) {
  const res = await fetch(buildBackendUrl(`/api/instruction-steps/${id}`), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error(`Error actualizar paso ${res.status}`);
  return res.json();
}

export async function deactivateInstructionStep(accessToken: string, id: string) {
  const res = await fetch(buildBackendUrl(`/api/instruction-steps/${id}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Error eliminar paso ${res.status}`);
  return res.json();
}
