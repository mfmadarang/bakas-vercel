"""
bakas — Browser Fingerprint Analyzer API

This is the backend for bakas. It does two things:
1. Stores opt-in anonymized fingerprint submissions
2. Returns aggregate stats (total fingerprints, most common values, percentiles)

The frontend works fully without this backend running. This is purely additive —
it only adds the "compare your fingerprint to others" feature.
"""

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import fingerprints

load_dotenv()

app = FastAPI(
    title="bakas API",
    description="Browser fingerprint comparison backend for bakas",
    version="1.0.0",
)

# CORS — allow the Nuxt dev server to talk to this API.
# Update CORS_ORIGIN when deploying to a real domain, e.g.:
#   CORS_ORIGIN=https://bakas.yourdomain.com
cors_origin = os.getenv("CORS_ORIGIN", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[cors_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(fingerprints.router)


@app.get("/")
def root():
    """Health check — just confirms the API is running."""
    return {"status": "ok", "app": "bakas"}
