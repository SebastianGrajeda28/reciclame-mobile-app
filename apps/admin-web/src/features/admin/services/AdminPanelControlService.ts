import { supabase } from "@/lib/supabase";
import { ADMIN_RPCS } from "@reciclame/shared-domain";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ControlPanelKpis = {
  activeUniversities: number;
  activeCampuses: number;
  activeEmployees: number;
  registeredUsers: number;
};

export type RecentUniversity = {
  id: string;
  name: string;
  isActive: boolean;
  lastModifiedAt: string;
};

export type RecentCampus = {
  id: string;
  name: string;
  universityName: string;
  isActive: boolean;
  lastModifiedAt: string;
};

export type RecentEmployee = {
  id: string;
  email: string;
  roleName: string;
  isActive: boolean;
  lastModifiedAt: string;
};

export type ControlPanelData = {
  kpis: ControlPanelKpis;
  recentActivityByType: {
    university: RecentUniversity[];
    campus: RecentCampus[];
    employee: RecentEmployee[];
  };
};

type GetControlPanelResponse = {
  kpis: {
    activeUniversities: number;
    activeCampuses: number;
    activeEmployees: number;
    registeredUsers: number;
  };
  recentActivityByType: {
    university: RecentUniversity[];
    campus: RecentCampus[];
    employee: RecentEmployee[];
  };
};

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export async function getControlPanel(): Promise<ControlPanelData> {
  const { data, error } = await supabase.rpc(ADMIN_RPCS.controlPanel);
  if (error) throw new Error(error.message);

  const response = data as GetControlPanelResponse;

  return {
    kpis: {
      activeUniversities: response.kpis.activeUniversities ?? 0,
      activeCampuses:     response.kpis.activeCampuses     ?? 0,
      activeEmployees:    response.kpis.activeEmployees     ?? 0,
      registeredUsers:    response.kpis.registeredUsers     ?? 0,
    },
    recentActivityByType: {
      university: response.recentActivityByType.university ?? [],
      campus:     response.recentActivityByType.campus     ?? [],
      employee:   response.recentActivityByType.employee   ?? [],
    },
  };
}