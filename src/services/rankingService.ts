// Famous Attraction Ranking System
// Computes multi-signal notability scores to rank attractions and categorize into MUST VISIT, POPULAR, and HIDDEN GEMS.

import { DiscoveredPlace, DiscoveryCategory } from './placesService';

export interface ScoredPlace extends DiscoveredPlace {
  notabilityScore: number; // 0 - 100
  notabilitySignals: string[];
}

export const rankingService = {
  calculateScore(place: DiscoveredPlace, isWikivoyageFeatured: boolean = false, sitelinksCount: number = 0): number {
    let score = 10;
    const lowerName = place.name.toLowerCase();

    // 1. Canonical / Curated Knowledge is gold standard (guarantees iconic landmarks)
    if (place.source === 'curated') {
      score += 65;
    }

    // 2. Wikivoyage Featured Attraction ("See" section)
    if (isWikivoyageFeatured) {
      score += 25;
    }

    // 3. Wikidata Sitelinks count (international notability signal)
    if (sitelinksCount > 0) {
      score += Math.min(sitelinksCount * 1.5, 30);
    }

    // 4. Google Reviews / Ratings
    if (place.rating) {
      if (place.rating >= 4.5) score += 10;
      if (place.reviewCount) {
        if (place.reviewCount > 5000) score += 20;
        else if (place.reviewCount > 1000) score += 12;
        else if (place.reviewCount > 200) score += 6;
      }
    }

    // 5. Tourism Keyword Boosts (temple, pass, tunnel, national park, museum, waterfall, tower)
    const iconicKeywords = ['temple', 'pass', 'tunnel', 'valley', 'castle', 'palace', 'national park', 'cathedral', 'tower', 'museum', 'monument', 'shrine', 'lake', 'waterfall', 'fort'];
    if (iconicKeywords.some((kw) => lowerName.includes(kw))) {
      score += 10;
    }

    // 6. Penalty for generic untagged OSM nodes without rich description
    if (place.source === 'osm' && (!place.description || place.description.includes('Verified attraction'))) {
      score -= 5;
    }

    return Math.min(Math.max(score, 5), 100);
  },

  rankAndCategorize(
    places: DiscoveredPlace[],
    wikivoyageNames: Set<string> = new Set()
  ): {
    rankedMustVisit: DiscoveredPlace[];
    rankedPopular: DiscoveredPlace[];
    rankedHiddenGems: DiscoveredPlace[];
    categorized: Record<DiscoveryCategory, DiscoveredPlace[]>;
    allRanked: DiscoveredPlace[];
  } {
    // Score each place
    const scored: ScoredPlace[] = places.map((place) => {
      const isWikiFeatured = wikivoyageNames.has(place.name.toLowerCase());
      const score = this.calculateScore(place, isWikiFeatured);
      const signals: string[] = [];
      if (place.source === 'curated') signals.push('Verified Landmark');
      if (isWikiFeatured) signals.push('Wikivoyage Highlight');
      if (place.rating && place.rating >= 4.6) signals.push(`${place.rating}★ Rating`);

      return {
        ...place,
        notabilityScore: score,
        notabilitySignals: signals,
      };
    });

    // Sort descending by notabilityScore
    scored.sort((a, b) => b.notabilityScore - a.notabilityScore);

    // Group into Must Visit (score >= 60), Popular (35-59), Hidden Gems (< 35 or specifically categorized)
    const rankedMustVisit: DiscoveredPlace[] = [];
    const rankedPopular: DiscoveredPlace[] = [];
    const rankedHiddenGems: DiscoveredPlace[] = [];

    const categorized: Record<DiscoveryCategory, DiscoveredPlace[]> = {
      MUST_VISIT: [],
      NATURE_ADVENTURE: [],
      HIDDEN_GEMS: [],
      HISTORY_CULTURE: [],
      PHOTOGRAPHY: [],
    };

    scored.forEach((place, index) => {
      // Must Visit: top scored items or explicitly categorized as MUST_VISIT
      if (place.category === 'MUST_VISIT' || place.notabilityScore >= 60 || index < 4) {
        rankedMustVisit.push(place);
        categorized.MUST_VISIT.push(place);
      } else if (place.category === 'HIDDEN_GEMS' || (place.rating && place.rating >= 4.7 && (place.reviewCount || 0) < 300)) {
        rankedHiddenGems.push(place);
        categorized.HIDDEN_GEMS.push(place);
      } else {
        rankedPopular.push(place);
      }

      // Also ensure it is in its specific topical category if not MUST_VISIT
      if (place.category !== 'MUST_VISIT' && place.category !== 'HIDDEN_GEMS') {
        categorized[place.category].push(place);
      }
    });

    return {
      rankedMustVisit,
      rankedPopular,
      rankedHiddenGems,
      categorized,
      allRanked: scored,
    };
  },
};
