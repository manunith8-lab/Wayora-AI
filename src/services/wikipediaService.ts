export interface WikiPlaceSummary {
  title: string;
  description: string;
  extract: string;
  thumbnailUrl?: string;
  originalImageUrl?: string;
  coordinates?: { lat: number; lng: number };
  pageUrl: string;
}

export interface WikiFoodInfo {
  name: string;
  description: string;
  isRegionalSpecialty: boolean;
}

const memoryCache = new Map<string, any>();

export const wikipediaService = {
  // Fetch Wikipedia summary for a specific title/place
  async getPageSummary(title: string): Promise<WikiPlaceSummary | null> {
    const cacheKey = `wiki_sum_${title.toLowerCase()}`;
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey);
    }

    try {
      const sanitized = encodeURIComponent(title.replace(/\s+/g, '_'));
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${sanitized}`;
      const response = await fetch(url, {
        headers: { 'Api-User-Agent': 'WayoraTravelAssistant/1.0' },
      });

      if (!response.ok) return null;
      const data = await response.json();

      if (data.type === 'disambiguation') return null;

      const summary: WikiPlaceSummary = {
        title: data.title,
        description: data.description || '',
        extract: data.extract || '',
        thumbnailUrl: data.thumbnail?.source,
        originalImageUrl: data.originalimage?.source,
        coordinates: data.coordinates
          ? { lat: data.coordinates.lat, lng: data.coordinates.lon }
          : undefined,
        pageUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${sanitized}`,
      };

      memoryCache.set(cacheKey, summary);
      return summary;
    } catch (e) {
      console.warn('Wikipedia summary error for', title, e);
      return null;
    }
  },

  // Search Wikipedia for attractions or articles about a destination
  async searchArticles(query: string, limit: number = 8): Promise<WikiPlaceSummary[]> {
    const cacheKey = `wiki_search_${query.toLowerCase()}_${limit}`;
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey);
    }

    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&format=json&origin=*&srlimit=${limit}`;

      const res = await fetch(searchUrl);
      if (!res.ok) return [];

      const data = await res.json();
      const searchHits = data.query?.search || [];

      // Fetch summaries for top results concurrently
      const summaries = await Promise.all(
        searchHits.slice(0, limit).map((hit: any) => this.getPageSummary(hit.title))
      );

      const valid = summaries.filter((s): s is WikiPlaceSummary => s !== null && !!s.extract);
      memoryCache.set(cacheKey, valid);
      return valid;
    } catch (e) {
      console.warn('Wikipedia search error for', query, e);
      return [];
    }
  },

  // Discover famous regional foods for any destination
  async discoverRegionalFoods(destination: string): Promise<WikiFoodInfo[]> {
    const cacheKey = `wiki_food_${destination.toLowerCase()}`;
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey);
    }

    try {
      const queries = [
        `${destination} cuisine famous dishes`,
        `Food of ${destination}`,
        `Cuisine of ${destination}`,
      ];

      const res = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
          queries[0]
        )}&format=json&origin=*&srlimit=6`
      );

      const items: WikiFoodInfo[] = [];

      if (res.ok) {
        const data = await res.json();
        const hits = data.query?.search || [];

        for (const hit of hits) {
          // If the title looks like a dish or food culture
          if (!hit.title.toLowerCase().includes('demographics') && !hit.title.toLowerCase().includes('politics')) {
            const cleanSnippet = hit.snippet.replace(/<[^>]*>?/gm, '');
            items.push({
              name: hit.title,
              description: cleanSnippet,
              isRegionalSpecialty: true,
            });
          }
        }
      }

      memoryCache.set(cacheKey, items);
      return items;
    } catch (e) {
      console.warn('Wikipedia food error', e);
      return [];
    }
  },
};
