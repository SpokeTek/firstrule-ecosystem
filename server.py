from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
import base64
import sys
from datetime import datetime
from dotenv import load_dotenv
from typing import Optional

# Load environment variables
load_dotenv()

# Fix Windows console encoding
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except:
        pass


def safe_print(message):
    """Print with safe encoding for Windows console"""
    try:
        print(message)
    except (UnicodeEncodeError, UnicodeDecodeError):
        # Fallback to ASCII-safe representation
        try:
            safe_message = str(message).encode('ascii', errors='replace').decode('ascii')
            print(safe_message)
        except:
            # Ultimate fallback - just print a generic message
            print("[Message contains characters that cannot be displayed]")

app = FastAPI(title="First Rule OpenPlay Proxy API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:8081",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenPlay API Configuration
OPENPLAY_BASE_URL = "https://newwest.opstaging.com/connect/v2"
OPENPLAY_API_KEY = os.getenv("OPENPLAY_API_KEY", "IDGWJJZ69P")
OPENPLAY_SECRET_KEY = os.getenv("OPENPLAY_SECRET_KEY", "dd02e91c-e7de-47b2-9524-8eb5dcde4ee2")


def get_auth_headers() -> dict:
    """Generate Basic Auth headers for OpenPlay API"""
    auth_string = f"{OPENPLAY_API_KEY}:{OPENPLAY_SECRET_KEY}"
    auth_bytes = base64.b64encode(auth_string.encode()).decode()
    return {
        "Authorization": f"Basic {auth_bytes}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "OK", "timestamp": datetime.utcnow().isoformat()}


# OpenPlay API proxy endpoints
@app.get("/api/openplay/artists")
async def get_artists(
    search: Optional[str] = Query(None),
    limit: Optional[int] = Query(None),
    page: Optional[int] = Query(None)
):
    """Proxy endpoint for fetching artists from OpenPlay API"""
    try:
        # Build query parameters
        params = {}
        if search:
            params["q"] = search  # Use 'q' instead of 'search'
        if limit:
            params["limit"] = limit
        if page:
            params["page"] = page

        async with httpx.AsyncClient(timeout=30.0) as client:
            # Try both endpoint variations
            url = f"{OPENPLAY_BASE_URL}/artists/"
            safe_print(f"Proxying request to: {url}")

            try:
                response = await client.get(url, params=params, headers=get_auth_headers())
                
                if response.status_code != 200:
                    try:
                        error_text = response.text.encode('ascii', errors='replace').decode('ascii')[:200]
                    except:
                        error_text = "Error response contains unprintable characters"
                    safe_print(f"OpenPlay API Error: {response.status_code} {response.reason_phrase}")

                    # Try alternative endpoint without trailing slash
                    if response.status_code == 400:
                        safe_print(f"Trying alternative endpoint without trailing slash...")
                        alt_url = f"{OPENPLAY_BASE_URL}/artists"
                        safe_print(f"Proxying to alternative: {alt_url}")

                        alt_response = await client.get(alt_url, params=params, headers=get_auth_headers())

                        if alt_response.status_code == 200:
                            alt_data = alt_response.json()
                            safe_print(f"OpenPlay API Success with alternative endpoint")
                            return alt_data
                        else:
                            safe_print(f"Alternative endpoint also failed: {alt_response.status_code} {alt_response.reason_phrase}")

                            # Try the original base URL as a last resort
                            safe_print(f"Trying original base URL...")
                            fallback_url = f"{OPENPLAY_BASE_URL}/artists"
                            safe_print(f"Proxying to fallback: {fallback_url}")

                            fallback_response = await client.get(fallback_url, params=params, headers=get_auth_headers())

                            if fallback_response.status_code == 200:
                                fallback_data = fallback_response.json()
                                safe_print(f"OpenPlay API Success with fallback URL")
                                return fallback_data
                            else:
                                safe_print(f"Fallback URL also failed: {fallback_response.status_code} {fallback_response.reason_phrase}")

                    raise HTTPException(
                        status_code=response.status_code,
                        detail={
                            "error": f"OpenPlay API error: {response.status_code} {response.reason_phrase}",
                            "details": error_text
                        }
                    )

                data = response.json()
                safe_print(f"OpenPlay API Success")
                return data

            except httpx.HTTPError as e:
                error_msg = str(e).encode('ascii', errors='replace').decode('ascii')[:100]
                safe_print(f"HTTP Error: {error_msg}")
                raise HTTPException(status_code=500, detail={"error": "HTTP request failed", "details": error_msg})

    except Exception as error:
        try:
            error_msg = str(error).encode('ascii', errors='replace').decode('ascii')[:100]
        except:
            error_msg = "Error message contains unprintable characters"
        safe_print(f"Proxy Error: {error_msg}")
        raise HTTPException(
            status_code=500,
            detail={"error": "Internal server error", "details": error_msg}
        )


@app.get("/api/openplay/artists/{artist_id}")
async def get_artist(artist_id: str):
    """Proxy endpoint for fetching a specific artist from OpenPlay API"""
    try:
        url = f"{OPENPLAY_BASE_URL}/artists/{artist_id}"
        safe_print(f"Proxying request to: {url}")

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=get_auth_headers())

            if response.status_code != 200:
                try:
                    error_text = response.text.encode('ascii', errors='replace').decode('ascii')[:200]
                except:
                    error_text = "Error response contains unprintable characters"
                safe_print(f"OpenPlay API Error: {response.status_code} {response.reason_phrase}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail={
                        "error": f"OpenPlay API error: {response.status_code} {response.reason_phrase}",
                        "details": error_text
                    }
                )

            data = response.json()
            safe_print(f"OpenPlay API Success")
            return data

    except httpx.HTTPError as error:
        try:
            error_msg = str(error).encode('ascii', errors='replace').decode('ascii')[:100]
        except:
            error_msg = "Error message contains unprintable characters"
        safe_print(f"Proxy Error: {error_msg}")
        raise HTTPException(
            status_code=500,
            detail={"error": "Internal server error", "details": error_msg}
        )


