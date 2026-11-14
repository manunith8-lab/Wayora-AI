"""
Generates rich, factual data for all 341 attractions in the database plus 5 Malappuram attractions.
Ensures zero missing release-critical fields.
"""

import json
import csv
import re

with open('e:/Wayora.ai/india_tourism_foundation/attractions_seed.json', encoding='utf-8') as f:
    seed = json.load(f)

# Also load tourist_places.csv to cross-reference entrance fees, ratings, timings, weekly off
tp_map = {}
with open('e:/Wayora.ai/datasets/tourist_places.csv', encoding='utf-8', errors='ignore') as f:
    for row in csv.DictReader(f):
        name_clean = re.sub(r'[^a-z0-9]', '', row['place_name'].lower())
        tp_map[name_clean] = row

# State official portals
STATE_PORTALS = {
    "ST_AP": "https://tourism.ap.gov.in",
    "ST_AR": "https://arunachaltourism.com",
    "ST_AS": "https://assamtourism.gov.in",
    "ST_BR": "https://tourism.bihar.gov.in",
    "ST_CG": "https://www.chhattisgarhtourism.in",
    "ST_GA": "https://goatourism.gov.in",
    "ST_GJ": "https://www.gujarattourism.com",
    "ST_HR": "https://haryanatourism.gov.in",
    "ST_HP": "https://himachaltourism.gov.in",
    "ST_JH": "https://tourism.jharkhand.gov.in",
    "ST_KA": "https://karnatakatourism.org",
    "ST_KL": "https://www.keralatourism.org",
    "ST_MP": "https://www.mptourism.com",
    "ST_MH": "https://www.maharashtratourism.gov.in",
    "ST_MN": "https://manipurtourism.gov.in",
    "ST_ML": "https://www.meghalayatourism.in",
    "ST_MZ": "https://tourism.mizoram.gov.in",
    "ST_NL": "https://tourism.nagaland.gov.in",
    "ST_OD": "https://odishatourism.gov.in",
    "ST_PB": "https://punjabtourism.punjab.gov.in",
    "ST_RJ": "https://www.tourism.rajasthan.gov.in",
    "ST_SK": "https://sikkimtourism.gov.in",
    "ST_TN": "https://www.tamilnadutourism.tn.gov.in",
    "ST_TS": "https://tourism.telangana.gov.in",
    "ST_TR": "https://tripuratourism.gov.in",
    "ST_UP": "https://www.uptourism.gov.in",
    "ST_UK": "https://uttarakhandtourism.gov.in",
    "ST_WB": "https://wbtourism.gov.in",
    "ST_AN": "https://www.andamantourism.gov.in",
    "ST_CH": "https://chandigarhtourism.gov.in",
    "ST_DH": "https://www.tourismdddnh.in",
    "ST_DL": "https://delhitourism.gov.in",
    "ST_JK": "https://www.jktourism.jk.gov.in",
    "ST_LA": "https://ladakhtourism.gov.in",
    "ST_LD": "https://lakshadweeptourism.nic.in",
    "ST_PY": "https://pondytourism.in",
}

print(f"Loaded {len(seed)} seed attractions and {len(tp_map)} tourist place records.")
