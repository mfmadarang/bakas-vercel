"""create fingerprints table

Revision ID: 001
Revises:
Create Date: 2025-01-01 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "fingerprints",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("hash", sa.String(), nullable=False),
        sa.Column("canvas_hash", sa.String(), nullable=False),
        sa.Column("webgl_hash", sa.String(), nullable=False),
        sa.Column("audio_hash", sa.String(), nullable=False),
        sa.Column("font_count", sa.Integer(), nullable=False),
        sa.Column("screen_resolution", sa.String(), nullable=False),
        sa.Column("color_depth", sa.Integer(), nullable=False),
        sa.Column("device_pixel_ratio", sa.Float(), nullable=False),
        sa.Column("hardware_concurrency", sa.Integer(), nullable=False),
        sa.Column("device_memory", sa.Float(), nullable=True),
        sa.Column("timezone", sa.String(), nullable=False),
        sa.Column("touch_points", sa.Integer(), nullable=False),
        sa.Column("platform", sa.String(), nullable=False),
        sa.Column("language", sa.String(), nullable=False),
        sa.Column("submitted_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_fingerprints_hash", "fingerprints", ["hash"], unique=True)


def downgrade():
    op.drop_index("ix_fingerprints_hash", table_name="fingerprints")
    op.drop_table("fingerprints")
