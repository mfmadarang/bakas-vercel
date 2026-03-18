"""
SQLAlchemy models for bakas.

Only one table: Fingerprint. Stores the anonymized summary of each opt-in
fingerprint submission. We deliberately do NOT store raw user agents, IP
addresses, or anything that could re-identify a specific person.
"""

from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Fingerprint(Base):
    __tablename__ = "fingerprints"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # The SHA-256 hash of the full fingerprint data — this is the unique ID.
    # Indexed for fast lookups when checking if a fingerprint already exists.
    hash: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)

    # Hashes of individual fingerprint components.
    # These are already hashed on the client side — we never see the raw data.
    canvas_hash: Mapped[str] = mapped_column(String, nullable=False)
    webgl_hash: Mapped[str] = mapped_column(String, nullable=False)
    audio_hash: Mapped[str] = mapped_column(String, nullable=False)

    # Summary fields — anonymized metadata, not raw values
    font_count: Mapped[int] = mapped_column(Integer, nullable=False)
    screen_resolution: Mapped[str] = mapped_column(String, nullable=False)  # e.g. "1920x1080"
    color_depth: Mapped[int] = mapped_column(Integer, nullable=False)
    device_pixel_ratio: Mapped[float] = mapped_column(Float, nullable=False)
    hardware_concurrency: Mapped[int] = mapped_column(Integer, nullable=False)

    # Nullable because Firefox blocks navigator.deviceMemory
    device_memory: Mapped[float | None] = mapped_column(Float, nullable=True)

    timezone: Mapped[str] = mapped_column(String, nullable=False)
    touch_points: Mapped[int] = mapped_column(Integer, nullable=False)
    platform: Mapped[str] = mapped_column(String, nullable=False)
    language: Mapped[str] = mapped_column(String, nullable=False)

    submitted_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
