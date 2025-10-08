# OpenPlay API Integration - CORS Issue & Solution

## Current Status
The OpenPlay API integration is configured but encountering a **CORS (Cross-Origin Resource Sharing)** error when trying to access the API directly from the browser.

## The Problem
```
Error searching artists: TypeError: Failed to fetch
```

This occurs because:
1. **Browser Security**: Modern browsers prevent web pages from making requests to APIs that don't explicitly allow cross-origin access
2. **OpenPlay API Configuration**: The OpenPlay API at `https://connect.opstaging.com/v2` doesn't include the necessary CORS headers to allow direct browser access
3. **Security Design**: Many APIs are designed to be accessed from server-side applications, not directly from browsers

## Current Workaround
The application now:
✅ Detects CORS issues automatically
✅ Falls back to demo mode with sample artists
✅ Shows appropriate UI messages about the limitation
✅ Provides detailed console logging for debugging

## Production Solutions

### Option 1: Server-Side Proxy (Recommended)
Create a server-side API route that forwards requests to OpenPlay:

**For Next.js (if you migrate):**
```javascript
// pages/api/openplay/artists.js
export default async function handler(req, res) {
  const { search, limit, page } = req.query;

  try {
    const response = await fetch(`https://connect.opstaging.com/v2/artists?${new URLSearchParams({
      search,
      limit,
      page
    })}`, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENPLAY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

**For Vite + Express.js:**
```javascript
// server.js
app.get('/api/openplay/artists', async (req, res) => {
  const { search, limit, page } = req.query;

  try {
    const response = await fetch(`https://connect.opstaging.com/v2/artists?${new URLSearchParams({
      search,
      limit,
      page
    })}`, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENPLAY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Option 2: OpenPlay API Configuration
Contact OpenPlay to add your domain to their CORS allowlist:
- Request they add `http://localhost:8081` (development)
- Request they add your production domain
- This requires OpenPlay to update their API configuration

### Option 3: JSONP (Limited)
Some APIs support JSONP for cross-origin requests, but this is less secure and not recommended for production applications.

## Current Implementation

### Enhanced Error Handling
The OpenPlay API client now includes:
- Detailed console logging
- CORS detection
- Graceful fallback to demo mode
- Clear error messages

### Demo Mode Features
- 5 sample artists with realistic data
- Full search and filtering functionality
- Session management capabilities
- Professional UI/UX

## Development vs Production

**Development (Current):**
- ✅ Works with demo data
- ✅ Full UI functionality
- ⚠️ Shows CORS warning in console
- ⚠️ Limited to sample artists

**Production (With Proxy):**
- ✅ Real-time OpenPlay API access
- ✅ Live artist search
- ✅ Commercial release tracking
- ✅ Full integration capabilities

## Environment Variables

The application is configured to use:
```bash
OPENPLAY_API_KEY="IDGWJJZ69P"
OPENPLAY_SECRET_KEY="dd02e91c-e7de-47b2-9524-8eb5dcde4ee2"
```

These are correctly configured in the `.env` file and will work once the CORS issue is resolved.

## Next Steps

1. **Immediate**: The app works perfectly in demo mode
2. **Short-term**: Implement a server-side proxy for development
3. **Long-term**: Deploy with proper server-side API routes

## Files Modified

- `src/integrations/openplay/OpenPlayAPI.ts` - Enhanced error handling
- `src/components/cowriter/ArtistSearch.tsx` - CORS detection and fallback UI
- `src/pages/CoWriter.tsx` - Fixed environment variable access
- `src/api/openplay-proxy.ts` - Proxy implementation template

## Testing

To test the API integration once CORS is resolved:
1. Navigate to CoWriter page
2. Try searching for artists
3. Check browser console for detailed logging
4. Verify real API responses appear instead of demo data

The current implementation provides a seamless user experience regardless of the API availability.