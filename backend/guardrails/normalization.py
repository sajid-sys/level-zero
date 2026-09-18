import re
from typing import List, Optional


def parse_time_window(text: str) -> Optional[List[int]]:
    """
    Extracts hours as half-open interval [start, end) -> list of integer hours.
    Correctly interprets AM/PM and 24-hour formats.
    e.g. '11 AM to 2 PM' -> [11, 12, 13]
         '13:00 to 15:00' -> [13, 14]
         'between 18:00 and 22:00' -> [18, 19, 20, 21]
         'from 2 AM to 5 AM' -> [2, 3, 4]
    """
    # 1. Look for patterns like "11 AM to 2 PM" or "11:00 AM to 2:00 PM"
    am_pm_pattern = re.search(
        r'(?:between|from)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*(?:to|and|-)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)',
        text, re.IGNORECASE
    )
    if am_pm_pattern:
        h1 = int(am_pm_pattern.group(1))
        mer1 = am_pm_pattern.group(3).lower()
        h2 = int(am_pm_pattern.group(4))
        mer2 = am_pm_pattern.group(6).lower()

        if mer1 == 'pm' and h1 != 12:
            h1 += 12
        elif mer1 == 'am' and h1 == 12:
            h1 = 0

        if mer2 == 'pm' and h2 != 12:
            h2 += 12
        elif mer2 == 'am' and h2 == 12:
            h2 = 0

        if 0 <= h1 < h2 <= 24:
            return list(range(h1, h2))

    # 2. Look for patterns like "13:00 to 15:00" or "09:00 and 12:00" or "13:00 - 15:00"
    colon_pattern = re.search(
        r'(?:between|from)?\s*(\d{1,2}):\d{2}\s*(?:to|and|-)\s*(\d{1,2}):\d{2}',
        text, re.IGNORECASE
    )
    if colon_pattern:
        h1 = int(colon_pattern.group(1))
        h2 = int(colon_pattern.group(2))
        if 0 <= h1 < h2 <= 24:
            return list(range(h1, h2))

    # 3. Look for "hours 13 to 15" or "hours 13-15" or "from 13 to 15" or "between 18 and 22"
    hours_pattern = re.search(
        r'(?:hours?|between|from)\s+(\d{1,2})\s*(?:to|and|-)\s*(\d{1,2})',
        text, re.IGNORECASE
    )
    if hours_pattern:
        h1 = int(hours_pattern.group(1))
        h2 = int(hours_pattern.group(2))
        if 0 <= h1 < h2 <= 24:
            return list(range(h1, h2))

    # 4. Explicit list of hours: "hours 11, 12, 13"
    list_pattern = re.findall(r'hour\s+(\d{1,2})', text, re.IGNORECASE)
    if list_pattern:
        hours = sorted(list(set(int(x) for x in list_pattern if 0 <= int(x) <= 23)))
        if hours:
            return hours

    return None


def parse_solar_factor(text: str) -> Optional[float]:
    """
    Extracts solar factor (remaining fraction in [0.0, 1.0]).
    e.g. '80% reduction' -> 0.2
         'reduction of 60%' -> 0.4
         'drop to 20% capacity' -> 0.2
         'reduced by 75%' -> 0.25
         'cut by 50%' -> 0.5
         'drop by 30%' -> 0.7
         'down to 25% capacity' -> 0.25
    """
    # "drop to 20%" or "reduced to 20%" or "down to 25%"
    drop_to = re.search(r'(?:drop|dropped|reduced|decrease|down)\s+(?:to|down to)\s+(\d{1,3})%', text, re.IGNORECASE)
    if drop_to:
        pct = float(drop_to.group(1))
        return max(0.0, min(1.0, round(pct / 100.0, 4)))

    # "only 20% solar available" or "at 20% capacity"
    only_pct = re.search(r'(?:only|at|remains|remaining)\s+(\d{1,3})%', text, re.IGNORECASE)
    if only_pct:
        pct = float(only_pct.group(1))
        return max(0.0, min(1.0, round(pct / 100.0, 4)))

    # "80% reduction" or "reduced by 80%" or "drop by 80%" or "80% drop"
    reduction = re.search(r'(\d{1,3})%\s*(?:reduction|decrease|drop|cut|loss)', text, re.IGNORECASE)
    if reduction:
        pct = float(reduction.group(1))
        return max(0.0, min(1.0, round((100.0 - pct) / 100.0, 4)))

    by_reduction = re.search(r'(?:reduced|decrease|drop|cut)\s+by\s+(\d{1,3})%', text, re.IGNORECASE)
    if by_reduction:
        pct = float(by_reduction.group(1))
        return max(0.0, min(1.0, round((100.0 - pct) / 100.0, 4)))

    return None


def parse_battery_reserve(text: str) -> Optional[float]:
    """
    Extracts minimum battery reserve in kWh.
    """
    match = re.search(r'(?:reserve|minimum|maintain|at least|keep)\s+(?:battery\s+)?(?:energy\s+of\s+|reserve\s+of\s+|at least\s+)?(\d+(?:\.\d+)?)\s*kwh', text, re.IGNORECASE)
    if match:
        return float(match.group(1))
    
    simple = re.search(r'(\d+(?:\.\d+)?)\s*kwh\s*(?:reserve|minimum|battery)', text, re.IGNORECASE)
    if simple:
        return float(simple.group(1))
        
    return None


def parse_max_grid(text: str) -> Optional[float]:
    """
    Extracts maximum grid import limit in kWh / kW.
    """
    match = re.search(r'(?:grid|import)\s*(?:import\s*)?(?:capped|limited|limit|max|maximum|cap)?\s*(?:at|to|of)?\s*(\d+(?:\.\d+)?)\s*(?:kwh|kw)', text, re.IGNORECASE)
    if match:
        return float(match.group(1))
    
    cap_near = re.search(r'(?:cap|limit|maximum)\s+(?:grid\s+import\s+to\s+|grid\s+import\s+of\s+)?(\d+(?:\.\d+)?)\s*(?:kwh|kw)', text, re.IGNORECASE)
    if cap_near:
        return float(cap_near.group(1))
        
    return None
