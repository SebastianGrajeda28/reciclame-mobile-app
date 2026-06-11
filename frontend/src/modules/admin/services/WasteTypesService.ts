export type WasteType = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

const base = import.meta.env.VITE_BACKEND_URL;

export async function getWasteTypes(accessToken: string): Promise<WasteType[]> {
  const res = await fetch(`${base}/api/waste-types`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Error tipos de residuo ${res.status}`);
  return res.json();
}
