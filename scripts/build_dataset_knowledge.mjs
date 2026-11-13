import fs from 'fs';
import path from 'path';

function parseCSV(content) {
  const rows = [];
  let row = [];
  let inQuotes = false;
  let cur = '';

  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    if (c === '"') {
      if (inQuotes && content[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push(cur.trim());
      cur = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && content[i + 1] === '\n') i++;
      row.push(cur.trim());
      cur = '';
      if (row.length > 0 && row.some(x => x.length > 0)) {
        rows.push(row);
      }
      row = [];
    } else {
      cur += c;
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur.trim());
    rows.push(row);
  }

  if (rows.length === 0) return [];
  const header = rows[0].map(h => h.trim());
  const results = [];
  for (let r = 1; r < rows.length; r++) {
    const item = {};
    for (let h = 0; h < header.length; h++) {
      item[header[h]] = (rows[r][h] || '').trim();
    }
    results.push(item);
  }
  return results;
}

const cityRows = parseCSV(fs.readFileSync('datasets/city_information.csv', 'utf-8'));
const placesRows = parseCSV(fs.readFileSync('datasets/tourist_places.csv', 'utf-8'));
const foodRows = parseCSV(fs.readFileSync('datasets/food_recommendations.csv', 'utf-8'));
const globalRows = parseCSV(fs.readFileSync('datasets/Tourist_Destinations.csv', 'utf-8'));
const plannerRows = parseCSV(fs.readFileSync('datasets/Travel_Planner_Dataset.csv', 'utf-8'));
const seasonalRows = parseCSV(fs.readFileSync('datasets/Wayora_India_Seasonal_Destinations.csv', 'utf-8'));

// Group places by city
const placesByCity = new Map();
placesRows.forEach(p => {
  const cKey = p.city.toLowerCase();
  if (!placesByCity.has(cKey)) placesByCity.set(cKey, []);
  placesByCity.get(cKey).push({
    placeId: p.place_id,
    placeName: p.place_name,
    placeType: p.place_type,
    establishmentYear: p.establishment_year ? parseFloat(p.establishment_year) : null,
    visitDurationHours: p.visit_duration_hours ? parseFloat(p.visit_duration_hours) : null,
    googleRating: p.google_rating ? parseFloat(p.google_rating) : null,
    entranceFeeINR: p.entrance_fee_inr ? parseFloat(p.entrance_fee_inr) : 0,
    airportWithin50km: p.airport_within_50km === 'Yes',
    weeklyOff: p.weekly_off || 'None',
    significance: p.significance || 'Historical & Cultural',
    dslrAllowed: p.dslr_allowed === 'Yes',
    googleReviewsLakhs: p.google_reviews_lakhs ? parseFloat(p.google_reviews_lakhs) : null,
    bestTimeToVisit: p.best_time_to_visit || 'Morning / Evening',
    state: p.state,
    zone: p.zone,
    sourceDataset: p.source_dataset,
  });
});

// Group food by city
const foodByCity = new Map();
foodRows.forEach(f => {
  const cKey = f.city.toLowerCase();
  if (!foodByCity.has(cKey)) foodByCity.set(cKey, []);
  foodByCity.get(cKey).push({
    recommendationId: f.recommendation_id,
    name: f.recommendation,
    type: f.type,
    meal: f.meal,
    sourceDataset: f.source_dataset,
  });
});

// Build unified verified cities
const verifiedCities = cityRows.map(c => {
  const cKey = c.city.toLowerCase();
  return {
    cityId: c.city_id,
    city: c.city,
    state: c.state,
    zone: c.zone,
    holidifyRating: parseFloat(c.holidify_rating) || null,
    description: c.description,
    bestTimeToVisit: c.best_time_to_visit,
    sourceDatasets: c.source_dataset,
    touristPlaces: placesByCity.get(cKey) || [],
    foodRecommendations: foodByCity.get(cKey) || [],
  };
});

// Flatten global destinations
const verifiedGlobalDestinations = globalRows.map(g => ({
  id: g['Destination ID'],
  name: g['Destination Name'],
  country: g['Country'],
  continent: g['Continent'],
  type: g['Type'],
  avgCostUSDPerDay: parseFloat(g['Avg Cost (USD/day)']) || null,
  bestSeason: g['Best Season'],
  avgRating: parseFloat(g['Avg Rating']) || null,
  annualVisitorsMillion: parseFloat(g['Annual Visitors (M)']) || null,
  unescoSite: g['UNESCO Site']?.toLowerCase() === 'yes',
}));

