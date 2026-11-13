import fs from 'fs';
import path from 'path';

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
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

  if (rows.length === 0) return { header: [], records: [] };
  const header = rows[0].map(h => h.trim());
  const records = [];
  for (let r = 1; r < rows.length; r++) {
    const item = {};
    for (let h = 0; h < header.length; h++) {
      item[header[h]] = (rows[r][h] || '').trim();
    }
    records.push(item);
  }
  return { header, records };
}

const dir = 'e:/Ai project/datasets';
const files = fs.readdirSync(dir);

console.log('=== DATASET INVENTORY & AUDIT REPORT ===');
const inventory = [];

for (const f of files) {
  const fullPath = path.join(dir, f);
  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) continue;

  if (f.endsWith('.csv')) {
    const { header, records } = parseCSV(fullPath);
    console.log(`\nFILE: ${f}`);
    console.log(`  Format: CSV | Size: ${stat.size} bytes | Record count: ${records.length}`);
    console.log(`  Columns (${header.length}): ${header.join(', ')}`);
    
    // Check duplicates
    const seen = new Set();
    let duplicates = 0;
    records.forEach(r => {
      const serialized = JSON.stringify(r);
      if (seen.has(serialized)) duplicates++;
      else seen.add(serialized);
    });
    console.log(`  Duplicates within file: ${duplicates}`);

    inventory.push({
      fileName: f,
      sizeBytes: stat.size,
      recordCount: records.length,
      columns: header,
      duplicates,
    });
  } else {
    console.log(`\nFILE: ${f}`);
    console.log(`  Format: Markdown/Text | Size: ${stat.size} bytes`);
  }
}

// Deep analytics on the 5 destination datasets
const cityInfo = parseCSV(path.join(dir, 'city_information.csv')).records;
const places = parseCSV(path.join(dir, 'tourist_places.csv')).records;
const food = parseCSV(path.join(dir, 'food_recommendations.csv')).records;
const globalDest = parseCSV(path.join(dir, 'Tourist_Destinations.csv')).records;
const planner = parseCSV(path.join(dir, 'Travel_Planner_Dataset.csv')).records;

console.log('\n--- CROSS-DATASET RELATIONAL METRICS ---');
const indianCities = new Set(cityInfo.map(r => r.city.trim()).filter(Boolean));
const indianStates = new Set(cityInfo.map(r => r.state.trim()).filter(Boolean));
const indianZones = new Set(cityInfo.map(r => r.zone.trim()).filter(Boolean));
console.log(`Unique Indian Cities in city_information: ${indianCities.size}`);
console.log(`Unique Indian States in city_information: ${indianStates.size}`);
console.log(`Indian Zones: ${Array.from(indianZones).join(', ')}`);

const placeCities = new Set(places.map(p => p.city.trim()).filter(Boolean));
const placeTypes = new Set(places.map(p => p.place_type.trim()).filter(Boolean));
console.log(`Unique Cities in tourist_places: ${placeCities.size}`);
console.log(`Unique Place Types in tourist_places: ${placeTypes.size} (e.g. ${Array.from(placeTypes).slice(0, 8).join(', ')})`);

const foodCities = new Set(food.map(f => f.city.trim()).filter(Boolean));
const foodTypes = new Set(food.map(f => f.recommendation_type.trim()).filter(Boolean));
const meals = new Set(food.map(f => f.meal.trim()).filter(Boolean));
console.log(`Unique Cities in food_recommendations: ${foodCities.size}`);
console.log(`Food recommendation types: ${Array.from(foodTypes).join(', ')}`);
console.log(`Meal categories: ${Array.from(meals).join(', ')}`);

const globalCountries = new Set(globalDest.map(g => g.Country.trim()).filter(Boolean));
const globalContinents = new Set(globalDest.map(g => g.Continent.trim()).filter(Boolean));
const globalTypes = new Set(globalDest.map(g => g.Type.trim()).filter(Boolean));
const unescoCount = globalDest.filter(g => (g['UNESCO Site'] || '').toLowerCase() === 'yes').length;
console.log(`Unique Countries in Tourist_Destinations: ${globalCountries.size}`);
console.log(`Continents in Tourist_Destinations: ${Array.from(globalContinents).join(', ')}`);
console.log(`Global Destination Types: ${Array.from(globalTypes).join(', ')}`);
console.log(`UNESCO World Heritage Sites in Tourist_Destinations: ${unescoCount}`);

const plannerCountries = new Set(planner.map(p => p.Country.trim()).filter(Boolean));
const plannerDestinations = new Set(planner.map(p => p.Destination_Name.trim()).filter(Boolean));
const plannerStartingPoints = new Set(planner.map(p => p.Starting_Point.trim()).filter(Boolean));
const plannerCurrencies = new Set(planner.map(p => p.Local_Currency.trim()).filter(Boolean));
console.log(`Unique Countries in Travel_Planner_Dataset: ${plannerCountries.size}`);
console.log(`Unique Destinations in Travel_Planner_Dataset: ${plannerDestinations.size}`);
console.log(`Origin / Starting Points: ${Array.from(plannerStartingPoints).join(', ')}`);
console.log(`Local Currencies supported in Travel_Planner: ${Array.from(plannerCurrencies).join(', ')}`);

// Total unique destinations count
const allUniqueNamedDestinations = new Set([
  ...cityInfo.map(r => r.city.trim()),
  ...places.map(p => p.place_name.trim()),
  ...globalDest.map(g => g['Destination Name'].trim()),
  ...planner.map(p => p.Destination_Name.trim()),
]);
console.log(`\nTOTAL UNIQUE NAMED DESTINATIONS & ATTRACTIONS ACROSS ALL FILES: ${allUniqueNamedDestinations.size}`);
