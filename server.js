import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PROXY_PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://127.0.0.1:8080', 'http://127.0.0.1:8081'],
  credentials: true
}));
app.use(express.json());

// OpenPlay API configuration
const OPENPLAY_BASE_URL = 'https://newwest.opstaging.com/connect/v2';
const OPENPLAY_API_KEY = process.env.OPENPLAY_API_KEY || 'IDGWJJZ69P';
const OPENPLAY_SECRET_KEY = process.env.OPENPLAY_SECRET_KEY || 'dd02e91c-e7de-47b2-9524-8eb5dcde4ee2';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// OpenPlay API proxy endpoints
app.get('/api/openplay/artists', async (req, res) => {
  try {
    const { search, limit, page } = req.query;

    const searchParams = new URLSearchParams();
    if (search) searchParams.set('q', search); // Use 'q' instead of 'search'
    if (limit) searchParams.set('limit', limit);
    if (page) searchParams.set('page', page);

    // Try both endpoint variations
    let url = `${OPENPLAY_BASE_URL}/artists/?${searchParams.toString()}`;

    console.log(`🌐 Proxying request to: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${OPENPLAY_API_KEY}:${OPENPLAY_SECRET_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenPlay API Error: ${response.status} ${response.statusText} - ${errorText}`);

      // Try alternative endpoint without trailing slash
      if (response.status === 400) {
        console.log(`🔄 Trying alternative endpoint without trailing slash...`);
        const altUrl = `${OPENPLAY_BASE_URL}/artists?${searchParams.toString()}`;
        console.log(`🌐 Proxying to alternative: ${altUrl}`);

        const altResponse = await fetch(altUrl, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${OPENPLAY_API_KEY}:${OPENPLAY_SECRET_KEY}`).toString('base64')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (altResponse.ok) {
          const altData = await altResponse.json();
          console.log(`✅ OpenPlay API Success with alternative endpoint`);
          return res.json(altData);
        } else {
          const altErrorText = await altResponse.text();
          console.error(`❌ Alternative endpoint also failed: ${altResponse.status} ${altResponse.statusText} - ${altErrorText}`);

          // Try the original base URL as a last resort
          console.log(`🔄 Trying original base URL...`);
          const originalBaseUrl = 'https://newwest.opstaging.com/connect/v2';
          const fallbackUrl = `${originalBaseUrl}/artists?${searchParams.toString()}`;
          console.log(`🌐 Proxying to fallback: ${fallbackUrl}`);

          const fallbackResponse = await fetch(fallbackUrl, {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${OPENPLAY_API_KEY}:${OPENPLAY_SECRET_KEY}`).toString('base64')}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log(`✅ OpenPlay API Success with fallback URL`);
            return res.json(fallbackData);
          } else {
            const fallbackErrorText = await fallbackResponse.text();
            console.error(`❌ Fallback URL also failed: ${fallbackResponse.status} ${fallbackResponse.statusText} - ${fallbackErrorText}`);
          }
        }
      }

      return res.status(response.status).json({
        error: `OpenPlay API error: ${response.status} ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log(`✅ OpenPlay API Success: ${JSON.stringify(data).substring(0, 100)}...`);

    res.json(data);
  } catch (error) {
    console.error(`❌ Proxy Error:`, error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

app.get('/api/openplay/artists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const url = `${OPENPLAY_BASE_URL}/artists/${id}`;
    
    console.log(`🌐 Proxying request to: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${OPENPLAY_API_KEY}:${OPENPLAY_SECRET_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenPlay API Error: ${response.status} ${response.statusText} - ${errorText}`);
      return res.status(response.status).json({ 
        error: `OpenPlay API error: ${response.status} ${response.statusText}`,
        details: errorText
      });
    }
    
    const data = await response.json();
    console.log(`✅ OpenPlay API Success: ${JSON.stringify(data).substring(0, 100)}...`);
    
    res.json(data);
  } catch (error) {
    console.error(`❌ Proxy Error:`, error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

app.get('/api/openplay/releases', async (req, res) => {
  try {
    const { search, limit, page, artistId, type, from, to } = req.query;
    
    const searchParams = new URLSearchParams();
    if (search) searchParams.set('search', search);
    if (limit) searchParams.set('limit', limit);
    if (page) searchParams.set('page', page);
    if (artistId) searchParams.set('artistId', artistId);
    if (type) searchParams.set('type', type);
    if (from) searchParams.set('from', from);
    if (to) searchParams.set('to', to);
    
    const url = `${OPENPLAY_BASE_URL}/releases?${searchParams.toString()}`;
    
    console.log(`🌐 Proxying request to: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${OPENPLAY_API_KEY}:${OPENPLAY_SECRET_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenPlay API Error: ${response.status} ${response.statusText} - ${errorText}`);
      return res.status(response.status).json({ 
        error: `OpenPlay API error: ${response.status} ${response.statusText}`,
        details: errorText
      });
    }
    
    const data = await response.json();
    console.log(`✅ OpenPlay API Success: ${JSON.stringify(data).substring(0, 100)}...`);
    
    res.json(data);
  } catch (error) {
    console.error(`❌ Proxy Error:`, error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

app.get('/api/openplay/tracks', async (req, res) => {
  try {
    const { search, limit, page, artistId, releaseId, voiceModelId } = req.query;
    
    const searchParams = new URLSearchParams();
    if (search) searchParams.set('search', search);
    if (limit) searchParams.set('limit', limit);
    if (page) searchParams.set('page', page);
    if (artistId) searchParams.set('artistId', artistId);
    if (releaseId) searchParams.set('releaseId', releaseId);
    if (voiceModelId) searchParams.set('metadata.voiceModelId', voiceModelId);
    
    const url = `${OPENPLAY_BASE_URL}/tracks?${searchParams.toString()}`;
    
    console.log(`🌐 Proxying request to: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${OPENPLAY_API_KEY}:${OPENPLAY_SECRET_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenPlay API Error: ${response.status} ${response.statusText} - ${errorText}`);
      return res.status(response.status).json({ 
        error: `OpenPlay API error: ${response.status} ${response.statusText}`,
        details: errorText
      });
    }
    
    const data = await response.json();
    console.log(`✅ OpenPlay API Success: ${JSON.stringify(data).substring(0, 100)}...`);
    
    res.json(data);
  } catch (error) {
    console.error(`❌ Proxy Error:`, error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// POST endpoints for creating resources
app.post('/api/openplay/artists', async (req, res) => {
  try {
    const url = `${OPENPLAY_BASE_URL}/artists`;
    
    console.log(`🌐 Proxying POST request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${OPENPLAY_API_KEY}:${OPENPLAY_SECRET_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenPlay API Error: ${response.status} ${response.statusText} - ${errorText}`);
      return res.status(response.status).json({ 
        error: `OpenPlay API error: ${response.status} ${response.statusText}`,
        details: errorText
      });
    }
    
    const data = await response.json();
    console.log(`✅ OpenPlay API Success: ${JSON.stringify(data).substring(0, 100)}...`);
    
    res.json(data);
  } catch (error) {
    console.error(`❌ Proxy Error:`, error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OpenPlay API Proxy Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🎵 OpenPlay API proxy: http://localhost:${PORT}/api/openplay/`);
  console.log(`🔑 Using API Key: ${OPENPLAY_API_KEY ? '***' + OPENPLAY_API_KEY.slice(-4) : 'NOT SET'}`);
});
