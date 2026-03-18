"""
API routes for fingerprint submissions and stats.

Two endpoints:
  POST /api/fingerprints — submit an opt-in fingerprint
  GET  /api/fingerprints/stats — get aggregate stats for the homepage
"""

from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from app.database import get_db
from app.models import Fingerprint
from app.schemas import FingerprintSubmission, FingerprintResponse, StatsResponse

router = APIRouter(prefix="/api/fingerprints", tags=["fingerprints"])


def calculate_percentile(db: Session, fingerprint: Fingerprint) -> float:
    """
    Calculate how unique this fingerprint is compared to others in the database.

    The approach is simple: count how many stored fingerprints share the same
    screen resolution + platform combination (a rough "similarity" group).
    If very few others share that combo, this fingerprint is more unique.

    Returns a percentile from 0 to 100 — higher means more unique.
    """
    total = db.query(func.count(Fingerprint.id)).scalar() or 1

    # Count fingerprints that share this exact resolution + platform combo
    same_combo = db.query(func.count(Fingerprint.id)).filter(
        Fingerprint.screen_resolution == fingerprint.screen_resolution,
        Fingerprint.platform == fingerprint.platform,
    ).scalar() or 0

    # If you're in a big group, you're less unique.
    # If you're in a small group (or alone), you're more unique.
    similarity_ratio = same_combo / total

    # Invert: high similarity = low percentile, low similarity = high percentile
    percentile = (1.0 - similarity_ratio) * 100.0

    return round(percentile, 1)


@router.post("", response_model=FingerprintResponse)
def submit_fingerprint(submission: FingerprintSubmission, db: Session = Depends(get_db)):
    """
    Submit an anonymized fingerprint to the database.

    If the hash already exists, we just return the stats without inserting a duplicate.
    If it's new, we insert it and return updated stats.
    """
    # Check if this fingerprint hash was already submitted
    existing = db.query(Fingerprint).filter(Fingerprint.hash == submission.hash).first()

    if existing:
        total = db.query(func.count(Fingerprint.id)).scalar() or 1
        percentile = calculate_percentile(db, existing)
        return FingerprintResponse(is_new=False, total_count=total, percentile=percentile)

    # New fingerprint — insert it
    new_fp = Fingerprint(
        hash=submission.hash,
        canvas_hash=submission.canvas_hash,
        webgl_hash=submission.webgl_hash,
        audio_hash=submission.audio_hash,
        font_count=submission.font_count,
        screen_resolution=submission.screen_resolution,
        color_depth=submission.color_depth,
        device_pixel_ratio=submission.device_pixel_ratio,
        hardware_concurrency=submission.hardware_concurrency,
        device_memory=submission.device_memory,
        timezone=submission.timezone,
        touch_points=submission.touch_points,
        platform=submission.platform,
        language=submission.language,
    )
    db.add(new_fp)
    db.commit()
    db.refresh(new_fp)

    total = db.query(func.count(Fingerprint.id)).scalar() or 1
    percentile = calculate_percentile(db, new_fp)

    return FingerprintResponse(is_new=True, total_count=total, percentile=percentile)


@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    """
    Return aggregate statistics for the homepage stats ticker.

    All queries are straightforward GROUP BY + COUNT operations on SQLite.
    Nothing fancy — just counting and grouping.
    """
    total = db.query(func.count(Fingerprint.id)).scalar() or 0

    if total == 0:
        return StatsResponse(
            total_fingerprints=0,
            most_common_timezone=None,
            most_common_platform=None,
            most_common_resolution=None,
            mobile_percentage=0.0,
            unique_percentage=0.0,
        )

    # Most common timezone — group by timezone, order by count descending, take first
    most_common_tz = (
        db.query(Fingerprint.timezone)
        .group_by(Fingerprint.timezone)
        .order_by(func.count(Fingerprint.id).desc())
        .first()
    )

    # Most common platform
    most_common_plat = (
        db.query(Fingerprint.platform)
        .group_by(Fingerprint.platform)
        .order_by(func.count(Fingerprint.id).desc())
        .first()
    )

    # Most common screen resolution
    most_common_res = (
        db.query(Fingerprint.screen_resolution)
        .group_by(Fingerprint.screen_resolution)
        .order_by(func.count(Fingerprint.id).desc())
        .first()
    )

    # Mobile percentage — touch_points > 0 is a rough proxy for mobile/tablet
    mobile_count = db.query(func.count(Fingerprint.id)).filter(
        Fingerprint.touch_points > 0
    ).scalar() or 0
    mobile_pct = (mobile_count / total) * 100.0

    # Unique percentage — fingerprints whose hash appears exactly once
    # (which should be all of them since hash is unique, but this measures
    # how many resolution+platform combos appear only once)
    unique_combos = (
        db.query(Fingerprint.screen_resolution, Fingerprint.platform)
        .group_by(Fingerprint.screen_resolution, Fingerprint.platform)
        .having(func.count(Fingerprint.id) == 1)
        .count()
    )
    total_combos = (
        db.query(Fingerprint.screen_resolution, Fingerprint.platform)
        .group_by(Fingerprint.screen_resolution, Fingerprint.platform)
        .count()
    )
    unique_pct = (unique_combos / max(total_combos, 1)) * 100.0

    return StatsResponse(
        total_fingerprints=total,
        most_common_timezone=most_common_tz[0] if most_common_tz else None,
        most_common_platform=most_common_plat[0] if most_common_plat else None,
        most_common_resolution=most_common_res[0] if most_common_res else None,
        mobile_percentage=round(mobile_pct, 1),
        unique_percentage=round(unique_pct, 1),
    )
