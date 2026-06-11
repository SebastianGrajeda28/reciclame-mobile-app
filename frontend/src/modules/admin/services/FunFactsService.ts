import { buildBackendUrl } from "@/lib/backend-url";

export type FunFact = {
  id: string;
  text: string;
  wasteTypeId: string;
  isActive: boolean;
};

export type FunFactPayload = Pick<FunFact, "text" | "wasteTypeId">;

export async function getFunFacts(accessToken: string): Promise<FunFact[]> {
  const res = await fetch(buildBackendUrl("/api/fun-facts?includeInactive=true"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Error datos curiosos ${res.status}`);
  return res.json();
}

export async function createFunFact(accessToken: string, values: FunFactPayload) {
  const res = await fetch(buildBackendUrl("/api/fun-facts"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!res.ok) throw new Error(`Error crear dato curioso ${res.status}`);
  return res.json();
}

export async function updateFunFact(accessToken: string, id: string, values: FunFactPayload) {
  const res = await fetch(buildBackendUrl(`/api/fun-facts/${id}`), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!res.ok) throw new Error(`Error actualizar dato curioso ${res.status}`);
  return res.json();
}

export async function deactivateFunFact(accessToken: string, id: string) {
  const res = await fetch(buildBackendUrl(`/api/fun-facts/${id}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Error desactivar dato curioso ${res.status}`);
  return res.json();
}

export async function restoreFunFact(accessToken: string, id: string) {
  const res = await fetch(buildBackendUrl(`/api/fun-facts/${id}/restore`), {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Error restaurar dato curioso ${res.status}`);
  return res.json();
}
