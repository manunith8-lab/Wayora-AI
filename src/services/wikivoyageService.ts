// Wikivoyage Destination Guide Service
// Extracts curated famous attractions ("See"), activities ("Do"), food ("Eat"), and nearby destinations ("Go next")
// from Wikivoyage worldwide travel guides with caching and strict timeouts.

export interface WikivoyageGuide {
  title: string;
  seeAttractions: { name: string; description: string }[];
  doActivities: { name: string; description: string }[];
  eatSpecialties: { name: string; description: string }[];
  nearbyDestinations: string[];
}

const wikivoyageCache = new Map<string, { guide: WikivoyageGuide; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

export const wikivoyageService = {
  async getDestinationGuide(destination: string, timeoutMs: number = 2500): Promise<WikivoyageGuide | null> {
    const clean = destination.trim();
    const cacheKey = `wikivoyage_${clean.toLowerCase()}`;

    const cached = wikivoyageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.guide;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // 1. Get sections of the Wikivoyage article
      const sectionsUrl = `https://en.wikivoyage.org/w/api.php?action=parse&page=${encodeURIComponent(clean)}&prop=sections&format=json&origin=*`;
      const res = await fetch(sectionsUrl, {
        signal: controller.signal,
        headers: { 'Api-User-Agent': 'WayoraTravelConcierge/2.0 (travel assistant)' },
      });
      clearTimeout(timeoutId);

      if (!res.ok) return null;
      const data = await res.json();
      if (!data.parse || !data.parse.sections) return null;

      const sections: { index: string; line: string }[] = data.parse.sections;
      const seeSection = sections.find((s) => s.line.toLowerCase() === 'see');
      const doSection = sections.find((s) => s.line.toLowerCase() === 'do');
      const eatSection = sections.find((s) => s.line.toLowerCase() === 'eat');
      const goNextSection = sections.find((s) => s.line.toLowerCase() === 'go next' || s.line.toLowerCase() === 'nearby');

      // Fetch relevant sections in parallel with timeout
      const fetchSectionText = async (idx?: string): Promise<string> => {
        if (!idx) return '';
        try {
          const subController = new AbortController();
          const subTimeout = setTimeout(() => subController.abort(), 1800);
          const url = `https://en.wikivoyage.org/w/api.php?action=parse&page=${encodeURIComponent(clean)}&section=${idx}&prop=text&format=json&origin=*`;
          const sRes = await fetch(url, { signal: subController.signal });
          clearTimeout(subTimeout);
          if (!sRes.ok) return '';
          const sData = await sRes.json();
          return sData.parse?.text?.['*'] || '';
        } catch {
          return '';
        }
      };

      const [seeHtml, doHtml, eatHtml, goNextHtml] = await Promise.all([
        fetchSectionText(seeSection?.index),
        fetchSectionText(doSection?.index),
        fetchSectionText(eatSection?.index),
        fetchSectionText(goNextSection?.index),
      ]);

      // Extract listings from HTML helper
      const extractListings = (html: string): { name: string; description: string }[] => {
        if (!html) return [];
        const results: { name: string; description: string }[] = [];
        
        // Regex to extract listing names e.g. <span class="listing-name">...</span> or <b>...</b>
        const listingRegex = /<span class="listing-name"[^>]*>([^<]+)<\/span>(?:[\s\S]*?<span class="listing-content"[^>]*>([^<]+)<\/span>)?/gi;
        let match;
        while ((match = listingRegex.exec(html)) !== null && results.length < 12) {
          const name = match[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();
          const desc = match[2] ? match[2].trim() : `Famous attraction featured in the Wikivoyage travel guide for ${clean}.`;
          if (name.length > 2 && !name.toLowerCase().includes('edit') && !results.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
            results.push({ name, description: desc });
          }
        }

        // Fallback to bold names if standard listing tags weren't present
        if (results.length < 3) {
          const boldRegex = /<b><a[^>]*>([^<]+)<\/a><\/b>(?:[^.]*?[:–—-])?([^.<]+(?:\.[^.<]+)?)/gi;
          let bMatch;
          while ((bMatch = boldRegex.exec(html)) !== null && results.length < 10) {
            const name = bMatch[1].trim();
            const desc = bMatch[2] ? bMatch[2].replace(/<[^>]*>/g, '').trim() : `Notable landmark in ${clean}.`;
            if (name.length > 2 && !results.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
              results.push({ name, description: desc });
            }
          }
        }

        return results;
      };

      // Extract nearby links from Go Next
      const nearby: string[] = [];
      if (goNextHtml) {
        const linkRegex = /<a[^>]+title="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
        let lMatch;
        while ((lMatch = linkRegex.exec(goNextHtml)) !== null && nearby.length < 8) {
          const name = lMatch[2].trim();
          if (name.length > 2 && !name.includes(':') && !nearby.includes(name)) {
            nearby.push(name);
          }
        }
      }

      const guide: WikivoyageGuide = {
        title: clean,
        seeAttractions: extractListings(seeHtml),
        doActivities: extractListings(doHtml),
        eatSpecialties: extractListings(eatHtml),
        nearbyDestinations: nearby,
      };

      wikivoyageCache.set(cacheKey, { guide, timestamp: Date.now() });
      return guide;
    } catch (e) {
      console.warn(`Wikivoyage guide retrieval timed out or failed for ${destination}`, e);
      return null;
    }
  },
};