@app.get("/api/openplay/releases")
async def get_releases(
    search: Optional[str] = Query(None),
    limit: Optional[int] = Query(None),
    page: Optional[int] = Query(None),
    artistId: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to")
):
    """Proxy endpoint for fetching releases from OpenPlay API"""
    try:
        # Build query parameters
        params = {}
        if search:
            params["search"] = search
        if limit:
            params["limit"] = limit
        if page:
            params["page"] = page
        if artistId:
            params["artistId"] = artistId
        if type:
            params["type"] = type
        if from_date:
            params["from"] = from_date
        if to_date:
            params["to"] = to_date

        url = f"{OPENPLAY_BASE_URL}/releases"
        safe_print(f"Proxying request to: {url}")

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params, headers=get_auth_headers())

            if response.status_code != 200:
                try:
                    error_text = response.text.encode('ascii', errors='replace').decode('ascii')[:200]
                except:
                    error_text = "Error response contains unprintable characters"
                safe_print(f"OpenPlay API Error: {response.status_code} {response.reason_phrase}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail={
                        "error": f"OpenPlay API error: {response.status_code} {response.reason_phrase}",
                        "details": error_text
                    }
                )

            data = response.json()
            safe_print(f"OpenPlay API Success")
            return data

    except httpx.HTTPError as error:
        try:
            error_msg = str(error).encode('ascii', errors='replace').decode('ascii')[:100]
        except:
            error_msg = "Error message contains unprintable characters"
        safe_print(f"Proxy Error: {error_msg}")
        raise HTTPException(
            status_code=500,
            detail={"error": "Internal server error", "details": error_msg}
        )


@app.get("/api/openplay/tracks")
async def get_tracks(
    search: Optional[str] = Query(None),
    limit: Optional[int] = Query(None),
    page: Optional[int] = Query(None),
    artistId: Optional[str] = Query(None),
    releaseId: Optional[str] = Query(None),
    voiceModelId: Optional[str] = Query(None)
):
    """Proxy endpoint for fetching tracks from OpenPlay API"""
    try:
        # Build query parameters
        params = {}
        if search:
            params["search"] = search
        if limit:
            params["limit"] = limit
        if page:
            params["page"] = page
        if artistId:
            params["artistId"] = artistId
        if releaseId:
            params["releaseId"] = releaseId
        if voiceModelId:
            params["metadata.voiceModelId"] = voiceModelId

        url = f"{OPENPLAY_BASE_URL}/tracks"
        safe_print(f"Proxying request to: {url}")

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params, headers=get_auth_headers())

            if response.status_code != 200:
                try:
                    error_text = response.text.encode('ascii', errors='replace').decode('ascii')[:200]
                except:
                    error_text = "Error response contains unprintable characters"
                safe_print(f"OpenPlay API Error: {response.status_code} {response.reason_phrase}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail={
                        "error": f"OpenPlay API error: {response.status_code} {response.reason_phrase}",
                        "details": error_text
                    }
                )

            data = response.json()
            safe_print(f"OpenPlay API Success")
            return data

    except httpx.HTTPError as error:
        try:
            error_msg = str(error).encode('ascii', errors='replace').decode('ascii')[:100]
        except:
            error_msg = "Error message contains unprintable characters"
        safe_print(f"Proxy Error: {error_msg}")
        raise HTTPException(
            status_code=500,
            detail={"error": "Internal server error", "details": error_msg}
        )


# POST endpoints for creating resources
@app.post("/api/openplay/artists")
async def create_artist(request: Request):
    """Proxy endpoint for creating artists in OpenPlay API"""
    try:
        body = await request.json()
        url = f"{OPENPLAY_BASE_URL}/artists"
        safe_print(f"Proxying POST request to: {url}")

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=body, headers=get_auth_headers())

            if response.status_code not in [200, 201]:
                try:
                    error_text = response.text.encode('ascii', errors='replace').decode('ascii')[:200]
                except:
                    error_text = "Error response contains unprintable characters"
                safe_print(f"OpenPlay API Error: {response.status_code} {response.reason_phrase}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail={
                        "error": f"OpenPlay API error: {response.status_code} {response.reason_phrase}",
                        "details": error_text
                    }
                )

            data = response.json()
            safe_print(f"OpenPlay API Success")
            return data

    except httpx.HTTPError as error:
        try:
            error_msg = str(error).encode('ascii', errors='replace').decode('ascii')[:100]
        except:
            error_msg = "Error message contains unprintable characters"
        safe_print(f"Proxy Error: {error_msg}")
        raise HTTPException(
            status_code=500,
            detail={"error": "Internal server error", "details": error_msg}
        )


# Startup message - will be shown when uvicorn starts
print("=" * 60)
print(f"OpenPlay API Proxy Server")
print(f"Health check: http://localhost:3001/health")
print(f"API Documentation: http://localhost:3001/docs")
print(f"Using API Key: {'***' + OPENPLAY_API_KEY[-4:] if OPENPLAY_API_KEY else 'NOT SET'}")
print("=" * 60)
