# Plantilla de Sitio de Vídeos

Una plantilla de plataforma de vídeo adaptable y accesible construida con React y Tailwind CSS, que incluye modos claro/oscuro, búsqueda, filtros y un reproductor modal.

## ✨ Características

- **Diseño Adaptable**: Interfaz optimizada para escritorio, tablet y móvil.
- **Modo Claro y Oscuro**: Cambia de tema para adaptarse a las preferencias del usuario.
- **Búsqueda y Filtros**: Filtra vídeos por categoría y duración.
- **Paginación**: Navega fácilmente a través de grandes colecciones de vídeos.
- **Reproductor Avanzado**: Permite cambiar la calidad del vídeo y guarda el progreso de reproducción en el navegador.
- **"Mi Cesta"**: Una función similar a "Ver más tarde" para guardar vídeos de interés.
- **Vistas Previas Dinámicas**: Al pasar el ratón sobre una tarjeta de vídeo, se muestran fotogramas extraídos del vídeo.
- **Página de Inicio Atractiva**: Incluye un carrusel de héroe y secciones para vídeos en tendencia y nuevos lanzamientos.

## 🚀 Cómo Usar Tus Propios Datos (Plug and Play)

Esta plantilla está diseñada para consumir datos de vídeo desde un archivo JSON. Todo el contenido se gestiona desde un único archivo, `data.json`.

**Paso 1: Abre el archivo `data.json`**

Este archivo contiene todos los datos de los vídeos que se muestran en el sitio.

**Paso 2: Edita `data.json` con tu contenido**

El archivo espera un objeto donde cada clave representa una categoría, y el valor es una lista de vídeos pertenecientes a esa categoría.

**Estructura del JSON:**

```json
{
  "/c/Tu-Categoria-1": [
    {
      "id": "un_id_unico_string",
      "title": "El Título de Tu Increíble Vídeo",
      "duration": "12 min",
      "category": "/c/Tu-Categoria-1",
      "url": "https://...",
      "preview_src": null,
      "total_votes": "10,695 votes",
      "good_votes": "8.1k",
      "bad_votes": "2.6k",
      "available_qualities": []
    }
  ],
  "/c/Otra-Categoria-23": [
    // ... más vídeos
  ]
}
```

**Interpretación de los Campos:**

*   **`id`**: (string) Un identificador único para el vídeo.
*   **`title`**: (string) El título que se mostrará.
*   **`duration`**: (string) La duración en formato `"X min"` o `"Y sec"`. La aplicación lo convertirá automáticamente.
*   **`category`**: (string) Debe coincidir con la clave de la categoría padre.
*   **`total_votes`**: (string) Usado para calcular las "vistas". Ej: `"10,695 votes"`.
*   **`good_votes`**: (string) Usado para calcular la calificación (rating). Puede usar 'k' para miles. Ej: `"8.1k"`.
*   **`url`, `preview_src`, `bad_votes`, `available_qualities`**: Actualmente no se utilizan en la interfaz, pero se pueden mantener en el JSON.

**¿Y las Categorías?**

Las categorías que aparecen en los filtros de la aplicación se generan **automáticamente** a partir de las claves que definas en tu archivo `data.json` (por ejemplo, `"/c/Tu-Categoria-1"`). La aplicación tomará el nombre antes del guion para crear una etiqueta legible (ej. "Tu").

**Importante sobre la Reproducción de Vídeo:**

La aplicación **no reproduce** los vídeos directamente desde el campo `url` del JSON. Para la demostración, utiliza vídeos de muestra. Si necesitas reproducir tus propios vídeos, deberás modificar la lógica de transformación en `constants.ts` para que la propiedad `sources` apunte a tus archivos de vídeo directos (ej. `.mp4`).

## ⚙️ Estructura del Proyecto

- `index.html`: El punto de entrada principal para el navegador.
- `index.tsx`: Monta la aplicación de React en el DOM.
- `App.tsx`: El componente principal que contiene el estado y la lógica de la aplicación.
- `data.json`: **Tu archivo de configuración principal.** Edítalo para cambiar los vídeos.
- `constants.ts`: Transforma los datos de `data.json` al formato que la aplicación necesita.
- `types.ts`: Define las estructuras de datos de TypeScript (como `Video` y `Category`).
- `components/`: Contiene todos los componentes de React reutilizables que conforman la interfaz de usuario.

## Ejecutar la Aplicación

Dado que esta es una aplicación del lado del cliente sin un paso de compilación, simplemente puedes abrir el archivo `index.html` en tu navegador web.

Para una mejor experiencia y para evitar posibles problemas de seguridad del navegador (CORS), se recomienda ejecutarla con un servidor web local simple.

1.  Asegúrate de tener Node.js instalado.
2.  Abre tu terminal en el directorio raíz del proyecto.
3.  Ejecuta el comando: `npx serve`
4.  Abre la URL proporcionada por el comando (normalmente `http://localhost:3000`) en tu navegador.
