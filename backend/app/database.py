"""
Database setup for bakas.

Uses SQLite because this project only needs to store opt-in fingerprint
submissions and compute basic stats. No need for PostgreSQL or anything heavier.
SQLAlchemy handles the ORM layer so we don't write raw SQL everywhere.
"""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bakas.db")

# check_same_thread=False is needed for SQLite + FastAPI because FastAPI
# handles requests in different threads, but SQLite by default only allows
# the thread that created the connection to use it.
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


def get_db():
    """
    Dependency that provides a database session to FastAPI route handlers.
    The session is automatically closed after the request finishes,
    even if an error occurred.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
