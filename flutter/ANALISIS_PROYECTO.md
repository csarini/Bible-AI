# Análisis del Proyecto: Biblia Inteligente (Digital Sanctuary)

## Descripción General

El proyecto "Biblia Inteligente (Digital Sanctuary)" es una aplicación móvil desarrollada en Flutter. Su objetivo principal es proporcionar una experiencia de lectura bíblica rica, personalizable e interactiva, complementada por herramientas modernas como un asistente teológico basado en IA. La aplicación está diseñada con un enfoque en la usabilidad, la personalización y la profundidad teológica.

## Arquitectura del Proyecto

La estructura del proyecto sigue un patrón modular limpio, promoviendo la separación de intereses y la escalabilidad. Se divide principalmente en los siguientes directorios:

*   **`lib/core/`**: Contiene elementos fundamentales para toda la aplicación, como temas, servicios centrales (por ejemplo, `BibleDataImportService`, `LocalUserService`), proveedores de estado globales (Riverpod) y constantes.
*   **`lib/features/`**: Alberga las funcionalidades específicas de cada característica de la aplicación, cada una organizada en subdirectorios `data`, `domain`, y `presentation`. Ejemplos de características incluyen `home`, `reader`, `ai_mentor`, `saved_verses`, etc.
*   **`lib/shared/`**: Contiene widgets reutilizables y servicios comunes que pueden ser utilizados por múltiples características, como diálogos (`FeedbackDialog`) y servicios de utilidad (`ShareService`).
*   **`lib/main.dart`**: Punto de entrada de la aplicación. Aquí se inicializan servicios esenciales, se configuran proveedores de Riverpod con valores persistentes (tema, idioma, tamaño de fuente, etc.) y se decide si mostrar la pantalla de bienvenida o ir directamente a la shell principal.

## Funcionalidades Principales

### 1. Shell Principal (`features/shell`)
*   **Navegación:** Proporciona la estructura principal con una barra de navegación inferior y un cajón lateral (drawer) para acceder a todas las funciones principales de la aplicación.
*   **Personalización del Tema:** El cajón lateral incluye controles rápidos para cambiar entre temas Claro, Sepia y Oscuro directamente desde la vista principal.

### 2. Lector Bíblico (`features/reader`)
*   **Selección de Libro/Capítulo:** Permite al usuario navegar fácilmente entre cualquiera de los 66 libros de la Biblia y sus capítulos respectivos mediante un modal interactivo.
*   **Lectura Personalizable:** Ofrece ajustes para tipo de letra (Literata, Playfair, Inter), tamaño de texto, espaciado de línea y visibilidad de números de versículo, todos accesibles a través de un menú de "Ajustes Rápidos".
*   **Resaltado y Notas Personales:** Los usuarios pueden tocar cualquier versículo para abrir un panel que les permite resaltarlo con un color pastel y/o agregar una nota de reflexión personal. Estos datos se almacenan localmente.
*   **Navegación por Versículo:** Soporta la navegación interna y externa hacia un versículo específico, lo cual puede activarse desde otras vistas como la de inicio o la de guardados. El lector se desplaza automáticamente hacia el versículo seleccionado y lo resalta temporalmente.
*   **Integración con Búsqueda y Guardados:** Se comunica fluidamente con otras vistas para cargar capítulos y versículos específicos según la interacción del usuario en otras partes de la app.

### 3. Mentor Teológico IA (`features/ai_mentor`)
*   **Chatbot Teológico:** Presenta una interfaz de chat donde el usuario puede hacer preguntas teológicas, sobre hermenéutica (interpretación bíblica) o sobre palabras en los idiomas originales (hebreo y griego).
*   **Respuestas Basadas en Conocimiento Predefinido:** En su versión actual (Modo Prueba), las respuestas están codificadas para responder a ciertos términos clave (como "Shālôm", "Monogenēs", "Qāvāh").
*   **Análisis de Idioma Original:** Las respuestas pueden incluir notas sobre el significado profundo de palabras en hebreo o griego bíblico, enriqueciendo la comprensión del texto original.
*   **Límite de Consultas:** Implementa un límite diario de consultas (2 por día en modo prueba) con un mensaje informativo claro para el usuario. Esto sugiere una estrategia de desarrollo iterativo o un modelo de servicio futuro.

### 4. Otras Características (`features/...`)
*   **Inicio (`home`):** Vista principal, posiblemente destinada a mostrar contenido devocional diario o destacado.
*   **Búsqueda y Librería (`reader/search_library`):** Permite buscar libros y capítulos, y facilita el acceso directo a referencias bíblicas específicas.
*   **Guardados (`saved_verses`):** Muestra una lista de los versículos que el usuario ha resaltado o anotado, permitiendo una fácil revisión y acceso rápido al lector.
*   **Mapas Bíblicos (`maps`):** Proporciona visualizaciones geográficas relacionadas con eventos y lugares bíblicos.
*   **Eventos/Sermones (`events`):** Potencialmente para mostrar eventos de la iglesia o sermones grabados/transcritos.
*   **Configuración (`settings`):** Permite configurar preferencias generales de la aplicación de forma más permanente que los ajustes rápidos del lector.

## Tecnologías y Patrones

*   **Flutter:** Framework principal para el desarrollo multiplataforma (iOS/Android).
*   **Riverpod:** Utilizado para la gestión del estado de la aplicación, inyectando dependencias y persistiendo preferencias del usuario de forma eficiente y reactiva.
*   **Drift (anteriormente Moor):** Una base de datos SQLite reactiva para almacenamiento local de datos como resaltados, notas personales y preferencias del usuario.
*   **Google Fonts & Lucide Icons:** Para una tipografía y simbología coherentes y atractivas.
*   **Patrón de Arquitectura Limpia:** Estructura modular (`features`) que separa la lógica de negocio (`domain`), la interfaz de usuario (`presentation`) y el acceso a datos (`data`), mejorando la mantenibilidad y testeo del código.