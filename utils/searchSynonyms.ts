// Synonym dictionary for adult search terms
export const SEARCH_SYNONYMS: Record<string, string[]> = {
  breast: ['boobs', 'boob', 'chest', 'busty', 'breasts', 'bosom', 'boobies', 'tits', 'tit', 'rack', 'cleavage', 'breastfeeding', 'breastplate'],
  boobs: ['breast', 'boob', 'busty', 'bosom', 'boobies', 'tits', 'tit', 'rack', 'cleavage'],
  ass: ['butt', 'booty', 'bottom', 'rear', 'behind', 'bum', 'buttocks', 'arse', 'backside', 'derriere'],
  penis: ['dick', 'cock', 'shaft', 'member', 'phallus', 'manhood'],
  vagina: ['pussy', 'cunt', 'vag', 'snatch', 'kitty', 'twat', 'cooch'],
  // Add more terms as needed
};

export function getSearchTerms(query: string): string[] {
  const normalized = query.trim().toLowerCase();
  const terms = [normalized];
  if (SEARCH_SYNONYMS[normalized]) {
    terms.push(...SEARCH_SYNONYMS[normalized]);
  }
  return Array.from(new Set(terms));
}
