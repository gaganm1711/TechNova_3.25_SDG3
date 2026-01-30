"""Simple rule-based priority engine.
Assigns a severity score and chooses the hospital minimizing a score that factors:
- symptom severity
- ICU availability
- distance (approx Haversine)
"""
from math import radians, sin, cos, sqrt, atan2

SYMPTOM_SEVERITY = {
    'cardiac': 10,
    'stroke': 9,
    'severe_bleeding': 8,
    'breathing_difficulty': 8,
    'unconscious': 9,
    'fracture': 3,
    'fever': 2,
    'unknown': 5,
}


def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1))*cos(radians(lat2))*sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c


def symptom_severity(symptoms: str) -> int:
    # simple heuristic: check keywords
    s = symptoms.lower()
    for k, v in SYMPTOM_SEVERITY.items():
        if k in s:
            return v
    return SYMPTOM_SEVERITY['unknown']


def select_best_hospital(emergency, hospitals):
    sev = symptom_severity(emergency.symptoms)
    best = None
    best_score = 1e9
    for h in hospitals:
        dist_km = haversine(emergency.lat, emergency.lon, h.lat, h.lon)
        # prefer hospitals with ICU if severity high
        icu_factor = 0.5 if h.icu_available > 0 else 1.0
        # bed availability factor
        bed_factor = 0.7 if h.beds_available > 0 else 1.2
        # severity increases weight of needing ICU
        score = dist_km * (1 + (10 - sev)/10) * icu_factor * bed_factor
        # penalize no ICU for critical cases
        if sev >= 8 and h.icu_available == 0:
            score *= 2.0
        if score < best_score:
            best_score = score
            best = h
    return best
