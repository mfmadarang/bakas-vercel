"""
Pydantic schemas for request and response validation.

These define the shape of data going in and out of the API.
Pydantic v2 validates types automatically — if someone sends a string
where we expect an int, FastAPI returns a 422 error without us writing
any validation logic.
"""

from datetime import datetime

from pydantic import BaseModel, Field


class FingerprintSubmission(BaseModel):
    """What the frontend sends when the user opts in to comparison."""

    hash: str = Field(..., min_length=16, max_length=128)
    canvas_hash: str
    webgl_hash: str
    audio_hash: str
    font_count: int = Field(..., ge=0)
    screen_resolution: str  # e.g. "1920x1080"
    color_depth: int = Field(..., ge=1)
    device_pixel_ratio: float = Field(..., gt=0)
    hardware_concurrency: int = Field(..., ge=1)
    device_memory: float | None = None  # null if browser blocks it
    timezone: str
    touch_points: int = Field(..., ge=0)
    platform: str
    language: str


class FingerprintResponse(BaseModel):
    """What the backend returns after a fingerprint submission."""

    is_new: bool
    total_count: int
    percentile: float  # 0.0 to 100.0

    model_config = {"from_attributes": True}


class StatsResponse(BaseModel):
    """Aggregate stats shown on the homepage."""

    total_fingerprints: int
    most_common_timezone: str | None
    most_common_platform: str | None
    most_common_resolution: str | None
    mobile_percentage: float  # 0.0 to 100.0
    unique_percentage: float  # percentage of fingerprints that appear only once
