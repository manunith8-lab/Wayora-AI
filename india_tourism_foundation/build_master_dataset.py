"""
Build Master Dataset for India Tourism Database
Generates complete, verified, release-grade CSVs, JSON, and audit report.
"""

import csv
import json
import math
import os
import re
import collections
from geo_data import AIRPORTS, RAILWAY_STATIONS, STATE_CAPITALS

D = os.path.dirname(os.path.abspath(__file__))
TODAY = "2026-11-14"

def hav(lat1, lon1, lat2, lon2):
    p = math.pi / 180.0
    x = math.sin((lat2 - lat1) * p / 2.0) ** 2 + math.cos(lat1 * p) * math.cos(lat2 * p) * math.sin((lon2 - lon1) * p / 2.0) ** 2
    return round(2.0 * 6371.0 * math.asin(math.sqrt(x)), 2)

slug = lambda s: re.sub(r"[^A-Z0-9]+", "_", s.upper()).strip("_")[:28]

def rd(n):
    with open(os.path.join(D, n), encoding="utf-8") as f:
        return list(csv.DictReader(f))

def w(n, rows, cols):
    with open(os.path.join(D, n), "w", newline="", encoding="utf-8") as f:
        wr = csv.DictWriter(f, fieldnames=cols)
        wr.writeheader()
        for r in rows:
            wr.writerow({c: ("" if r.get(c) is None else str(r.get(c)).strip()) for c in cols})

print("Geo data loaded: Airports:", len(AIRPORTS), "Railways:", len(RAILWAY_STATIONS), "Capitals:", len(STATE_CAPITALS))
