"""
Alembic migration environment.

This file tells Alembic where to find our models and database connection.
When you run `alembic revision --autogenerate`, it compares our SQLAlchemy
models against the actual database schema and generates migration scripts.
"""

import sys
from pathlib import Path

# Alembic doesn't add the project root to sys.path automatically,
# so Python can't find our `app` package without this.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.database import Base
from app.models import Fingerprint  # noqa: F401 — imported so Alembic sees it

config = context.config
fileConfig(config.config_file_name)

# This is what Alembic compares against the database to detect changes
target_metadata = Base.metadata


def run_migrations_offline():
    """Run migrations without a live database connection (generates SQL only)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations with a live database connection (applies changes directly)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
