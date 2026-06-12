import {
    EducationalCategory,
    EducationalContent,
    getEducationalCategories,
    getEducationalContentByCategory,
    getEducationalContentForSync,
} from '@/src/services/api/educational';

jest.mock('@/src/services/supabase/client', () => {
  return {
    supabase: {
      rpc: jest.fn(),
    },
  };
});

import { supabase } from '@/src/services/supabase/client';

const mockedRpc = supabase.rpc as jest.Mock;

describe('Educational Content Service', () => {
  beforeEach(() => {
    mockedRpc.mockReset();
  });

  describe('getEducationalContentForSync', () => {
    test('Debería retornar contenido agrupado por categoría para sincronización offline', async () => {
      const mockContent = [
        {
          id: '11111111-1111-1111-1111-000000000001',
          category: 'recycling_basics',
          title: 'Cómo reciclar papel',
          description: 'Guía básica',
          content_type: 'fact',
          body: 'El papel debe estar limpio antes de reciclar',
          image_url: 'https://example.com/paper.png',
          waste_type_id: '22222222-2222-2222-2222-000000000001',
        },
        {
          id: '11111111-1111-1111-1111-000000000002',
          category: 'recycling_basics',
          title: 'Beneficios del reciclaje',
          description: null,
          content_type: 'tip',
          body: 'El reciclaje reduce la contaminación',
          image_url: null,
          waste_type_id: null,
        },
        {
          id: '11111111-1111-1111-1111-000000000003',
          category: 'environmental_facts',
          title: 'Hecho ambiental',
          description: 'Datos ecológicos',
          content_type: 'fact',
          body: 'El 70% de los residuos puede reciclarse',
          image_url: null,
          waste_type_id: null,
        },
      ];

      const mockCategories = [
        { category: 'recycling_basics', content_count: 2 },
        { category: 'environmental_facts', content_count: 1 },
      ];

      mockedRpc.mockResolvedValueOnce({ data: mockContent, error: null });
      mockedRpc.mockResolvedValueOnce({ data: mockCategories, error: null });

      const result = await getEducationalContentForSync();

      expect(result.contentByCategory['recycling_basics']).toHaveLength(2);
      expect(result.contentByCategory['environmental_facts']).toHaveLength(1);
      expect(result.categories).toHaveLength(2);
      expect(result.categories[0]).toEqual({
        category: 'recycling_basics',
        contentCount: 2,
      });
    });

    test('Debería convertir camelCase correctamente los campos de respuesta', async () => {
      const mockContent = [
        {
          id: '11111111-1111-1111-1111-000000000001',
          category: 'tips',
          title: 'Test Tip',
          description: 'Description',
          content_type: 'tip',
          body: 'Body content',
          image_url: 'https://example.com/image.png',
          waste_type_id: '22222222-2222-2222-2222-000000000001',
        },
      ];

      mockedRpc.mockResolvedValueOnce({ data: mockContent, error: null });
      mockedRpc.mockResolvedValueOnce({ data: [], error: null });

      const result = await getEducationalContentForSync();

      const content = result.contentByCategory['tips'][0];
      expect(content.contentType).toBe('tip');
      expect(content.imageUrl).toBe('https://example.com/image.png');
      expect(content.wasteTypeId).toBe('22222222-2222-2222-2222-000000000001');
    });

    test('Debería manejar respuesta vacía correctamente', async () => {
      mockedRpc.mockResolvedValueOnce({ data: [], error: null });
      mockedRpc.mockResolvedValueOnce({ data: [], error: null });

      const result = await getEducationalContentForSync();

      expect(result.contentByCategory).toEqual({});
      expect(result.categories).toEqual([]);
    });

    test('Debería lanzar error si hay fallo de Supabase', async () => {
      mockedRpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(getEducationalContentForSync()).rejects.toThrow(
        'Failed to fetch educational content: Database error'
      );
    });

    test('Debería lanzar error si la respuesta no es un array', async () => {
      mockedRpc.mockResolvedValueOnce({ data: { not: 'array' }, error: null });

      await expect(getEducationalContentForSync()).rejects.toThrow(
        'Invalid response from educational content sync'
      );
    });
  });

  describe('getEducationalContentByCategory', () => {
    test('Debería retornar contenido de una categoría específica', async () => {
      const mockContent = [
        {
          id: '11111111-1111-1111-1111-000000000001',
          category: 'plastic_recycling',
          title: 'Plástico tipo 1',
          description: 'Botellas',
          content_type: 'guide',
          body: 'Las botellas de plástico PET pueden reciclarse',
          image_url: 'https://example.com/plastic.png',
          waste_type_id: '22222222-2222-2222-2222-000000000001',
        },
        {
          id: '11111111-1111-1111-1111-000000000002',
          category: 'plastic_recycling',
          title: 'Plástico tipo 2',
          description: 'Contenedores',
          content_type: 'guide',
          body: 'Los contenedores HDPE son reciclables',
          image_url: null,
          waste_type_id: null,
        },
      ];

      mockedRpc.mockResolvedValueOnce({ data: mockContent, error: null });

      const result = await getEducationalContentByCategory('plastic_recycling');

      expect(result).toHaveLength(2);
      expect(result[0].category).toBe('plastic_recycling');
      expect(result[0].contentType).toBe('guide');
    });

    test('Debería lanzar error si categoría está vacía', async () => {
      await expect(getEducationalContentByCategory('')).rejects.toThrow(
        'Category must be a non-empty string'
      );

      expect(mockedRpc).not.toHaveBeenCalled();
    });

    test('Debería lanzar error si categoría es solo espacios', async () => {
      await expect(getEducationalContentByCategory('   ')).rejects.toThrow(
        'Category must be a non-empty string'
      );

      expect(mockedRpc).not.toHaveBeenCalled();
    });

    test('Debería retornar array vacío si no hay contenido', async () => {
      mockedRpc.mockResolvedValueOnce({ data: [], error: null });

      const result = await getEducationalContentByCategory('non_existent_category');

      expect(result).toEqual([]);
    });

    test('Debería lanzar error si hay error de Supabase', async () => {
      mockedRpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'Category not found' },
      });

      await expect(getEducationalContentByCategory('test_category')).rejects.toThrow(
        "Failed to fetch content for category 'test_category': Category not found"
      );
    });

    test('Debería retornar array vacío si data no es array', async () => {
      mockedRpc.mockResolvedValueOnce({ data: { invalid: 'response' }, error: null });

      const result = await getEducationalContentByCategory('any_category');

      expect(result).toEqual([]);
    });
  });

  describe('getEducationalCategories', () => {
    test('Debería retornar lista de categorías con conteos', async () => {
      const mockCategories = [
        { category: 'recycling_basics', content_count: 5 },
        { category: 'environmental_facts', content_count: 3 },
        { category: 'plastic_recycling', content_count: 8 },
        { category: 'composting', content_count: 2 },
      ];

      mockedRpc.mockResolvedValueOnce({ data: mockCategories, error: null });

      const result = await getEducationalCategories();

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        category: 'recycling_basics',
        contentCount: 5,
      });
      expect(result[2]).toEqual({
        category: 'plastic_recycling',
        contentCount: 8,
      });
    });

    test('Debería retornar array vacío si no hay categorías', async () => {
      mockedRpc.mockResolvedValueOnce({ data: [], error: null });

      const result = await getEducationalCategories();

      expect(result).toEqual([]);
    });

    test('Debería lanzar error si hay error de Supabase', async () => {
      mockedRpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' },
      });

      await expect(getEducationalCategories()).rejects.toThrow(
        'Failed to fetch categories: Database connection failed'
      );
    });

    test('Debería retornar array vacío si data no es array', async () => {
      mockedRpc.mockResolvedValueOnce({ data: { invalid: 'response' }, error: null });

      const result = await getEducationalCategories();

      expect(result).toEqual([]);
    });
  });

  describe('Type definitions', () => {
    test('EducationalContent debe tener propiedades requeridas', () => {
      const content: EducationalContent = {
        id: '11111111-1111-1111-1111-000000000001',
        category: 'test',
        title: 'Test Title',
        contentType: 'fact',
        body: 'Test body',
      };

      expect(content.id).toBeDefined();
      expect(content.category).toBeDefined();
      expect(content.title).toBeDefined();
      expect(content.contentType).toBeDefined();
      expect(content.body).toBeDefined();
    });

    test('EducationalCategory debe tener propiedades correctas', () => {
      const category: EducationalCategory = {
        category: 'test_category',
        contentCount: 5,
      };

      expect(category.category).toBe('test_category');
      expect(category.contentCount).toBe(5);
    });
  });
});
