import Fuse from 'fuse.js';
import { getSearchTerms } from '../utils/searchSynonyms';
import { normalizeText } from '../pages/AppHelpers';
import { Video } from '../types';

export function smartVideoSearch(videos: Video[], query: string): Video[] {
  if (!query.trim()) return videos;
  const terms = getSearchTerms(query).map(normalizeText);
  const fuse = new Fuse(videos, {
    keys: ['title', 'category', 'categoryLabel'],
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2,
    findAllMatches: true,
    useExtendedSearch: true,
  });
  // Build Fuse.js search pattern for all terms, for all keys
  const fusePattern = terms.flatMap(term => ([
    { title: String(term) },
    { category: String(term) },
    { categoryLabel: String(term) }
  ]));
  // Get all matches from Fuse.js
  const fuseResults = fuse.search({ $or: fusePattern }).map(r => r.item);

  // Extra: filtrar videos cuya categoría o label coincida parcial o exactamente con el término
  const extraCategoryMatches = videos.filter(v => {
    // Normaliza el label y value
    const labelNorm = normalizeText(v.categoryLabel || '');
    let valueNorm = '';
    if (v.category) {
      valueNorm = v.category.replace(/^\/c\//, '').replace(/[-_]/g, ' ');
      valueNorm = valueNorm.replace(/\s*\d+$/, '');
      valueNorm = normalizeText(valueNorm);
    }
    // Split normalized label and value into words for partial matching
    const labelWords = labelNorm.split(' ');
    const valueWords = valueNorm.split(' ');
    // Match if any term is a substring of any word in label or value
    return terms.some(term =>
      labelWords.some(word => word.includes(term)) ||
      valueWords.some(word => word.includes(term))
    );
  });

  // Unir resultados y eliminar duplicados
  const allResults = [...fuseResults, ...extraCategoryMatches];
  const uniqueResults = Array.from(new Map(allResults.map(v => [v.id, v])).values());
  return uniqueResults;
}
