import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Sun,
  Moon,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Coffee,
  Tag,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { foodCourtService } from '../../services/food_court.service';
import { FoodCourtItem } from '../../types';
import { useAuth } from '../auth/context/AuthContext';

interface FoodCourtAdminViewProps {
  onToast?: (message: string) => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
}

export const FoodCourtAdminView: React.FC<FoodCourtAdminViewProps> = ({
  onToast,
  currentTheme = 'light',
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<FoodCourtItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeShift, setActiveShift] = useState<'all' | 'day' | 'night'>('all');
  const [activeCategory, setActiveCategory] = useState<'all' | 'meals' | 'beverages' | 'snacks' | 'combos'>('all');

  // Modal create/edit item state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodCourtItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'meals' as 'meals' | 'beverages' | 'snacks' | 'combos',
    price: 3000,
    shift: 'both' as 'day' | 'night' | 'both',
    isAvailable: true,
    prepTimeMinutes: 10,
    imageUrl: '',
    tags: '',
  });

  const loadMenu = async () => {
    setLoading(true);
    try {
      const data = await foodCourtService.getMenu({
        shift: activeShift,
        category: activeCategory,
      });
      setItems(data);
    } catch {
      onToast?.('Error al cargar menú de cafetería');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [activeShift, activeCategory]);

  const handleToggleAvailability = async (item: FoodCourtItem) => {
    try {
      const updated = await foodCourtService.toggleAvailability(item.id, !item.isAvailable);
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      onToast?.(`"${item.name}" marcado como ${!item.isAvailable ? 'Disponible' : 'Agotado'}`);
    } catch {
      onToast?.('Error al cambiar disponibilidad');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      category: 'meals',
      price: 3000,
      shift: 'both',
      isAvailable: true,
      prepTimeMinutes: 10,
      imageUrl: '',
      tags: 'Comunión',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: FoodCourtItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      shift: item.shift,
      isAvailable: item.isAvailable,
      prepTimeMinutes: item.prepTimeMinutes || 10,
      imageUrl: item.imageUrl || '',
      tags: (item.tags || []).join(', '),
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      onToast?.('Ingresa el nombre del producto');
      return;
    }

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (editingItem) {
        await foodCourtService.updateItem(editingItem.id, {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: Number(formData.price),
          shift: formData.shift,
          isAvailable: formData.isAvailable,
          prepTimeMinutes: Number(formData.prepTimeMinutes),
          imageUrl: formData.imageUrl || undefined,
          tags: tagsArray,
        });
        onToast?.(`"${formData.name}" actualizado correctamente`);
      } else {
        await foodCourtService.createItem({
          churchId: user?.churchId || 'church_elshaddai_central',
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: Number(formData.price),
          shift: formData.shift,
          isAvailable: formData.isAvailable,
          prepTimeMinutes: Number(formData.prepTimeMinutes),
          imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
          tags: tagsArray,
        });
        onToast?.(`"${formData.name}" agregado a la carta`);
      }
      setIsModalOpen(false);
      loadMenu();
    } catch {
      onToast?.('Error al guardar producto');
    }
  };

  const handleDeleteItem = async (item: FoodCourtItem) => {
    if (!confirm(`¿Seguro que deseas eliminar "${item.name}" del menú?`)) return;
    try {
      await foodCourtService.deleteItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      onToast?.(`"${item.name}" eliminado del menú`);
    } catch {
      onToast?.('Error al eliminar producto');
    }
  };

  const availableCount = items.filter((i) => i.isAvailable).length;
  const outOfStockCount = items.filter((i) => !i.isAvailable).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121318] p-6 rounded-3xl border border-[#002147]/10 dark:border-white/10 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#F47B20]/10 text-[#F47B20] dark:text-[#FED65B] border border-[#F47B20]/20 mb-2">
            <Utensils className="w-3.5 h-3.5" />
            Control de Cafetería & Kiosko Eclesiástico (MVP 2)
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif text-[#002147] dark:text-white flex items-center gap-3">
            <Coffee className="w-7 h-7 text-[#F47B20]" />
            Menú & Precios de Cafetería
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configura turnos Día (Cultos diurnos) y Noche (Reuniones de jóvenes/vigilias), actualiza disponibilidad y precios al instante.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadMenu}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Recargar menú"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F47B20] hover:bg-[#D96815] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer border border-[#FED65B]/40"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ Nuevo Plato / Producto</span>
          </button>
        </div>
      </div>

      {/* Shift Switcher & Summary Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveShift('day')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            activeShift === 'day'
              ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 shadow-sm'
              : 'bg-white dark:bg-[#121318] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <div>
            <span className="text-xs uppercase font-bold tracking-wider opacity-75 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              Turno Día (Almuerzo & Merienda)
            </span>
            <div className="text-sm font-semibold mt-1">Culto Dominical Diurno</div>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            ☀️ Día
          </span>
        </button>

        <button
          onClick={() => setActiveShift('night')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            activeShift === 'night'
              ? 'bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm'
              : 'bg-white dark:bg-[#121318] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <div>
            <span className="text-xs uppercase font-bold tracking-wider opacity-75 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-400" />
              Turno Noche (Cena & Jóvenes)
            </span>
            <div className="text-sm font-semibold mt-1">Reunión de Jóvenes & Vigilias</div>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
            🌙 Noche
          </span>
        </button>

        <button
          onClick={() => setActiveShift('all')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            activeShift === 'all'
              ? 'bg-[#002147]/10 border-[#002147] text-[#002147] dark:text-[#FED65B] shadow-sm'
              : 'bg-white dark:bg-[#121318] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <div>
            <span className="text-xs uppercase font-bold tracking-wider opacity-75">
              Inventario Total de Cafetería
            </span>
            <div className="text-sm font-semibold mt-1">
              {availableCount} Disponibles &bull; {outOfStockCount} Agotados
            </div>
          </div>
          <Layers className="w-5 h-5 opacity-60" />
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Todas las Categorías' },
          { id: 'meals', label: '🍲 Platos & Almuerzos' },
          { id: 'beverages', label: '☕ Café & Bebidas' },
          { id: 'snacks', label: '🥐 Sándwiches & Snacks' },
          { id: 'combos', label: '⭐ Combos Especiales' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-[#002147] text-white shadow-sm'
                : 'bg-white dark:bg-[#121318] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Menu Item Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#F47B20]" />
          <p className="text-sm">Cargando carta de cafetería...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-[#121318] p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Coffee className="w-8 h-8 mx-auto text-slate-400" />
          <h3 className="text-lg font-bold text-[#002147] dark:text-white">Sin productos en esta categoría</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Puedes agregar nuevos ítems utilizando el botón superior "+ Nuevo Plato / Producto".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-[#121318] rounded-3xl border ${
                item.isAvailable
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-rose-300 dark:border-rose-950/60 opacity-80'
              } overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
            >
              {/* Image & Badges */}
              <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Utensils className="w-10 h-10 opacity-40" />
                  </div>
                )}

                {/* Shift Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-black/60 text-white shadow-sm flex items-center gap-1">
                    {item.shift === 'day' && <Sun className="w-3 h-3 text-amber-400" />}
                    {item.shift === 'night' && <Moon className="w-3 h-3 text-indigo-300" />}
                    {item.shift === 'both' && '☀️ Día & 🌙 Noche'}
                    {item.shift === 'day' ? 'Día' : item.shift === 'night' ? 'Noche' : ''}
                  </span>
                </div>

                {/* Availability Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                      item.isAvailable
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {item.isAvailable ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {item.isAvailable ? 'Disponible' : 'Agotado'}
                  </span>
                </div>

                {/* Price Pill */}
                <div className="absolute bottom-3 right-3 bg-[#002147]/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-sm font-bold shadow-md border border-[#D4AF37]/50">
                  ${item.price.toLocaleString('es-CL')} CLP
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#F47B20]">
                    <Tag className="w-3 h-3" />
                    <span className="uppercase tracking-wider">
                      {item.category === 'meals'
                        ? 'Plato Principal'
                        : item.category === 'beverages'
                        ? 'Bebida'
                        : item.category === 'combos'
                        ? 'Combo'
                        : 'Snack'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#002147] dark:text-white leading-tight">
                    {item.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Tags and Prep Time */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Prep: ~{item.prepTimeMinutes || 5} min</span>
                  </div>

                  <div className="flex gap-1">
                    {(item.tags || []).slice(0, 2).map((tg, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400"
                      >
                        {tg}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex items-center justify-between pt-3 gap-2 border-t border-slate-100 dark:border-slate-800">
                  {/* Availability Toggle Switch */}
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      item.isAvailable
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}
                  >
                    {item.isAvailable ? (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Marcar Agotado</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Reactivar Stock</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 rounded-xl text-slate-500 hover:text-[#002147] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Editar producto"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create or Edit Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1C24] max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-[#F47B20]/20 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-[#F47B20]">
              <Coffee className="w-6 h-6" />
              <h3 className="text-lg font-bold font-serif text-[#002147] dark:text-white">
                {editingItem ? 'Editar Producto del Menú' : 'Nuevo Plato / Producto'}
              </h3>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nombre del Plato / Producto:
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Pastel de Choclo, Café Capuccino, etc."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#F47B20]"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Descripción / Ingredientes:
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve reseña del plato o acompañamientos..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#F47B20]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Precio ($ CLP):
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#F47B20]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Categoría:
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#F47B20]"
                  >
                    <option value="meals">Plato Principal (Almuerzo)</option>
                    <option value="beverages">Café & Bebidas</option>
                    <option value="snacks">Sándwiches & Snacks</option>
                    <option value="combos">Combo Especial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Turno Horario:
                  </label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#F47B20]"
                  >
                    <option value="both">Ambos Turnos (Día & Noche)</option>
                    <option value="day">Turno Día (Cultos diurnos)</option>
                    <option value="night">Turno Noche (Jóvenes / Vigilia)</option>
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tiempo de Prep. (Minutos):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.prepTimeMinutes}
                    onChange={(e) => setFormData({ ...formData, prepTimeMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#F47B20]"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  URL de Imagen (Unsplash / Web):
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#F47B20]"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Etiquetas (separadas por comas):
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Casero, Sin Azúcar, Especial Domingo"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121318] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#F47B20]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isAvailableCheckbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 rounded text-[#F47B20] focus:ring-[#F47B20]"
                />
                <label htmlFor="isAvailableCheckbox" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Producto disponible inmediatamente en vitrina
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#F47B20] hover:bg-[#D96815] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingItem ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
