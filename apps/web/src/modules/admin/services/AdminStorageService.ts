import { supabase } from "@/lib/supabase";
import { STORAGE_BUCKETS } from "@reciclame/shared-domain";

export async function uploadInstructionStepImage(key: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${key}.${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.instructionStepImages)
    .upload(path, file, { upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.instructionStepImages)
    .getPublicUrl(path);

  return data.publicUrl;
}