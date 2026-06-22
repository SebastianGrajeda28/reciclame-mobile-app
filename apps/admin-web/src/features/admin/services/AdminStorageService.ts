import { supabase } from "@/lib/supabase";
import { STORAGE_BUCKETS } from "@reciclame/shared-domain";

async function uploadToStorage(bucket: string, key: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${key}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function uploadInstructionStepImage(key: string, file: File): Promise<string> {
  return uploadToStorage(STORAGE_BUCKETS.instructionStepImages, key, file);
}

export function uploadBinTypeImage(binTypeId: string, file: File): Promise<string> {
  return uploadToStorage(STORAGE_BUCKETS.binTypeImages, binTypeId, file);
}
