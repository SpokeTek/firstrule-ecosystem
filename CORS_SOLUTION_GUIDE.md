# CORS Solution for OpenPlay API Integration

## Overview
This solution implements a server-side proxy to resolve CORS issues when calling the OpenPlay API from the browser. The proxy server acts as an intermediary, making API calls on behalf of the frontend application.

## Architecture

```
Frontend (Vite) → Proxy Server (Express) → OpenPlay API
     ↓                    ↓                      ↓
  Port 8080           Port 3001            connect.opstaging.com
```

## Files Added/Modified

### New Files:
- `server.js` - Express.js proxy server
- `CORS_SOLUTION_GUIDE.md` - This guide

### Modified Files:
- `package.json` - Added proxy server scripts and dependencies
- `vite.config.ts` - Added proxy configuration
- `src/integrations/openplay/OpenPlayAPI.ts` - Updated to use proxy in development

## Dependencies Added
- `express` - Web server framework
- `cors` - CORS middleware
- `node-fetch` - HTTP client for server-side requests
- `concurrently` - Run multiple processes simultaneously
- `@types/express` - TypeScript types for Express
- `@types/cors` - TypeScript types for CORS

## How to Run

### Option 1: Run Both Servers Separately
```bash
# Terminal 1: Start the proxy server
npm run dev:proxy

# Terminal 2: Start the Vite dev server
npm run dev
```

### Option 2: Run Both Servers Together
```bash
# Start both servers with one command
npm run dev:full
```

## How It Works

### 1. Proxy Server (Express.js)
- Runs on port 3001
- Handles CORS by adding appropriate headers
- Forwards requests to OpenPlay API with proper authentication
- Logs all requests and responses for debugging

### 2. Vite Development Server
- Runs on port 8080
- Proxies `/api/openplay/*` requests to the Express server
- Transparent to the frontend application

### 3. OpenPlay API Client
- Automatically detects development environment
- Uses proxy endpoints in development
- Falls back to direct API calls in production
- Maintains all existing functionality

## API Endpoints

The proxy server provides these endpoints:

- `GET /api/openplay/artists` - Search artists
- `GET /api/openplay/artists/:id` - Get specific artist
- `GET /api/openplay/releases` - Search releases
- `GET /api/openplay/tracks` - Search tracks
- `POST /api/openplay/artists` - Create artist
- `GET /health` - Health check

## Environment Variables

The server uses these environment variables:
- `OPENPLAY_API_KEY` - Your OpenPlay API key (defaults to the one in your setup)
- `PROXY_PORT` - Port for the proxy server (defaults to 3001)

## Testing

1. Start the proxy server: `npm run dev:proxy`
2. Start the Vite server: `npm run dev`
3. Navigate to the CoWriter page
4. Try searching for artists
5. Check browser console for detailed logging
6. Verify real API responses appear instead of demo data

## Troubleshooting

### Proxy Server Not Starting
- Check if port 3001 is available
- Verify all dependencies are installed: `npm install`
- Check console for error messages

### CORS Still Occurring
- Ensure proxy server is running on port 3001
- Check Vite proxy configuration in `vite.config.ts`
- Verify the frontend is making requests to `/api/openplay/*`

### API Key Issues
- Verify the API key is correct in the server logs
- Check if the OpenPlay API is accessible from your server
- Test the health endpoint: `http://localhost:3001/health`

## Production Deployment

For production, you'll need to:
1. Deploy the proxy server to your hosting platform
2. Update the Vite configuration to point to your production proxy URL
3. Set up proper environment variables
4. Configure CORS for your production domain

## Benefits

✅ **Resolves CORS Issues** - No more browser CORS errors
✅ **Maintains Security** - API keys stay on the server
✅ **Easy Development** - Simple commands to start everything
✅ **Production Ready** - Can be deployed to any hosting platform
✅ **Debugging Friendly** - Detailed logging for troubleshooting
✅ **Backward Compatible** - Existing code continues to work

## Next Steps

1. Test the solution with your OpenPlay API
2. Deploy to production when ready
3. Consider adding authentication to the proxy server
4. Add rate limiting and caching for better performance
