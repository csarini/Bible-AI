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

Se utiliza `drift` como ORM para interactuar con una base de datos SQLite local. Esta herramienta se encarga de la creación, consulta y manipulación de la base de datos, incluyendo la tabla de versículos y anotaciones del usuario. La configuración y el acceso a la base de datos se realizan en el archivo `lib/core/database.dart` y en los archivos correspondientes dentro de cada característica que requiera acceso a la base de datos.

### Gestión de Estado

`Riverpod` se usa para manejar el estado global de la aplicación (ajustes del usuario, tema, selección actual de libro/capítulo) y el estado local de las vistas (mensajes del chatbot, versículos seleccionados, etc.), permitiendo una arquitectura desacoplada y predecible.

### Inteligencia Artificial

La funcionalidad del "Mentor Teológico IA" se implementa mediante una integración con la API de `google_generative_ai` de Google, específicamente el modelo Gemini. Esta integración permite a la aplicación enviar consultas relacionadas con textos bíblicos y recibir respuestas generadas por inteligencia artificial, ofreciendo análisis y exégesis teológica. La dependencia `google_generative_ai: ^0.4.6` está definida en `pubspec.yaml` y se utiliza dentro de la feature `ai_mentor` para comunicarse con el servicio de IA remoto. Se gestionan cuidadosamente los límites de uso para cumplir con las restricciones del servicio en la versión actual de la aplicación.

### Carga de Datos de Capítulos

Los datos de los capítulos de los libros se cargan desde archivos JSON localizados en la carpeta `lib/features/reader/data`. Cada libro tiene su propio archivo JSON que contiene los capítulos y versículos correspondientes. La lógica para cargar estos datos se encuentra en el archivo `lib/features/reader/data/reader_repository.dart`, donde se define la clase `ReaderRepository` que maneja la carga y almacenamiento de los datos en Drift (SQLite). Esta clase utiliza el paquete `drift` para interactuar con la base de datos y se asegura de que los datos estén disponibles localmente para una lectura sin conexión.

El archivo `lib/features/reader/data/reader_repository.dart` contiene la lógica para cargar y almacenar los datos de los capítulos de los libros en Drift (SQLite). La clase `ReaderRepository` utiliza el paquete `drift` para interactuar con la base de datos y se asegura de que los datos estén disponibles localmente para una lectura sin conexión.

### Notas de Reflexión

Las notas de reflexión se almacenan localmente en la base de datos SQLite utilizando la clase `BookmarksRepository` definida en el archivo `lib/features/bookmarks/data/bookmarks_repository.dart`. Esta clase utiliza el paquete `drift` para interactuar con la base de datos y permite crear, leer, actualizar y eliminar notas de reflexión para versículos específicos.

### Chatbot y Inteligencia Artificial

El chatbot del "Mentor Teológico IA" utiliza la API de `google_generative_ai` de Google para generar respuestas generadas por inteligencia artificial. La lógica para manejar las consultas y respuestas del chatbot se encuentra en el archivo `lib/features/ai_mentor/domain/ai_mentor_repository.dart`. La clase `AI MentorRepository` se encarga de enviar las consultas al servicio de IA y manejar la respuesta generada, asegurándose de cumplir con los límites de uso definidos para la versión actual de la aplicación.

### Estado de la Aplicación

La gestión del estado de la aplicación se realiza mediante Riverpod. La configuración de Riverpod se encuentra en el archivo `lib/main.dart`, donde se inicializa el `ProviderScope` y se configuran los proveedores necesarios para manejar el estado de la aplicación. Los estados de la aplicación se gestionan mediante los proveedores definidos en el archivo `lib/core/state_providers.dart`, que incluyen el estado del usuario, el tema seleccionado y la selección actual de libro/capítulo.

### Archivos Relevantes

*   `lib/features/reader/data/reader_repository.dart`: Contiene la lógica para cargar y almacenar los datos de los capítulos de los libros en Drift (SQLite).
*   `lib/features/bookmarks/data/bookmarks_repository.dart`: Contiene la lógica para gestionar las notas de reflexión del usuario en la base de datos SQLite.
*   `lib/features/ai_mentor/domain/ai_mentor_repository.dart`: Contiene la lógica para manejar las consultas y respuestas del chatbot del "Mentor Teológico IA" utilizando la API de `google_generative_ai` de Google.
*   `lib/core/state_providers.dart`: Contiene la configuración de Riverpod y los proveedores necesarios para manejar el estado de la aplicación.

### Ejemplo de Carga de Datos

Para cargar los datos de los capítulos de los libros, el código en `lib/features/reader/data/reader_repository.dart` realiza las siguientes operaciones:

1.  Carga los datos de los capítulos de los libros desde los archivos JSON localizados en la carpeta `lib/features/reader/data`.
2.  Convierte los datos cargados en objetos de entidad utilizando la clase `VerseEntity` definida en el archivo `lib/features/reader/domain/verse_entity.dart`.
3.  Almacena los objetos de entidad en la base de datos SQLite utilizando la clase `DriftDatabase` definida en el archivo `lib/core/database.dart`.
4.  Maneja cualquier error que pueda ocurrir durante el proceso de carga de datos, mostrando un mensaje de error al usuario utilizando el servicio de compartir contenido definido en el archivo `lib/shared/share_service.dart`.

### Ejemplo de Manejo de Estado

Para gestionar el estado de la aplicación, el código en `lib/core/state_providers.dart` realiza las siguientes operaciones:

1.  Configura el `ProviderScope` con los proveedores necesarios para manejar el estado de la aplicación.
2.  Define proveedores para el estado del usuario, el tema seleccionado y la selección actual de libro/capítulo utilizando la clase `StateNotifierProvider` definida en el archivo `lib/core/state_providers.dart`.
3.  Maneja los cambios en el estado de la aplicación utilizando los proveedores definidos y notifica cambios a los widgets de UI suscritos a estos proveedores utilizando el método `notifyListeners` definido en la clase `StateNotifier`.
4.  Maneja cualquier error que pueda ocurrir durante el proceso de gestión del estado, mostrando un mensaje de error al usuario utilizando el servicio de compartir contenido definido en el archivo `lib/shared/share_service.dart`.

### Ejemplo de Manejo de Consultas del Chatbot

Para manejar las consultas del chatbot del "Mentor Teológico IA", el código en `lib/features/ai_mentor/domain/ai_mentor_repository.dart` realiza las siguientes operaciones:

1.  Envía la consulta al servicio de IA utilizando la API de `google_generative_ai` de Google.
2.  Maneja la respuesta generada por la API y la convierte en un objeto de entidad utilizando la clase `AI MentorEntity` definida en el archivo `lib/features/ai_mentor/domain/ai_mentor_entity.dart`.
3.  Almacena el objeto de entidad en la base de datos SQLite utilizando la clase `DriftDatabase` definida en el archivo `lib/core/database.dart`.
4.  Maneja cualquier error que pueda ocurrir durante el proceso de manejo de consultas del chatbot, mostrando un mensaje de error al usuario utilizando el servicio de compartir contenido definido en el archivo `lib/shared/share_service.dart`.

Espero que esta información te sea útil y que te ayude a actualizar la documentación técnica de tu proyecto Flutter.