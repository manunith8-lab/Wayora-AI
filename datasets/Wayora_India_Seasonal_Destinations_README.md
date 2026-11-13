# Wayora India Seasonal Destinations Dataset

This is a curated starter dataset of Indian destinations and major attractions, intended to improve Wayora's destination discovery, season-aware recommendations, budget estimates and image selection.

## Files
- `Wayora_India_Seasonal_Destinations.csv` — structured destination records.

## Season labels used
- Winter: December–February
- Summer: March–June
- Monsoon: July–September
- Autumn: October–November
- Post-monsoon: a descriptive transition label used in some records; it is not a fifth official season.

India has major regional climate differences. Do not assume that every place is suitable in the same way throughout a named season. Always use each record's recommended months and seasonal cautions.

## Budget fields
The two budget columns are indicative per-person, per-day costs in INR while at the destination. They exclude travel to and from the destination. They are planning estimates, not live prices or guarantees. Transport, accommodation, meals, permits, activities, holidays and season can change the actual cost substantially.

## Important safety and freshness rules
- Never promise that a place, road, trek, safari, ferry, cable car or attraction is open.
- Check official/current sources for weather warnings, landslides, floods, snow, permits, safari dates, ferry operations, entry fees and closures.
- High-altitude destinations require acclimatisation and may have access restrictions.
- Monsoon recommendations must include safety caveats where heavy rain, flash floods, rough seas or landslides are possible.
- Wildlife sightings are never guaranteed.

## Image matching rules
Use `image_search_query` and `image_category` as semantic guidance, not as permission to use any vaguely related image. The image must depict the exact destination or a clearly relevant landmark/landscape. For example, Munnar must use Munnar's tea plantations, rolling Western Ghats hills, valleys or waterfalls—not a generic Kerala city, skyline or unrelated urban photograph.

Prefer licensed/official or reliable image sources and retain source URL, creator/attribution and licence where applicable. If no trustworthy matching image is found, show no image rather than a misleading one.

## Scope and limitations
This is a broad curated starter dataset, not an exhaustive inventory of every tourist spot in India. Treat it as a seed dataset and expand it with verified records. Do not invent destination facts, costs, access status or image sources.