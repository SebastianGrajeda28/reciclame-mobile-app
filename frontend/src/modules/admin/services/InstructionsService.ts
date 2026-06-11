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

export type InstructionPayload = {
  title: string;
  wasteTypeId?: string | null;
};

export async function getInstructions(accessToken: string): Promise<Instruction[]> {
  const res = await fetch(buildBackendUrl("/api/instructions"), {
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

  if (!res.ok) throw new Error(`Error eliminar instruccion ${res.status}`);
  return res.json();
}
