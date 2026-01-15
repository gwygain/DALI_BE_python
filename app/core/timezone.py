"""
Timezone utilities for Philippine Time (UTC+8)
"""
from datetime import datetime, timezone, timedelta

# Philippine timezone (UTC+8)
PHILIPPINE_TZ = timezone(timedelta(hours=8))

def get_philippine_time():
    """Get current time in Philippine timezone"""
    return datetime.now(PHILIPPINE_TZ).replace(tzinfo=None)

def utc_to_philippine(utc_time):
    """Convert UTC time to Philippine time"""
    if utc_time is None:
        return None
    if utc_time.tzinfo is None:
        # Assume it's UTC if no timezone info
        utc_time = utc_time.replace(tzinfo=timezone.utc)
    return utc_time.astimezone(PHILIPPINE_TZ).replace(tzinfo=None)
