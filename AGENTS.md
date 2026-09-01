# Directivas del Proyecto

## Sincronización Dual (React Web + Flutter Nativo)

1. **Regla de Paridad Automática**: Cada vez que se agregue, modifique, elimine o actualice una característica, pantalla, modelo de datos, texto litúrgico, tema o lógica de negocio en la versión web de React (`/src/`), se DEBE actualizar y reflejar de manera inmediata e idéntica en el código fuente de Flutter (`/flutter/lib/`).
2. **Estructura Espejo en Flutter**:
   - `/flutter/lib/core/`: Temas, base de datos local (Drift/SQLite), clientes API y servicios.
   - `/flutter/lib/features/`: Módulos por funcionalidad (home, reader, maps, events/pulpit, ai_mentor, saved_verses, library, settings).
   - `/flutter/lib/shared/`: Modelos de datos compartidos, widgets reutilizables y utilidades.
3. **Alineación de UX/UI**:
   - Mantener la misma paleta institucional (Navy `#0B2B68`, Ambar `#FED65B`, Naranja `#F25C05`, Cyan `#00A3E0`, Esmeralda `#10B981`).
   - Soportar los 3 modos visuales: Claro, Sepia y Oscuro.
   - Preservar la persistencia offline local y la compatibilidad con exportación/importación de datos JSON.
