# Biblia Inteligente (Digital Sanctuary) 📖✨

Santuario digital para el estudio bíblico integral, mapas e itinerarios geográficos interactivos, notas de prédicas y eventos eclesiales, mentoría teológica con inteligencia artificial, generador de afiches HD y herramientas devocionales nativas (Web, PWA, Android e iOS con Flutter).

---

## 🌟 Características Principales

### 1. 📖 Lector Bíblico Avanzado (66 Libros & 1.189 Capítulos)
- **Múltiples Traducciones Canónicas**: Compatibilidad con Reina-Valera (RVR1909 / RVR1960), Sagradas Escrituras 1569 (*Biblia del Oso*, Casiodoro de Reina) y Reina Valera NT 1858 a través de GetBible.net v2.
- **Personalización de Lectura**: Modos **Claro**, **Sepia** y **Oscuro**; ajuste de tamaño de fuente (`A-`, `A`, `A+`, `A++`) e interlineado relajado.
- **Síntesis de Voz (Audio TTS)**: Reproducción hablada versículo por versículo con control de pausa y reanudación.
- **Gestión de Versículos**: Marcadores con paleta pastel (Amarillo, Verde, Azul), títulos personalizados, notas reflexivas personales y etiquetas temáticas.

### 2. 🗺️ Mapas Bíblicos e Itinerarios Interactivos
- Visualización geográfica de eventos y rutas bíblicas con **Leaflet**:
  - **Los 4 Viajes del Apóstol Pablo**: 1º, 2º, 3º viaje misionero y la travesía marítima rumbo a Roma.
  - **Ruta del Éxodo**: Salida de Egipto, cruce del Mar Rojo y travesía por el desierto de Sinaí.
  - **Ministerio de Jesús**: Recorridos en Galilea, Judea, Samaria y Jerusalén.
  - Puntos geográficos detallados con citas bíblicas asociadas y coordenadas históricas.

### 3. 🎙️ Prédicas, Eventos & Cuaderno de Apuntes
- **Gestión Eclesial y Devocional**: Registro estructurado de sermones dominicales, reuniones de matrimonios, jóvenes, vigilias de oración y grupos pequeños.
- **Servicios Integrados**: Registro de turnos de cafetería/patio de comidas, cuidado de niños y librería eclesial.
- **Vinculación Bíblica**: Enlace directo a versículos de la Escritura con precarga instantánea.
- **Modo Presentación (Púlpito / Lectura Pantalla Completa)**:
  - Vista limpia y de solo lectura optimizada para predicar o enseñar sin distracciones.
  - Cronómetro de tiempo transcurrido en vivo.
  - Controles de escala de texto para lectura cómoda a distancia.
  - Prevención de apagado de pantalla automático (*Screen Wake Lock API*).
- **Generador de Posters & Afiches HD**:
  - Motor de renderizado en Canvas para generar y descargar invitaciones visuales en alta resolución (PNG) listas para WhatsApp, correo y redes sociales.

### 4. 🤖 Mentor Teológico IA (Modo Prueba — 2 consultas/día)
- **Exégesis & Análisis Lingüístico**: Respuestas contextuales, históricas y doctrinales impulsadas por Google Gemini (`@google/genai`).
- **Raíces en Hebreo y Griego Bíblico**: Exploración de términos originales como *Shālôm* (שָׁלוֹם), *El-Shaddai* (אֵל שַׁדַּי), *Qavah* (קָוָה), *Agapē* (ἀγάπη), *Eirēnē* (εἰρήνη) y *Monogenēs* (μονογενής).
- **Control de Cupo Diario (Modo Prueba)**:
  - Límite de **2 consultas por día** para controlar el consumo computacional durante la fase de prueba.
  - **Reinicio Automático**: El cupo se restablece de forma automática cada medianoche (`00:00 hs`).
  - Distintivos visuales de *Modo Prueba* en el menú lateral, inicio y cabecera del chat.

### 5. 💾 Respaldo y Transferencia de Datos (Descargar y Subir JSON)
- **Exportación & Descarga**: Descarga un archivo `.json` completo con todos tus versículos guardados, notas de reflexión, categorías personalizadas, sermones y preferencias.
- **Importación & Carga**: Sube y restaura copias de seguridad de forma instantánea mediante selector de archivos o arrastrar y soltar, garantizando permisos de lectura y escritura locales.
- **Privacidad Total**: Tus datos permanecen en tu dispositivo (LocalStorage / SQLite) sin requerir cuentas obligatorias en la nube.

### 6. 🧭 Guía Interactiva (CoachMark) & Buzón de Sugerencias
- **Tour Paso a Paso**: Recorrido de inducción interactivo con adaptación visual perfecta a temas Claro, Sepia y Oscuro.
- **Buzón de Sugerencias y Reportes**: Formulario modal seguro para enviar comentarios y reportes de errores técnicos al endpoint `/api/feedback` sin exponer correos personales en la interfaz.

---

## 🏛️ Arquitectura Limpia (Clean Architecture)

El proyecto sigue una estricta separación por capas y módulos de dominio (*Feature-Sliced Clean Architecture*):

```text
├── src/ (Web / React Frontend)
│   ├── components/                  # Vistas principales (Lector, Mapas, Prédicas, Mentor IA, Ajustes)
│   ├── services/                    # Servicios de almacenamiento, cuota IA, TTS y GetBible API
│   ├── types.ts                     # Interfaces de dominio TypeScript
│   └── data/                        # Datos canónicos de libros y rutas bíblicas
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

Proyecto privado de libre distribución para la comunidad de fe y el estudio riguroso de las Sagradas Escrituras.
