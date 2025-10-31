

/**
 * Valida si una URL de video es accesible (HEAD request).
 * @param {string} url
 * @returns {Promise<boolean>}
 */
export async function isVideoUrlValid(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Intenta obtener un link de video válido: si el original está roto, scrapea la página fuente.
 * @param {string} fallbackPageUrl - URL de la página fuente del video.
 * @param {string} originalUrl - URL original del video.
 * @returns {Promise<string|null>} - URL válida o null.
 */
export async function getValidVideoUrl(fallbackPageUrl: string, originalUrl: string): Promise<string|null> {
  if (await isVideoUrlValid(originalUrl)) return originalUrl;
  // Llama al backend para scrapear el link válido
  try {
    const res = await fetch('http://localhost:4000/api/scrape-video-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageUrl: fallbackPageUrl })
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.videoUrl && await isVideoUrlValid(data.videoUrl)) return data.videoUrl;
    return null;
  } catch {
    return null;
  }
}
