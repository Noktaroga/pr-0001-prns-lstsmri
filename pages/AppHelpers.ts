// Helper functions for search, filtering, and relevance

export function getMinutes(duration: string): number {
  const [min, sec] = duration.split(':').map(Number);
  return min + sec / 60;
}

export function calculateSearchRelevance(title: string, searchTerm: string): number {
  if (!searchTerm) return 0;
  const titleLower = title.toLowerCase();
  const searchLower = searchTerm.toLowerCase().trim();
  if (titleLower === searchLower) return 1000;
  if (titleLower.startsWith(searchLower)) return 800;
  if (titleLower.includes(searchLower)) return 600;
  const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);
  const titleWords = titleLower.split(/\s+/);
  let relevance = 0;
  searchWords.forEach(searchWord => {
    titleWords.forEach(titleWord => {
      if (titleWord === searchWord) {
        relevance += 200;
      } else if (titleWord.includes(searchWord)) {
        relevance += 100;
      } else if (searchWord.includes(titleWord)) {
        relevance += 50;
      }
    });
  });
  const foundWords = searchWords.filter(searchWord =>
    titleWords.some(titleWord =>
      titleWord.includes(searchWord) || searchWord.includes(titleWord)
    )
  ).length;
  relevance += (foundWords / searchWords.length) * 100;
  return relevance;
}

export function normalizeText(text: string): string {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function smartSearchMatch(title: string, searchTerm: string): boolean {
  const titleNormalized = normalizeText(title);
  const searchNormalized = normalizeText(searchTerm);
  if (!searchNormalized) return true;
  const searchWords = searchNormalized.split(' ').filter(word => word.length > 0);
  if (searchWords.length === 1) {
    return titleNormalized.includes(searchWords[0]);
  }
  return searchWords.every(word => {
    if (word.length <= 2) {
      return titleNormalized.includes(word);
    } else {
      return titleNormalized.includes(word) ||
        titleNormalized.split(' ').some(titleWord =>
          titleWord.includes(word) || word.includes(titleWord)
        );
    }
  });
}
