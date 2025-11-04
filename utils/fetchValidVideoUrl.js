import axios from 'axios';
import cheerio from 'cheerio';

/**
 * Intenta rescatar el link de video válido desde la página fuente.
 * @param {string} pageUrl - URL de la página del video.
 * @returns {Promise<string|null>} - Link directo al video o null si no se encuentra.
 */
async function fetchValidVideoUrl(pageUrl) {
  try {
    const { data: html } = await axios.get(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)',
      }
    });
    const $ = cheerio.load(html);
    let videoUrl = null;
    $('script').each((i, el) => {
      const txt = $(el).html();
      if (txt) {
        const match = txt.match(/html5player\.setVideoUrlLow\('([^']+)'\)/);
        if (match) {
          videoUrl = match[1];
          return false; // break
        }
      }
    });
    return videoUrl;
  } catch (err) {
    console.error('Error al scrapear:', err.message);
    return null;
  }
}

export default fetchValidVideoUrl;
