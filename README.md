# Biblia Inteligente (Digital Sanctuary) 📖✨

Santuario digital para el estudio bíblico integral, mapas e itinerarios geográficos interactivos, notas de prédicas y eventos eclesiales, mentoría teológica con inteligencia artificial y herramientas devocionales nativas (Web, PWA, Android e iOS con Flutter).

---

## 🌟 Características Principales

### 1. 📖 Lector Bíblico Avanzado
- **Múltiples Traducciones Canónicas**: Compatibilidad con Reina-Valera (RVR1909 / RVR1960 / RV1858 / SSE1569), NVI, DHH y LBLA a través del API de GetBible.net v2.
- **Personalización de Lectura**: Modos Claro, Sepia y Oscuro; ajuste tipográfico dinámico e interlineado.
- **Navegación Intuitiva**: Selector rápido de 66 libros canónicos (Antiguo y Nuevo Testamento) y capítulos.
- **Gestión de Versículos**: Marcadores, resaltados en paleta pastel, títulos personalizados, reflexiones y etiquetas temáticas.

### 2. 🗺️ Mapas Bíblicos Interactivos
- Visualización geográfica de eventos y rutas bíblicas con Leaflet:
  - Los viajes misioneros del Apóstol Pablo (1º, 2º, 3º viaje y rumbo a Roma).
  - La ruta del Éxodo y travesía en el desierto.
  - El ministerio de Jesús en Galilea, Judea y Samaria.
  - Ciudades del Antiguo y Nuevo Testamento con referencias bíblicas asociadas.

### 3. 🎙️ Prédicas & Eventos (Cuaderno de Apuntes y Modo Presentación)
- **Gestión de Apuntes**: Registro organizado de prédicas, devocionales, reuniones de matrimonios y jóvenes con categorías y fechas.
- **Patio de Comidas & Servicios**: Opciones para registrar turnos de cafetería/comidas, cuidado de niños y venta de libros.
- **Vinculación de Citas**: Enlace directo a versículos bíblicos con precarga de texto.
- **Modo Presentación (Púlpito / Lectura Pantalla Completa)**:
  - Vista limpia y de solo lectura optimizada para predicar o enseñar sin distracciones.
  - Cronómetro de tiempo transcurrido para control de duración.
  - Controles de escala de texto para lectura cómoda a distancia.
  - Prevención de apagado de pantalla automático (*Wake Lock API*).
  - Exportación y opciones para compartir.

### 4. 🤖 Mentor Teológico & Estudio Asistido por IA (Gemini)
- Consultas teológicas, contextuales, lingüísticas e históricas impulsadas por el SDK `@google/genai` de Gemini.
- Generación de bosquejos de sermones, reflexiones devocionales y aclaraciones doctrinales con citas bíblicas.

### 5. 💾 Persistencia Local & Widgets Nativos
- **Almacenamiento Local Robusto**: Persistencia en SQLite mediante Drift (Flutter) y LocalStorage / IndexedDB (Web) para funcionamiento 100% offline y modo anónimo/invitado (sin registro forzoso).
- **Lock Screen Widget**: Sincronización del «Versículo del Día» para pantalla de bloqueo y pantalla de inicio mediante `home_widget`.
- **Compartición Nativa**: Servicio con formato enriquecido para versículos, reflexiones y bosquejos con `share_plus`.

---

## 🏛️ Arquitectura Limpia (Clean Architecture)

El proyecto sigue una estricta separación por capas y módulos de dominio (*Feature-Sliced Clean Architecture*):

```text
├── src/ (Web / React Frontend)
│   ├── core/                        # Tokens globales, tema de santuario, clientes base
│   ├── shared/                      # Componentes UI reutilizables (AppBars, Drawers, Modals)
│   └── features/                    # Módulos de funcionalidad independientes
│       ├── reader/                  # Dominio, repositorios y presentación del lector bíblico
│       ├── bookmarks/               # Gestión y persistencia de versículos y notas
│       ├── events/                  # Prédicas, eventos eclesiales y modo presentación
│       ├── ai_mentor/               # Servicio y chat teológico con Gemini API
│       └── settings/                # Configuración de temas y preferencias
│
├── flutter/ (Mobile Native App - iOS & Android)
│   └── lib/
│       ├── core/                    # Base de datos Drift (SQLite), constantes y temas
│       ├── shared/                  # Servicios de Share (share_plus) y Home Widget
│       └── features/
│           ├── reader/              # Servicio GetBible v2, StateNotifiers y lector
│           ├── bookmarks/           # DAOs reactivos de versículos y notas
│           └── events/              # Repositorios y estados para eventos y categorías
```

---

## 🛠️ Tecnologías Utilizadas

- **Frontend Web**: React 19, TypeScript, Vite, Tailwind CSS 4, Motion, Lucide Icons, Leaflet.
- **Mobile Nativo**: Flutter (Dart), Drift (SQLite), Riverpod, `home_widget`, `share_plus`, Google Fonts.
- **Backend / Proxy**: Express, Node.js, `@google/genai` (Gemini API).
- **PWA / Envoltura**: Capacitor.

---

## 🚀 Instalación y Puesta en Marcha

### Web & Servidor Proxy
1. **Instalar dependencias:**
   ```bash
   npm install
   ```
2. **Configurar variables de entorno:**
   Crea un archivo `.env` con tu clave de Gemini API:
   ```env
   GEMINI_API_KEY=tu_api_key_de_gemini
   ```
3. **Iniciar desarrollo:**
   ```bash
   npm run dev
   ```

### App Móvil (Flutter)
1. **Acceder al directorio de Flutter e instalar paquetes:**
   ```bash
   cd flutter
   flutter pub get
   ```
2. **Generar código de Drift (SQLite):**
   ```bash
   dart run build_runner build --delete-conflicting-outputs
   ```
3. **Ejecutar en emulador o dispositivo:**
   ```bash
   flutter run
   ```

---

## 📄 Licencia

Proyecto privado de libre distribución para uso comunitario y de estudio bíblico.