// Flatten planner records
const verifiedTravelPlans = plannerRows.map((pl, idx) => ({
  id: `TP_${idx + 1}`,
  destinationName: pl.Destination_Name,
  country: pl.Country,
  city: pl.City,
  destinationType: pl.Destination_Type,
  startingPoint: pl.Starting_Point,
  distanceKm: parseFloat(pl.Distance_km) || null,
  travelMode: pl.Travel_Mode,
  flightTransportCostUSD: parseFloat(pl.Flight_Transport_Cost_USD) || null,
  travelDurationHours: parseFloat(pl.Travel_Duration_Hours) || null,
  accommodationOptions: pl.Accommodation_Options ? pl.Accommodation_Options.split(',').map(s => s.trim()) : [],
  accommodationCostPerNightUSD: parseFloat(pl.Accommodation_Cost_Per_Night_USD) || null,
  recommendedStayDays: parseInt(pl.Recommended_Stay_Days) || 4,
  topAttractions: pl.Top_Attractions ? pl.Top_Attractions.split(',').map(s => s.trim()) : [],
  activityCostUSD: parseFloat(pl.Activity_Cost_USD) || null,
  activityDurationHours: parseFloat(pl.Activity_Duration_Hours) || null,
  foodOptions: pl.Food_Options ? pl.Food_Options.split(',').map(s => s.trim()) : [],
  foodCostPerDayUSD: parseFloat(pl.Food_Cost_Per_Day_USD) || null,
  visaRequired: pl.Visa_Required?.toUpperCase() === 'TRUE',
  visaCostUSD: parseFloat(pl.Visa_Cost_USD) || 0,
  miscellaneousCostUSD: parseFloat(pl.Miscellaneous_Cost_USD) || 0,
  bestSeason: pl.Best_Season,
  peakSeasonCostMultiplier: parseFloat(pl.Peak_Season_Cost_Multiplier) || 1.0,
  localCurrency: pl.Local_Currency,
  exchangeRateToUSD: parseFloat(pl.Exchange_Rate_to_USD) || null,
}));

// Helper to extract min and max budget numbers
function parseRangeINR(raw) {
  if (!raw) return { min: 1500, max: 3500, raw: '₹1,500–3,500' };
  const numbers = raw.replace(/[^0-9–-]/g, '').split(/[–-]/).map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
  if (numbers.length >= 2) {
    return { min: numbers[0], max: numbers[1], raw };
  } else if (numbers.length === 1) {
    return { min: numbers[0], max: numbers[0], raw };
  }
  return { min: 1500, max: 3500, raw };
}

// Ingest Wayora India Seasonal Destinations
const verifiedSeasonalDestinations = seasonalRows.map(s => {
  const seasonsList = (s.suitable_seasons || '')
    .split(';')
    .map(x => x.trim())
    .filter(x => x.length > 0);

  return {
    destinationId: s.destination_id,
    destinationName: s.destination_name,
    stateOrUT: s.state_or_union_territory,
    destinationType: s.destination_type,
    keyAttractions: s.key_attractions_and_experience,
    recommendedMonths: s.recommended_months,
    suitableSeasons: seasonsList,
    seasonalCautions: s.seasonal_cautions,
    budgetBudgetInt: parseRangeINR(s.budget_budget_traveller_per_person_per_day),
    budgetMidRangeInt: parseRangeINR(s.budget_mid_range_per_person_per_day),
    suggestedDuration: s.suggested_duration,
    imageSearchQuery: s.image_search_query,
    imageCategory: s.image_category,
    budgetBasis: s.budget_basis,
    dataConfidence: s.data_confidence,
    country: s.country || 'India',
    allSeasonStatus: s.all_season_status,
  };
});

console.log('Verified Cities:', verifiedCities.length);
console.log('Verified Global Destinations:', verifiedGlobalDestinations.length);
console.log('Verified Travel Plans:', verifiedTravelPlans.length);
console.log('Verified Seasonal Destinations:', verifiedSeasonalDestinations.length);

const outData = {
  metadata: {
    generatedAt: new Date().toISOString(),
    totalCities: verifiedCities.length,
    totalAttractions: placesRows.length,
    totalFoodRecommendations: foodRows.length,
    totalGlobalDestinations: verifiedGlobalDestinations.length,
    totalTravelPlans: verifiedTravelPlans.length,
    totalSeasonalDestinations: verifiedSeasonalDestinations.length,
    sources: [
      'city_information.csv',
      'tourist_places.csv',
      'food_recommendations.csv',
      'Tourist_Destinations.csv',
      'Travel_Planner_Dataset.csv',
      'Wayora_India_Seasonal_Destinations.csv',
    ],
  },
  cities: verifiedCities,
  globalDestinations: verifiedGlobalDestinations,
  travelPlans: verifiedTravelPlans,
  seasonalDestinations: verifiedSeasonalDestinations,
};

const jsonStr = JSON.stringify(outData);
console.log(`Generated JSON payload size: ${(jsonStr.length / 1024 / 1024).toFixed(2)} MB`);

fs.writeFileSync('src/data/datasetKnowledge.json', jsonStr);
console.log('Written successfully to src/data/datasetKnowledge.json');
