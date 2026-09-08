# Biblia Inteligente (Digital Sanctuary)

Un lector bíblico y santuario personal desarrollado en Flutter con una arquitectura limpia y moderna. Ofrece una experiencia de lectura profunda y personalizada de las Sagradas Escrituras, complementada con herramientas de estudio y un mentor teológico impulsado por IA.

## Características Principales

*   **Lector Bíblico Completo:** Acceso a múltiples traducciones de la Biblia (RV1858, SSE, Valera, etc.) almacenadas localmente para una lectura sin conexión.
*   **Resaltado y Anotaciones Personales:** Destaca versículos clave con colores pastel y añade notas personales de reflexión para crear tu propio santuario de versículos guardados.
*   **Mentor Teológico IA (Modo Prueba):** Un chatbot experimental que proporciona análisis teológicos, exégesis y explicaciones sobre raíces hebreas y griegas (limitado a 2 consultas por día en la versión actual).
*   **Búsqueda Avanzada:** Busca rápidamente libros, capítulos y versículos específicos.
*   **Personalización Visual:** Temas claros, oscuros y sepia, con opciones para ajustar el tamaño de fuente, familia tipográfica y espaciado de líneas.
*   **Arquitectura Limpia:** Basada en principios de Clean Architecture, con una clara separación entre la lógica de negocio (domain), la infraestructura (data) y la presentación (presentation).
*   **Persistencia Local Robusta:** Utiliza Drift (SQLite) para un almacenamiento eficiente y confiable de datos locales, incluyendo versículos, traducciones y anotaciones del usuario.
*   **Gestión de Estado con Riverpod:** Una gestión de estado reactiva y escalable para mantener la interfaz sincronizada con los cambios de datos.
*   **Diseño Responsivo y Elegante:** Interfaz de usuario intuitiva y visualmente agradable, inspirada en el concepto de un "santuario digital".

## Tecnologías y Dependencias

*   **Framework:** [Flutter](https://flutter.dev/)
*   **Lenguaje:** Dart
*   **Gestión de Estado:** [flutter_riverpod](https://pub.dev/packages/flutter_riverpod)
*   **Base de Datos Local:** [drift](https://pub.dev/packages/drift) + `sqlite3_flutter_libs`
*   **Persistencia y Rutas:** [path](https://pub.dev/packages/path), [path_provider](https://pub.dev/packages/path_provider)
*   **Red y HTTP:** [http](https://pub.dev/packages/http)
*   **Tipografía e Iconografía:** [google_fonts](https://pub.dev/packages/google_fonts), [lucide_icons_flutter](https://pub.dev/packages/lucide_icons_flutter)
*   **Animaciones:** [flutter_animate](https://pub.dev/packages/flutter_animate)
*   **Compartir Contenido:** [share_plus](https://pub.dev/packages/share_plus)
*   **Widgets Nativos:** [home_widget](https://pub.dev/packages/home_widget)

## Estructura del Proyecto

El proyecto sigue una estructura de directorios basada en características (feature-based) y arquitectura limpia:

*   `lib/`
    *   `core/`: Contiene elementos transversales como constantes (por ejemplo, libros de la Biblia), proveedores de Riverpod, servicios base, almacenamiento (base de datos) y temas.
    *   `features/`: Cada característica principal reside en su propia carpeta (por ejemplo, `reader`, `ai_mentor`, `settings`, `saved_verses`, `shell`). Cada feature típicamente contiene:
        *   `data/`: Lógica de acceso y manipulación de datos.
        *   `domain/`: Entidades y lógica de negocio pura.
        *   `presentation/`: Widgets de UI, estados gestionados por Riverpod y controladores.
    *   `shared/`: Componentes y servicios reutilizables por varias características.
    *   `main.dart`: Punto de entrada de la aplicación, inicialización de servicios y configuración del `ProviderScope`.

## Instalación y Ejecución

1.  Asegúrate de tener instalado [Flutter](https://docs.flutter.dev/get-started/install).
2.  Clona este repositorio.
3.  Navega al directorio del proyecto (`cd`).
4.  Ejecuta `flutter pub get` para instalar todas las dependencias.
5.  Ejecuta `flutter run` para construir y lanzar la aplicación en tu dispositivo o emulador preferido.

## Documentación Técnica

### Arquitectura

La aplicación está dividida en tres capas principales:

*   **Presentación (`presentation`):** Encapsula la lógica de la interfaz de usuario y la interacción con el usuario. Utiliza Riverpod para consumir datos del dominio y notificar eventos.
*   **Dominio (`domain`):** Contiene las entidades centrales del negocio (como `VerseEntity`) y define los casos de uso abstractos (a través de repositorios).
*   **Datos (`data`):** Implementa los contratos definidos en el dominio, gestionando la obtención de datos desde fuentes locales (Drift/SQLite) o externas (APIs HTTP).

### Persistencia

Se utiliza `drift` como ORM para interactuar con una base de datos SQLite local. Esto gestiona eficientemente el almacenamiento de las versiones bíblicas, así como las anotaciones y resaltados personalizados del usuario.

### Gestión de Estado

`Riverpod` se usa para manejar el estado global de la aplicación (ajustes del usuario, tema, selección actual de libro/capítulo) y el estado local de las vistas (mensajes del chatbot, versículos seleccionados, etc.), permitiendo una arquitectura desacoplada y predecible.

### Inteligencia Artificial

La funcionalidad del "Mentor Teológico IA" se implementa mediante una integración con la API de `google_generative_ai` de Google, específicamente el modelo Gemini. Esta integración permite a la aplicación enviar consultas relacionadas con textos bíblicos y recibir respuestas generadas por inteligencia artificial, ofreciendo análisis y exégesis teológica. La dependencia `google_generative_ai: ^0.4.6` está definida en `pubspec.yaml` y se utiliza dentro de la feature `ai_mentor` para comunicarse con el servicio de IA remoto. Se gestionan cuidadosamente los límites de uso para cumplir con las restricciones del servicio en la versión actual de la aplicación.
