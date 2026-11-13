# Advanced Indian Tourism Dataset (cleaned working version)

## Contents
- `tourist_places.csv`: normalized tourist-attraction records.
- `city_information.csv`: city-level descriptions, ratings, seasonality, and availability flags.
- `food_recommendations.csv`: long-format tourist attraction and food recommendations.
- `dataset_sources.csv`: source registry; exact original URLs, creators, and licenses still need verification.
- `data_quality_report.csv`: record counts and cleaning summary.

## Cleaning performed
1. Removed the source-generated `Unnamed: 0` index column from the tourist-place file.
2. Standardized column names to lowercase snake_case.
3. Trimmed whitespace and normalized numeric columns.
4. Removed duplicate tourist-place records using normalized city + place name.
5. Converted the city-wide food/attraction columns into one recommendation per row.
6. Removed repeated recommendations within the same city and recommendation type.
7. Removed repeated city records from the Holidify file using normalized city names.
8. Built a city master table and joined information only where normalized city names matched.

## Important limitations and responsible use
- Latitude/longitude, opening hours, and route distances are not supplied by these three files; they have not been fabricated.
- Ratings, fees, review counts, and seasonal information are retained as supplied and have not been independently verified.
- The exact original dataset page URLs, creator names, and licenses must be filled in from the source pages before publication or academic redistribution.
- Check the reuse license and terms for each source. In particular, verify permission and attribution requirements for the Holidify-derived file before republishing it.
- This is a cleaned research working dataset, not a claim that all source information is complete or independently verified.
