import { apiClient } from './apiClient';
import { FoodCourtItem } from '../types';

const STORAGE_KEY = 'sanctuary_food_court_items';

const INITIAL_FOOD_ITEMS: FoodCourtItem[] = [
  {
    id: 'food_001',
    churchId: 'church_elshaddai_central',
    name: 'Almuerzo Familiar: Pastel de Choclo Criollo',
    description: 'Tradicional pastel horneado de choclo con pino de vacuno, huevo duro y aceituna.',
    category: 'meals',
    price: 4500,
    shift: 'day',
    isAvailable: true,
    prepTimeMinutes: 15,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
    tags: ['Especial Domingo', 'Casero'],
  },
  {
    id: 'food_002',
    churchId: 'church_elshaddai_central',
    name: 'Café de Grano & Medialuna Artesanal',
    description: 'Café tostado recién pasado acompañado de medialuna tibia glaseada.',
    category: 'combos',
    price: 2200,
    shift: 'both',
    isAvailable: true,
    prepTimeMinutes: 5,
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop&q=80',
    tags: ['Refrigerio', 'Popular'],
  },
  {
    id: 'food_003',
    churchId: 'church_elshaddai_central',
    name: 'Empanada de Horno Pino Especial',
    description: 'Empanada horneada en masa de mantequilla con abundante carne picada a mano.',
    category: 'snacks',
    price: 2500,
    shift: 'both',
    isAvailable: true,
    prepTimeMinutes: 5,
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
    tags: ['Horneado'],
  },
  {
    id: 'food_004',
    churchId: 'church_elshaddai_central',
    name: 'Sopaipillas Pasadas con Chancaca & Canela',
    description: 'Porción de 3 sopaipillas bañadas en salsa tibia de chancaca, canela y cáscara de naranja.',
    category: 'snacks',
    price: 1800,
    shift: 'night',
    isAvailable: true,
    prepTimeMinutes: 10,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80',
    tags: ['Turno Noche', 'Reunión Jóvenes'],
  },
  {
    id: 'food_005',
    churchId: 'church_elshaddai_central',
    name: 'Jugo Natural Frutas de la Estación (500ml)',
    description: 'Zumo 100% natural de naranja, frutilla o piña sin azúcar añadida.',
    category: 'beverages',
    price: 1600,
    shift: 'day',
    isAvailable: false,
    prepTimeMinutes: 3,
    imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&auto=format&fit=crop&q=80',
    tags: ['Fruta Fresca'],
  },
  {
    id: 'food_006',
    churchId: 'church_elshaddai_central',
    name: 'Sándwich Ave Palta en Pan Amasado',
    description: 'Pechuga de pollo desmenuzada con palta fresca Hass en pan amasado caliente.',
    category: 'meals',
    price: 3200,
    shift: 'night',
    isAvailable: true,
    prepTimeMinutes: 8,
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop&q=80',
    tags: ['Turno Noche'],
  },
];

function getStoredItems(): FoodCourtItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse food court items storage', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FOOD_ITEMS));
  return INITIAL_FOOD_ITEMS;
}

function saveStoredItems(items: FoodCourtItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Failed to save food court items storage', e);
  }
}

export const foodCourtService = {
  /**
   * Get menu items filtered by shift or category
   */
  async getMenu(params?: {
    shift?: 'day' | 'night' | 'all';
    category?: string;
  }): Promise<FoodCourtItem[]> {
    try {
      const query = new URLSearchParams();
      if (params?.shift && params.shift !== 'all') query.set('shift', params.shift);
      if (params?.category) query.set('category', params.category);

      const endpoint = `/admin/food-court${query.toString() ? `?${query.toString()}` : ''}`;
      const res = await apiClient.get<{ items: FoodCourtItem[] }>(endpoint);
      if (res?.items) {
        saveStoredItems(res.items);
        return res.items;
      }
    } catch {
      console.log('[foodCourtService] Using local cache for food court menu');
    }

    let items = getStoredItems();
    if (params?.shift && params.shift !== 'all') {
      items = items.filter((i) => i.shift === params.shift || i.shift === 'both');
    }
    if (params?.category && params.category !== 'all') {
      items = items.filter((i) => i.category === params.category);
    }
    return items;
  },

  /**
   * Toggle item availability (Available vs Out of Stock)
   */
  async toggleAvailability(id: string, isAvailable: boolean): Promise<FoodCourtItem> {
    try {
      const res = await apiClient.patch<{ item: FoodCourtItem }>(
        `/admin/food-court/${id}/availability`,
        { isAvailable }
      );
      if (res?.item) {
        const stored = getStoredItems();
        saveStoredItems(stored.map((i) => (i.id === id ? res.item : i)));
        return res.item;
      }
    } catch {
      console.log('[foodCourtService] Updating availability locally');
    }

    const stored = getStoredItems();
    const target = stored.find((i) => i.id === id);
    if (!target) throw new Error(`Plato/Producto ${id} no encontrado`);

    const updated = { ...target, isAvailable };
    saveStoredItems(stored.map((i) => (i.id === id ? updated : i)));
    return updated;
  },

  /**
   * Update item details or price
   */
  async updateItem(id: string, updates: Partial<FoodCourtItem>): Promise<FoodCourtItem> {
    try {
      const res = await apiClient.put<{ item: FoodCourtItem }>(
        `/admin/food-court/${id}`,
        updates
      );
      if (res?.item) {
        const stored = getStoredItems();
        saveStoredItems(stored.map((i) => (i.id === id ? res.item : i)));
        return res.item;
      }
    } catch {
      console.log('[foodCourtService] Updating item locally');
    }

    const stored = getStoredItems();
    const target = stored.find((i) => i.id === id);
    if (!target) throw new Error(`Plato/Producto ${id} no encontrado`);

    const updated = { ...target, ...updates };
    saveStoredItems(stored.map((i) => (i.id === id ? updated : i)));
    return updated;
  },

  /**
   * Create new menu item
   */
  async createItem(itemData: Omit<FoodCourtItem, 'id'>): Promise<FoodCourtItem> {
    const newItem: FoodCourtItem = {
      ...itemData,
      id: `food_${Date.now()}`,
    };

    try {
      const res = await apiClient.post<{ item: FoodCourtItem }>(
        '/admin/food-court',
        itemData
      );
      if (res?.item) {
        const stored = getStoredItems();
        saveStoredItems([res.item, ...stored]);
        return res.item;
      }
    } catch {
      console.log('[foodCourtService] Created item locally');
    }

    const stored = getStoredItems();
    saveStoredItems([newItem, ...stored]);
    return newItem;
  },

  /**
   * Delete menu item
   */
  async deleteItem(id: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/food-court/${id}`);
    } catch {
      console.log('[foodCourtService] Deleted item locally');
    }

    const stored = getStoredItems();
    saveStoredItems(stored.filter((i) => i.id !== id));
  },
};
