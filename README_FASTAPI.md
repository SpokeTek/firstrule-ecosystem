# FastAPI Server Setup

This project now includes a FastAPI backend server as an alternative to the Express.js server.

## Prerequisites

- Python 3.9 or higher
- pip (Python package installer)

## Installation

1. **Install Python dependencies:**

```bash
pip install -r requirements.txt
```

## Running the FastAPI Server

### Option 1: Using npm scripts (recommended)

```bash
# Run FastAPI backend + Vite frontend together
npm run dev:full:py

# Or run them separately:
npm run dev:proxy:py  # FastAPI server on port 3001
npm run dev           # Vite dev server on port 8080
```

### Option 2: Using Python directly

```bash
# Run with uvicorn directly
uvicorn server:app --reload --port 3001

# Or run the Python file directly
python server.py
```

## Features

### All Express endpoints converted to FastAPI:

- ✅ `GET /health` - Health check endpoint
- ✅ `GET /api/openplay/artists` - Search artists
- ✅ `GET /api/openplay/artists/{artist_id}` - Get specific artist
- ✅ `GET /api/openplay/releases` - Search releases
- ✅ `GET /api/openplay/tracks` - Search tracks
- ✅ `POST /api/openplay/artists` - Create artist

### Additional Features:

- 🚀 **Better Performance** - FastAPI is async-native and typically 2-3x faster
- 📚 **Auto-generated API docs** - Visit `http://localhost:3001/docs` for interactive Swagger UI
- 🔒 **Type validation** - Automatic request/response validation
- ⚡ **Modern Python** - Uses latest async/await patterns

## API Documentation

Once the server is running, you can access:

- **Swagger UI (interactive):** http://localhost:3001/docs
- **ReDoc (alternative):** http://localhost:3001/redoc
- **OpenAPI JSON:** http://localhost:3001/openapi.json

## Environment Variables

The FastAPI server uses the same environment variables as the Express server:

```env
OPENPLAY_API_KEY=your_api_key_here
OPENPLAY_SECRET_KEY=your_secret_key_here
PROXY_PORT=3001  # Optional, defaults to 3001
```

## Comparison: Express vs FastAPI

| Feature | Express (Node.js) | FastAPI (Python) |
|---------|------------------|------------------|
| Lines of code | 297 | 330 (with better structure) |
| Performance | Good | Excellent (2-3x faster) |
| API Docs | Manual | Auto-generated |
| Type Safety | Via TypeScript | Built-in (Pydantic) |
| Async Support | Yes | Native |
| Hot Reload | ✅ | ✅ |

## Troubleshooting

### Port already in use

If you see "Address already in use" error:

```bash
# On Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# On Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### Python version issues

Make sure you're using Python 3.9+:

```bash
python --version  # Should be 3.9 or higher
```

### Module not found errors

Reinstall dependencies:

```bash
pip install -r requirements.txt --force-reinstall
```

## Development Workflow

### Frontend stays the same!

Your Vite/React frontend doesn't need any changes. It still makes requests to `http://localhost:3001/api/openplay/*` through the Vite proxy configuration.

### Switching between Express and FastAPI

Both servers are available:

```bash
# Use Express (original)
npm run dev:full

# Use FastAPI (new)
npm run dev:full:py
```

## Production Deployment

### Using Uvicorn (recommended)

```bash
uvicorn server:app --host 0.0.0.0 --port 3001 --workers 4
```

### Using Gunicorn + Uvicorn workers

```bash
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:3001
```

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server.py .
COPY .env .

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "3001"]
```

## Next Steps

1. ✅ Test all endpoints using the Swagger UI at `/docs`
2. ✅ Try the FastAPI server with your frontend
3. ✅ Compare performance between Express and FastAPI
4. ✅ Decide which backend to keep for production

Enjoy your new FastAPI backend! 🚀🐍
