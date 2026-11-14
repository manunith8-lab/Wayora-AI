import csv, json

with open('e:/Wayora.ai/india_tourism_foundation/tourist_attractions.csv', encoding='utf-8') as f:
    r = list(csv.DictReader(f))

attractions = []
for x in r:
    attractions.append({
        'id': x['attraction_id'],
        'name': x['name'],
        'state_id': x['state_id'],
        'district_id': x['district_id'],
        'category': x['category'],
        'nearest_town': x['nearest_town'],
        'lat': float(x['latitude']),
        'lon': float(x['longitude']),
        'climate_zone': x['climate_zone_id'],
        'best_months': x['best_months'],
        'avoid_months': x['avoid_months'],
        'season_reason': x['season_reason']
    })

with open('e:/Wayora.ai/india_tourism_foundation/attractions_seed.json', 'w', encoding='utf-8') as f:
    json.dump(attractions, f, indent=2, ensure_ascii=False)

print(f"Exported {len(attractions)} attractions to attractions_seed.json")
