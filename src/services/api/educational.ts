import { supabase } from '@/src/services/supabase/client';

export type EducationalContent = {
  id: string;
  category: string;
  title: string;
  description?: string;
  contentType: 'fact' | 'tip' | 'guide' | 'instruction';
  body: string;
  imageUrl?: string;
  wasteTypeId?: string;
};

export type EducationalCategory = {
  category: string;
  contentCount: number;
};

export type EducationalSyncResponse = {
  contentByCategory: Record<string, EducationalContent[]>;
  categories: EducationalCategory[];
};

/**
 * Fetches all educational content optimized for offline consumption.
 * Returns content grouped by category for efficient mobile sync.
 */
export async function getEducationalContentForSync(): Promise<EducationalSyncResponse> {
  const { data, error } = await supabase.rpc('get_educational_content_for_sync');

  if (error) {
    throw new Error(`Failed to fetch educational content: ${error.message}`);
  }

  if (!data || !Array.isArray(data)) {
    throw new Error('Invalid response from educational content sync');
  }

  // Group content by category
  const contentByCategory: Record<string, EducationalContent[]> = {};
  const categoriesSet = new Set<string>();

  for (const item of data) {
    const content: EducationalContent = {
      id: item.id,
      category: item.category,
      title: item.title,
      description: item.description,
      contentType: item.content_type,
      body: item.body,
      imageUrl: item.image_url,
      wasteTypeId: item.waste_type_id,
    };

    if (!contentByCategory[item.category]) {
      contentByCategory[item.category] = [];
    }
    contentByCategory[item.category].push(content);
    categoriesSet.add(item.category);
  }

  // Get category metadata
  const { data: categoriesData, error: categoriesError } = await supabase.rpc(
    'get_educational_categories'
  );

  if (categoriesError) {
    throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
  }

  const categories: EducationalCategory[] = (categoriesData || []).map((cat: any) => ({
    category: cat.category,
    contentCount: cat.content_count,
  }));

  return {
    contentByCategory,
    categories,
  };
}

/**
 * Fetches educational content for a specific category.
 * Useful for targeted content updates without full sync.
 */
export async function getEducationalContentByCategory(
  category: string
): Promise<EducationalContent[]> {
  if (!category || category.trim().length === 0) {
    throw new Error('Category must be a non-empty string');
  }

  const { data, error } = await supabase.rpc('get_educational_content_by_category', {
    p_category: category,
  });

  if (error) {
    throw new Error(`Failed to fetch content for category '${category}': ${error.message}`);
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    category: item.category,
    title: item.title,
    description: item.description,
    contentType: item.content_type,
    body: item.body,
    imageUrl: item.image_url,
    wasteTypeId: item.waste_type_id,
  }));
}

/**
 * Fetches all available educational content categories.
 * Useful for displaying category filters or navigation.
 */
export async function getEducationalCategories(): Promise<EducationalCategory[]> {
  const { data, error } = await supabase.rpc('get_educational_categories');

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((cat: any) => ({
    category: cat.category,
    contentCount: cat.content_count,
  }));
}
