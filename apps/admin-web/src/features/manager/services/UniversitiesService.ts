import { supabase } from "@/lib/supabase";

export type University = {
  id: string;
  name: string;
};

export async function getUniversities(): Promise<University[]> {
  const { data, error } = await supabase
    .from("universities")
    .select("id,name")
    .eq("is_active", true)
    .order("name");

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({ id: r.id, name: r.name }));
}
