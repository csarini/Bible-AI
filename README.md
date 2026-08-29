# Biblia Inteligente 📖✨

Santuario digital para el estudio bíblico integral, mapas e itinerarios geográficos interactivos, notas de prédicas y eventos, mentoría teológica con inteligencia artificial y herramientas devocionales.

---

## 🌟 Características Principales

### 1. 📖 Lector Bíblico Avanzado
- **Múltiples Traducciones**: Compatibilidad con Reina-Valera 1960 (RVR1960), Nueva Versión Internacional (NVI), Dios Habla Hoy (DHH) y La Biblia de las Américas (LBLA).
- **Personalización de Lectura**: Modos Claro, Sepia y Oscuro; ajuste dinámico de tamaño de tipografía e interlineado.
- **Navegación Intuitiva**: Selector rápido de libros (Antiguo y Nuevo Testamento) y capítulos.
- **Gestión de Versículos**: Marcadores, colores de resaltado, notas personales y etiquetas temáticas.

### 2. 🗺️ Mapas Bíblicos Interactivos
- Visualización geográfica de eventos y rutas bíblicas con Leaflet:
  - Los viajes misioneros del Apóstol Pablo (1º, 2º, 3º viaje y rumbo a Roma).
  - La ruta del Éxodo y travesía en el desierto.
  - El ministerio de Jesús en Galilea, Judea y Samaria.
  - Ciudades del Antiguo y Nuevo Testamento con referencias bíblicas asociadas.

### 3. 🎙️ Prédicas & Eventos (Cuaderno de Apuntes y Modo Presentación)
- **Gestión de Apuntes**: Registro organizado de prédicas, enseñanzas, reuniones y eventos con categorías y fechas.
- **Vinculación de Citas**: Enlace directo a versículos bíblicos con carga automática de texto.
- **Modo Presentación (Púlpito / Lectura Pantalla Completa)**:
  - Vista limpia y de solo lectura optimizada para predicar o enseñar sin distracciones.
  - Cronómetro de tiempo transcurrido para control de duración.
  - Controles de escala de texto para lectura cómoda a distancia.
  - Prevención de apagado de pantalla automático (*Wake Lock API*).
  - Exportación y opciones para compartir.

### 4. 🤖 Mentor Teológico & Estudio Asistido por IA (Gemini)
- Consultas teológicas, contextuales, lingüísticas e históricas impulsadas por el SDK `@google/genai` de Gemini.
- Generación de bosquejos de sermones, reflexiones devocionales y aclaraciones doctrinales con citas bíblicas.

### 5. 💾 Guardado y Modo Offline
- **Persistencia Local**: Guardado de versículos favoritos, notas, historial de lectura y preferencias en almacenamiento local.
- **Descargas Offline**: Descargador de datos bíblicos para uso sin conexión a internet.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animaciones**: [Motion](https://motion.dev/)
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **Mapas**: [Leaflet](https://leafletjs.com/)
- **Backend / API Proxy**: [Express](https://expressjs.com/), [Node.js](https://nodejs.org/)
- **Inteligencia Artificial**: [@google/genai](https://github.com/googleapis/google-genai-js) (Gemini API)
- **Móvil / PWA**: [Capacitor](https://capacitorjs.com/) (Soporte Android/iOS)

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js (v18 o superior)
- Gestor de paquetes `npm` o `bun`

### Pasos

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Crea un archivo `.env` tomando como referencia `.env.example`:
   ```env
   GEMINI_API_KEY=tu_api_key_de_gemini
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

5. **Iniciar en modo producción:**
   ```bash
   npm run start
   ```

---

## 📁 Estructura del Proyecto

```
├── public/                 # Recursos estáticos (iconos, imágenes, fuentes)
├── src/
│   ├── components/         # Componentes modulares de la interfaz
│   │   ├── AIMentorView.tsx            # Asistente de IA teológico
│   │   ├── BiblicalMapsView.tsx        # Mapas interactivos bíblicos
│   │   ├── EventPresentationView.tsx   # Modo pantalla completa para prédicas
│   │   ├── EventsView.tsx              # Gestión de notas de prédicas y eventos
│   │   ├── ReaderView.tsx              # Lector bíblico principal
│   │   ├── SavedVersesView.tsx         # Versículos guardados y notas
│   │   ├── SearchView.tsx              # Buscador bíblico
│   │   └── SettingsView.tsx            # Ajustes y temas
│   ├── data/               # Textos bíblicos, rutas geográficas e himnario
│   ├── services/           # Servicios de almacenamiento y llamadas API
│   ├── types.ts            # Definición de interfaces y tipos TypeScript
│   ├── App.tsx             # Componente raíz de navegación
│   └── main.tsx            # Punto de entrada de React
├── server.ts               # Servidor Express y proxy seguro para Gemini API
├── capacitor.config.ts     # Configuración para compilación móvil
└── package.json            # Dependencias y scripts de ejecución
```

---

## 📄 Licencia

Este proyecto es privado y de uso comunitario / educativo.
