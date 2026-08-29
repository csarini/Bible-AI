import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Compass,
  MapPin,
  BookOpen,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Layers,
  Sparkles,
  Search,
  Maximize2,
  Minimize2,
  Navigation,
  Info,
  Footprints,
  Calendar,
  Mountain,
  Waves,
  Landmark,
  Building2,
  Cross
} from 'lucide-react';
import { BiblicalItinerary, MapWaypoint } from '../types';
import { BIBLICAL_ITINERARIES } from '../data/biblicalMapsData';

interface BiblicalMapsViewProps {
  initialItineraryId?: string;
  initialWaypointId?: string;
  activeWaypointId?: string;
  isSplitView?: boolean;
  onCloseSplit?: () => void;
  onWaypointSelected?: (waypoint: MapWaypoint) => void;
  onSelectScripture: (bookId: string, chapter: number, verseNum?: number) => void;
  onToast: (msg: string) => void;
  currentTheme?: 'light' | 'sepia' | 'dark';
}

type MapLayerType = 'voyager' | 'topo' | 'satellite';

export const BiblicalMapsView: React.FC<BiblicalMapsViewProps> = ({
  initialItineraryId,
  initialWaypointId,
  activeWaypointId,
  isSplitView = false,
  onCloseSplit,
  onWaypointSelected,
  onSelectScripture,
  onToast,
  currentTheme = 'light'
}) => {
  const isDark = currentTheme === 'dark';
  const isSepia = currentTheme === 'sepia';

  const [selectedItineraryId, setSelectedItineraryId] = useState<string>(
    initialItineraryId || 'pablo-2'
  );
  const [selectedWaypointIndex, setSelectedWaypointIndex] = useState<number>(0);
  const [isPlayingRoute, setIsPlayingRoute] = useState<boolean>(false);
  const [mapLayer, setMapLayer] = useState<MapLayerType>('voyager');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [showArchDetails, setShowArchDetails] = useState<boolean>(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentItinerary =
    BIBLICAL_ITINERARIES.find((it) => it.id === selectedItineraryId) ||
    BIBLICAL_ITINERARIES[0];

  const currentWaypoint: MapWaypoint =
    currentItinerary.waypoints[selectedWaypointIndex] ||
    currentItinerary.waypoints[0];

  // Synchronize when initialItineraryId changes from parent
  useEffect(() => {
    if (initialItineraryId && initialItineraryId !== selectedItineraryId) {
      setSelectedItineraryId(initialItineraryId);
    }
  }, [initialItineraryId]);

  // Synchronize when initialWaypointId or activeWaypointId changes
  useEffect(() => {
    const targetWpId = activeWaypointId || initialWaypointId;
    if (targetWpId) {
      // Look in current itinerary first
      const idx = currentItinerary.waypoints.findIndex((w) => w.id === targetWpId);
      if (idx !== -1) {
        setSelectedWaypointIndex(idx);
      } else {
        // Find which itinerary has this waypoint
        for (const it of BIBLICAL_ITINERARIES) {
          const foundIdx = it.waypoints.findIndex((w) => w.id === targetWpId);
          if (foundIdx !== -1) {
            setSelectedItineraryId(it.id);
            setSelectedWaypointIndex(foundIdx);
            break;
          }
        }
      }
    }
  }, [activeWaypointId, initialWaypointId, currentItinerary]);

  // Tile layer URL helper with dark mode support
  const getTileUrl = (type: MapLayerType) => {
    switch (type) {
      case 'topo':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'voyager':
      default:
        if (isDark) {
          return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        }
        // CartoDB Voyager - parchment/warm ancient cartography tone
        return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    }
  };

  const getTileAttribution = (type: MapLayerType) => {
    switch (type) {
      case 'topo':
        return '© OpenTopoMap & OSM contributors';
      case 'satellite':
        return '© Esri & Maxar Technologies';
      case 'voyager':
      default:
        return '© CARTO & OpenStreetMap contributors';
    }
  };

  // Initialize and update Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Safety: Remove any existing map instance first
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        console.warn('Error removing map instance:', e);
      }
      mapInstanceRef.current = null;
    }

    // Safety: Remove any stale Leaflet DOM marker
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    // Create fresh map instance
    const map = L.map(mapContainerRef.current, {
      center: currentWaypoint.coordinates,
      zoom: isSplitView ? 7 : 6,
      zoomControl: false,
      attributionControl: false
    });

    // Add zoom control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial tile layer
    const tile = L.tileLayer(getTileUrl(mapLayer), {
      attribution: getTileAttribution(mapLayer),
      maxZoom: 18
    }).addTo(map);
    tileLayerRef.current = tile;

    mapInstanceRef.current = map;

    // Trigger multiple invalidateSize checks to ensure tile rendering across all layout calculations
    const t0 = requestAnimationFrame(() => {
      map.invalidateSize();
    });
    const t1 = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    const t2 = setTimeout(() => {
      map.invalidateSize();
    }, 350);
    const t3 = setTimeout(() => {
      map.invalidateSize();
    }, 700);

    // Responsive ResizeObserver for smooth resizing when toggling split screen or adjusting panels
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      cancelAnimationFrame(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn('Error removing map instance on cleanup:', e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [isSplitView]);

  // Invalidate map size when toggling fullscreen or container size
  useEffect(() => {
    if (mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isFullScreen, isSplitView]);

  // Update Tile Layer when layer type or theme changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const tile = L.tileLayer(getTileUrl(mapLayer), {
      attribution: getTileAttribution(mapLayer),
      maxZoom: 18
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = tile;
    mapInstanceRef.current.invalidateSize();
  }, [mapLayer, currentTheme, isDark]);

  // Update Itinerary Markers and Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.invalidateSize();

    // Clear old markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }

    const latLngs: L.LatLngExpression[] = currentItinerary.waypoints.map(
      (wp) => wp.coordinates
    );

    // Draw route polyline
    const routePoly = L.polyline(latLngs, {
      color: currentItinerary.themeColor || '#F25C05',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    polylineRef.current = routePoly;

    // Add markers for each waypoint
    currentItinerary.waypoints.forEach((wp, index) => {
      const isSelected = index === selectedWaypointIndex;
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform transform ${
          isSelected ? 'scale-125 z-20' : 'scale-100 hover:scale-110 z-10'
        }">
          <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 ${
            isSelected
              ? 'bg-[#F25C05] text-white border-white ring-4 ring-[#0B2B68]/30 animate-pulse'
              : isDark
              ? 'bg-[#1C2337] text-white border-[#F25C05]'
              : 'bg-[#0B2B68] text-white border-[#F25C05]'
          }">
            ${wp.order}
          </div>
          <div class="absolute -bottom-5 whitespace-nowrap px-1.5 py-0.5 rounded-md ${
            isDark ? 'bg-[#131722]/95 border-white/20' : 'bg-[#082255]/90 border-white/20'
          } text-white text-[10px] font-bold shadow-xs border pointer-events-none">
            ${wp.name.split(' (')[0]}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'biblical-custom-marker',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(wp.coordinates, { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedWaypointIndex(index);
        setIsPlayingRoute(false);
        if (onWaypointSelected) {
          onWaypointSelected(wp);
        }
      });

      markersRef.current.push(marker);
    });

    // Fly or fit to current waypoint
    if (currentWaypoint) {
      map.flyTo(currentWaypoint.coordinates, isSplitView ? 8 : 7, {
        duration: 0.8,
        easeLinearity: 0.25
      });
    }
  }, [selectedItineraryId, selectedWaypointIndex, isSplitView, isDark]);

  // Handle Play / Auto-Step Route Animation
  useEffect(() => {
    if (isPlayingRoute) {
      playTimerRef.current = setInterval(() => {
        setSelectedWaypointIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= currentItinerary.waypoints.length) {
            setIsPlayingRoute(false);
            onToast('¡Itinerario completado!');
            return 0;
          }
          return nextIndex;
        });
      }, 4200);
    } else {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
    }

    return () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
    };
  }, [isPlayingRoute, currentItinerary.waypoints.length]);

  const handleNextWaypoint = () => {
    setIsPlayingRoute(false);
    if (selectedWaypointIndex < currentItinerary.waypoints.length - 1) {
      setSelectedWaypointIndex(selectedWaypointIndex + 1);
    } else {
      setSelectedWaypointIndex(0);
    }
  };

  const handlePrevWaypoint = () => {
    setIsPlayingRoute(false);
    if (selectedWaypointIndex > 0) {
      setSelectedWaypointIndex(selectedWaypointIndex - 1);
    } else {
      setSelectedWaypointIndex(currentItinerary.waypoints.length - 1);
    }
  };

  const handleItineraryChange = (id: string) => {
    setSelectedItineraryId(id);
    setSelectedWaypointIndex(0);
    setIsPlayingRoute(false);
    onToast(`Cargando mapa: ${BIBLICAL_ITINERARIES.find(i => i.id === id)?.title}`);
  };

  // Filtered search waypoints across all itineraries
  const filteredWaypoints = searchQuery.trim()
    ? BIBLICAL_ITINERARIES.flatMap((it) =>
        it.waypoints
          .filter(
            (wp) =>
              wp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              wp.modernName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              wp.scriptureReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (wp.ancientName && wp.ancientName.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .map((wp) => ({ waypoint: wp, itinerary: it }))
      )
    : [];

  const getCategoryIcon = (cat: MapWaypoint['category']) => {
    switch (cat) {
      case 'mountain':
        return Mountain;
      case 'sea_crossing':
        return Waves;
      case 'sanctuary':
        return Landmark;
      case 'altar':
        return Cross;
      case 'desert_oasis':
        return Compass;
      case 'city':
      default:
        return Building2;
    }
  };

  const CategoryIcon = getCategoryIcon(currentWaypoint.category);

  // Dynamic theme colors
  const containerBg = isDark ? 'bg-[#0B0F19]' : isSepia ? 'bg-[#F5EFE6]' : 'bg-[#FAF8F5]';
  const cardBg = isDark ? 'bg-[#131722] border-white/10 text-white' : isSepia ? 'bg-[#FAF6EF] border-[#705335]/20 text-[#3B2D1F]' : 'bg-white border-[#0B2B68]/15 text-[#1B1C19]';
  const headerTitleColor = isDark ? 'text-white' : isSepia ? 'text-[#3B2D1F]' : 'text-[#0B2B68]';
  const subtextColor = isDark ? 'text-white/70' : isSepia ? 'text-[#705335]' : 'text-[#454652]';
  const inputBg = isDark ? 'bg-[#1C2337] border-white/15 text-white placeholder-white/40' : isSepia ? 'bg-[#FAF6EF] border-[#705335]/25 text-[#3B2D1F] placeholder-[#705335]/60' : 'bg-white border-[#0B2B68]/20 text-[#0B2B68] placeholder-[#767683]';
  const innerToolbarBg = isDark ? 'bg-[#131722] border-white/10' : isSepia ? 'bg-[#FAF6EF] border-[#705335]/20' : 'bg-[#FAF8F5] border-[#0B2B68]/15';
  const inactiveBtnBg = isDark ? 'bg-[#1C2337] text-white/80 hover:bg-[#252E46] border-white/10' : isSepia ? 'bg-[#FAF6EF] text-[#3B2D1F] hover:bg-[#EAE0D0] border-[#705335]/20' : 'bg-white text-[#454652] hover:bg-[#EAE8E3] border-[#0B2B68]/10';

  return (
    <div
      id="biblical-maps-view"
      className={`flex flex-col h-full ${containerBg} transition-colors duration-200 ${
        isFullScreen
          ? `fixed inset-0 z-40 ${containerBg} p-3 sm:p-5 overflow-y-auto`
          : isSplitView
          ? 'p-2 sm:p-3 overflow-y-auto'
          : 'p-3 sm:p-5 lg:p-6'
      }`}
    >
      {/* Split Mode Header */}
      {isSplitView ? (
        <div className={`flex items-center justify-between p-2 px-3 mb-2.5 rounded-2xl border shadow-2xs ${cardBg}`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#0B2B68] text-[#F25C05] flex items-center justify-center shadow-2xs">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-bold text-xs block leading-none ${headerTitleColor}`}>
                  Mapa Sincronizado
                </span>
                <span className="text-[9px] font-sans font-bold px-1.5 py-0.2 rounded-full bg-[#F25C05]/15 text-[#F25C05]">
                  En Vivo
                </span>
              </div>
              <span className={`text-[10px] ${subtextColor}`}>
                {currentWaypoint.name.split(' (')[0]} • {currentItinerary.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className={`px-2 py-1 text-[11px] font-bold rounded-xl border transition-colors cursor-pointer ${inactiveBtnBg}`}
            >
              {isFullScreen ? 'Reducir' : 'Ampliar'}
            </button>
            {onCloseSplit && (
              <button
                type="button"
                onClick={onCloseSplit}
                className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#0B2B68] hover:bg-[#F25C05] rounded-xl transition-colors cursor-pointer shadow-2xs"
                title="Cerrar vista dividida"
              >
                ✕ Cerrar Mapa
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Standard Header Banner & Title */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-[#0B2B68] text-[#F25C05] flex items-center justify-center shadow-xs">
                <Compass className="w-4 h-4 animate-spin-slow" />
              </div>
              <h1 className={`font-serif italic font-bold text-xl sm:text-2xl ${headerTitleColor}`}>
                Mapas e Itinerarios Bíblicos
              </h1>
              <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-[#F25C05]/15 text-[#F25C05] uppercase tracking-wider">
                Geografía Sagrada
              </span>
            </div>
            <p className={`text-xs max-w-xl ${subtextColor}`}>
              Explora las rutas apostólicas, el éxodo por el desierto y los pasos de Jesús con evidencia arqueológica y vinculación directa a las Escrituras.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ciudad, monte o pasaje..."
              className={`w-full pl-9 pr-8 py-2 text-xs rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#F25C05] ${inputBg}`}
            />
            <Search className="w-4 h-4 text-[#767683] absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-[#767683] hover:text-[#F25C05] font-bold"
              >
                ✕
              </button>
            )}

            {/* Quick Search Dropdown Results */}
            {searchQuery && filteredWaypoints.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-1.5 rounded-2xl shadow-xl border max-h-64 overflow-y-auto z-50 p-2 space-y-1 ${cardBg}`}>
                <span className={`text-[10px] font-sans font-bold uppercase tracking-wider px-2 block ${subtextColor}`}>
                  Lugares encontrados ({filteredWaypoints.length})
                </span>
                {filteredWaypoints.map(({ waypoint, itinerary }) => (
                  <button
                    key={`${itinerary.id}-${waypoint.id}`}
                    onClick={() => {
                      setSelectedItineraryId(itinerary.id);
                      const wpIdx = itinerary.waypoints.findIndex((w) => w.id === waypoint.id);
                      setSelectedWaypointIndex(wpIdx !== -1 ? wpIdx : 0);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      isDark ? 'hover:bg-white/10' : isSepia ? 'hover:bg-[#EAE0D0]' : 'hover:bg-[#EAE8E3]'
                    }`}
                  >
                    <div>
                      <span className={`font-bold text-xs block ${headerTitleColor}`}>
                        {waypoint.name}
                      </span>
                      <span className={`text-[11px] ${subtextColor}`}>
                        {waypoint.modernName} • {itinerary.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#F25C05] bg-[#F25C05]/10 px-2 py-0.5 rounded-md">
                      {waypoint.scriptureReference}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Itineraries Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
        {BIBLICAL_ITINERARIES.map((it) => {
          const isSelected = it.id === selectedItineraryId;
          return (
            <button
              key={it.id}
              onClick={() => handleItineraryChange(it.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                isSelected
                  ? 'bg-[#0B2B68] text-white ring-2 ring-[#F25C05]'
                  : inactiveBtnBg
              }`}
            >
              <Navigation
                className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F25C05]' : 'text-[#767683]'}`}
              />
              <span>{it.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-[#F25C05] text-white' : isDark ? 'bg-white/15 text-white' : 'bg-[#0B2B68]/10 text-[#0B2B68]'
                }`}
              >
                {it.waypoints.length} paradas
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid/Column: Map on Left / Details on Right */}
      <div className={isSplitView ? 'flex flex-col gap-3.5 flex-1 min-h-0' : 'grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0'}>
        {/* Interactive Map Canvas */}
        <div className={`${isSplitView ? 'w-full h-[360px] sm:h-[420px] flex-shrink-0' : 'lg:col-span-7 xl:col-span-8 min-h-[380px] sm:min-h-[460px]'} flex flex-col rounded-3xl overflow-hidden border shadow-md relative isolate z-0 ${cardBg}`}>
          {/* Map Controls Integrated Header Toolbar */}
          <div className={`px-2.5 sm:px-3 py-2 border-b flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 z-10 ${innerToolbarBg}`}>
            {/* Layer Selector Chips */}
            <div className={`flex items-center gap-1 p-1 rounded-2xl border shadow-2xs ${cardBg}`}>
              <button
                type="button"
                onClick={() => setMapLayer('voyager')}
                className={`px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mapLayer === 'voyager'
                    ? 'bg-[#0B2B68] text-white shadow-xs'
                    : `hover:opacity-80 ${subtextColor}`
                }`}
                title="Capa Papiro Bíblico"
              >
                📜 <span className="hidden sm:inline">Papiro Bíblico</span><span className="sm:hidden">Papiro</span>
              </button>
              <button
                type="button"
                onClick={() => setMapLayer('topo')}
                className={`px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mapLayer === 'topo'
                    ? 'bg-[#0B2B68] text-white shadow-xs'
                    : `hover:opacity-80 ${subtextColor}`
                }`}
                title="Capa Topográfica"
              >
                ⛰️ <span className="hidden sm:inline">Topográfico</span><span className="sm:hidden">Relieve</span>
              </button>
              <button
                type="button"
                onClick={() => setMapLayer('satellite')}
                className={`px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mapLayer === 'satellite'
                    ? 'bg-[#0B2B68] text-white shadow-xs'
                    : `hover:opacity-80 ${subtextColor}`
                }`}
                title="Capa Satélite"
              >
                🛰️ <span className="hidden sm:inline">Satélite</span><span className="sm:hidden">Sat</span>
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className={`p-1.5 sm:px-3 rounded-2xl border shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold ${inactiveBtnBg}`}
              title={isFullScreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              aria-label={isFullScreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullScreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-[#F47B20]" />
                  <span className="hidden sm:inline">Reducir</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#F47B20]" />
                  <span className="hidden sm:inline">Pantalla Completa</span>
                </>
              )}
            </button>
          </div>

          {/* The Leaflet Container */}
          <div ref={mapContainerRef} className="w-full flex-1 z-0 min-h-[260px]" />

          {/* Bottom Interactive Playback & Route Stepper Bar */}
          <div className={`p-2 sm:p-3 border-t flex items-center justify-between gap-1.5 sm:gap-2 z-10 ${innerToolbarBg}`}>
            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlayingRoute(!isPlayingRoute)}
              className={`flex items-center gap-1.5 sm:gap-2 p-2 sm:px-3 sm:py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                isPlayingRoute
                  ? 'bg-[#F47B20] text-white animate-pulse'
                  : 'bg-[#0B2B68] text-white hover:bg-[#082255]'
              }`}
              title={isPlayingRoute ? 'Pausar Tour' : 'Animar Itinerario'}
              aria-label={isPlayingRoute ? 'Pausar Tour' : 'Animar Itinerario'}
            >
              {isPlayingRoute ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span className="hidden sm:inline">{isPlayingRoute ? 'Pausar Tour' : 'Animar Itinerario'}</span>
            </button>

            {/* Stepper controls */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={handlePrevWaypoint}
                className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${inactiveBtnBg}`}
                title="Parada anterior"
                aria-label="Parada anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className={`text-xs font-sans font-bold px-1.5 sm:px-2 ${headerTitleColor}`}>
                <span className="sm:hidden">{selectedWaypointIndex + 1}/{currentItinerary.waypoints.length}</span>
                <span className="hidden sm:inline">Parada {selectedWaypointIndex + 1} de {currentItinerary.waypoints.length}</span>
              </span>

              <button
                onClick={handleNextWaypoint}
                className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${inactiveBtnBg}`}
                title="Siguiente parada"
                aria-label="Siguiente parada"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Total distance badge */}
            <div className={`hidden sm:flex items-center gap-1 text-[11px] font-bold ${subtextColor}`}>
              <Footprints className="w-3.5 h-3.5 text-[#F47B20]" />
              <span>{currentItinerary.totalDistanceKm} km aprox.</span>
            </div>
          </div>
        </div>

        {/* Historical, Archaeological & Scripture Context Card */}
        <div className={`${isSplitView ? 'w-full flex-1' : 'lg:col-span-5 xl:col-span-4'} flex flex-col rounded-3xl border shadow-md overflow-hidden ${cardBg}`}>
          {/* Waypoint Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-[#082255] via-[#0B2B68] to-[#051433] text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#F25C05] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {currentWaypoint.order}
                </span>
                <span className="text-[11px] font-sans font-bold text-[#00A3E0] uppercase tracking-wider">
                  {currentWaypoint.region}
                </span>
              </div>

              <span className="text-[11px] font-mono bg-white/15 px-2 py-0.5 rounded-md text-white/90">
                {currentItinerary.approxDate}
              </span>
            </div>

            <h2 className="font-serif italic font-bold text-xl sm:text-2xl leading-snug">
              {currentWaypoint.name}
            </h2>

            {currentWaypoint.ancientName && (
              <p className="text-xs text-white/70 font-mono mt-0.5">
                Nombre antiguo: {currentWaypoint.ancientName}
              </p>
            )}

            <p className="text-xs text-[#FED65B] mt-1 font-semibold">
              📍 Ubicación actual: {currentWaypoint.modernName}
            </p>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
            {/* Scripture Connection Box */}
            <div className={`p-3.5 rounded-2xl border shadow-2xs space-y-2 ${cardBg}`}>
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1.5 text-xs font-bold ${headerTitleColor}`}>
                  <BookOpen className="w-4 h-4 text-[#F25C05]" />
                  <span>Pasaje Bíblico Vinculado</span>
                </div>
                <span className="text-xs font-bold font-mono text-[#F25C05] bg-[#F25C05]/10 px-2 py-0.5 rounded-md">
                  {currentWaypoint.scriptureReference}
                </span>
              </div>

              <blockquote className={`font-serif italic text-xs sm:text-[13px] leading-relaxed pl-2 border-l-2 border-[#F25C05] ${isDark ? 'text-white/90' : isSepia ? 'text-[#3B2D1F]' : 'text-[#1B1C19]'}`}>
                {currentWaypoint.scriptureExcerpt}
              </blockquote>

              {/* Direct Jump to Bible Reader */}
              <button
                type="button"
                onClick={() => {
                  onSelectScripture(
                    currentWaypoint.bookId,
                    currentWaypoint.chapter,
                    currentWaypoint.verse
                  );
                  onToast(`Abriendo ${currentWaypoint.scriptureReference} en el Lector...`);
                }}
                className="w-full py-2 px-3 bg-[#0B2B68] hover:bg-[#F47B20] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                title={`Abrir ${currentWaypoint.scriptureReference} en el Lector`}
                aria-label={`Abrir ${currentWaypoint.scriptureReference} en el Lector`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Abrir {currentWaypoint.scriptureReference} en el Lector</span>
                <span className="sm:hidden">Abrir {currentWaypoint.scriptureReference}</span>
              </button>
            </div>

            {/* Historical Reconstruction & Archaeological Context */}
            <div className={`p-3.5 rounded-2xl border shadow-2xs space-y-3 ${cardBg}`}>
              <div className={`flex items-center gap-2 text-xs font-bold border-b pb-2 ${headerTitleColor} ${isDark ? 'border-white/10' : 'border-[#0B2B68]/10'}`}>
                <Landmark className="w-4 h-4 text-[#F25C05]" />
                <span>Reconstrucción Histórica del Sitio</span>
              </div>

              <p className={`text-xs leading-relaxed ${subtextColor}`}>
                {currentWaypoint.historicalContext}
              </p>

              {/* Archaeological Evidence */}
              <div className={`p-3 rounded-xl border space-y-1 ${isDark ? 'bg-white/5 border-white/10' : isSepia ? 'bg-[#705335]/10 border-[#705335]/20' : 'bg-[#0B2B68]/5 border-[#0B2B68]/10'}`}>
                <span className={`text-[11px] font-bold flex items-center gap-1 ${headerTitleColor}`}>
                  🏺 Evidencia Arqueológica Real:
                </span>
                <p className={`text-[11px] leading-relaxed ${subtextColor}`}>
                  {currentWaypoint.archaeologicalEvidence}
                </p>
              </div>

              {/* Spiritual Meaning / Lesson */}
              <div className="p-3 bg-[#F25C05]/10 rounded-xl border border-[#F25C05]/20 space-y-1">
                <span className="text-[11px] font-bold text-[#F25C05] flex items-center gap-1">
                  ✨ Significado & Lección Espiritual:
                </span>
                <p className={`text-[11px] leading-relaxed font-serif italic ${isDark ? 'text-white/90' : isSepia ? 'text-[#3B2D1F]' : 'text-[#1B1C19]'}`}>
                  {currentWaypoint.spiritualLesson}
                </p>
              </div>
            </div>

            {/* Quick Waypoints List in this Itinerary */}
            <div className={`p-3 rounded-2xl border shadow-2xs ${cardBg}`}>
              <span className={`text-[11px] font-sans font-bold uppercase tracking-wider block mb-2 ${subtextColor}`}>
                Ruta paso a paso ({currentItinerary.waypoints.length} hitos):
              </span>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                {currentItinerary.waypoints.map((wp, idx) => {
                  const isCur = idx === selectedWaypointIndex;
                  return (
                    <button
                      key={wp.id}
                      onClick={() => {
                        setSelectedWaypointIndex(idx);
                        setIsPlayingRoute(false);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isCur
                          ? 'bg-[#F25C05] text-white shadow-xs'
                          : inactiveBtnBg
                      }`}
                    >
                      <span className="opacity-80">#{wp.order}</span>
                      <span>{wp.name.split(' (')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
