

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
  // Llama al backend para scrapear el link válido (usa endpoint relativo para proxy Vite)
  try {
    console.log('[getValidVideoUrl] Llamando a /api/scrape-video-url con', fallbackPageUrl);
    const res = await fetch('/api/scrape-video-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_url: fallbackPageUrl })
    });
    console.log('[getValidVideoUrl] Respuesta status:', res.status);
    if (!res.ok) return null;
    const data = await res.json();
    console.log('[getValidVideoUrl] Data recibida:', data);
    if (data.videoUrl && await isVideoUrlValid(data.videoUrl)) return data.videoUrl;
    return null;
  } catch (e) {
    console.error('[getValidVideoUrl] Error en fetch:', e);
    return null;
  }
}
