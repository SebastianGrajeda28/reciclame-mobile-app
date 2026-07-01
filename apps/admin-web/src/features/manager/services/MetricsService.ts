import { supabase } from "@/lib/supabase";
import { ADMIN_RPCS } from "@reciclame/shared-domain";

export type DashboardResponse = {
  filters: {
    start: string;
    end: string;
    universityId: string | null;
  };
  kpis: {
    totalRecyclings: number;
    totalKg: number;
    activeUsersInPeriod: number;
    newUsersInPeriod: number;
    confirmationRate: number;
  };
  funnel: Array<{
    label: string;
    value: number;
  }>;
  topResidues: Array<{
    name: string;
    confirmed: number;
  }>;
  recognitionQuality: Array<{
    name: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  trend: Array<{
    label: string;
    value: number;
  }>;
  detailRows: Array<{
    residue: string;
    scans: number;
    confirmed: number;
    rate: number;
    kilograms: number;
  }>;
};

export async function fetchDashboard(
  start: string,
  end: string,
  universityId?: string | null
): Promise<DashboardResponse> {
  const { data, error } = await supabase.rpc(ADMIN_RPCS.dashboard, {
    p_start: start,
    p_end: end,
    p_university_id: universityId ?? null,
  });
  console.log("RPC dashboard response:", { data, error });
  if (error) {
    throw new Error(error.message || "No se pudo cargar el dashboard");
  }

  if (!data) {
    throw new Error("La RPC del dashboard no devolvió datos");
  }

  return data as DashboardResponse;
}