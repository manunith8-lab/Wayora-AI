// Wikidata Entity & Notability Service
// Retrieves structured entity relationships, sitelink notability signals, and coordinates.

export interface WikidataEntity {
  id: string;
  label: string;
  description: string;
  sitelinksCount: number;
  coordinates?: { lat: number; lng: number };
  wikipediaUrl?: string;
}

const wikidataCache = new Map<string, { entity: WikidataEntity; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

export const wikidataService = {
  async searchEntity(query: string, timeoutMs: number = 2000): Promise<WikidataEntity | null> {
    const clean = query.trim();
    const cacheKey = `wd_${clean.toLowerCase()}`;

    const cached = wikidataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.entity;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Search entities
      const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(clean)}&language=en&limit=3&format=json&origin=*`;
      const res = await fetch(searchUrl, {
        signal: controller.signal,
        headers: { 'Api-User-Agent': 'WayoraTravelConcierge/2.0' },
      });
      clearTimeout(timeoutId);

      if (!res.ok) return null;
      const data = await res.json();
      if (!data.search || data.search.length === 0) return null;

      const topMatch = data.search[0];
      const entityId = topMatch.id;

      // Fetch entity details (sitelinks, coordinates)
      const detailController = new AbortController();
      const detailTimeout = setTimeout(() => detailController.abort(), 1800);
      const detailUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entityId}&props=info|sitelinks|claims&format=json&origin=*`;

      const detailRes = await fetch(detailUrl, { signal: detailController.signal });
      clearTimeout(detailTimeout);

      if (!detailRes.ok) {
        const fallback: WikidataEntity = {
          id: entityId,
          label: topMatch.label || clean,
          description: topMatch.description || '',
          sitelinksCount: 1,
        };
        wikidataCache.set(cacheKey, { entity: fallback, timestamp: Date.now() });
        return fallback;
      }

      const detailData = await detailRes.json();
      const entityObj = detailData.entities?.[entityId];
      if (!entityObj) return null;

      const sitelinks = entityObj.sitelinks || {};
      const sitelinksCount = Object.keys(sitelinks).length;
      const enWikiTitle = sitelinks.enwiki?.title;

      // Extract coordinates if present (P625)
      let coords: { lat: number; lng: number } | undefined;
      const p625 = entityObj.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
      if (p625 && typeof p625.latitude === 'number' && typeof p625.longitude === 'number') {
        coords = { lat: p625.latitude, lng: p625.longitude };
      }

      const entity: WikidataEntity = {
        id: entityId,
        label: topMatch.label || clean,
        description: topMatch.description || '',
        sitelinksCount,
        coordinates: coords,
        wikipediaUrl: enWikiTitle ? `https://en.wikipedia.org/wiki/${encodeURIComponent(enWikiTitle)}` : undefined,
      };

      wikidataCache.set(cacheKey, { entity, timestamp: Date.now() });
      return entity;
    } catch {
      return null;
    }
  },

  // Batch notability evaluator
  async getNotabilityScore(placeName: string): Promise<number> {
    const entity = await this.searchEntity(placeName, 1500);
    if (!entity) return 5;
    // Normalized notability score (0 - 100)
    // Sitelinks count: > 50 = 100, 20 = 70, 10 = 50, 5 = 30
    return Math.min(Math.round((entity.sitelinksCount / 40) * 100), 100);
  },
};
