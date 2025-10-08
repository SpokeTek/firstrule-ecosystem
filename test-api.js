// Simple test script to check OpenPlay API
import fetch from 'node-fetch';

const OPENPLAY_BASE_URL = 'https://connect.opstaging.com/v2';
const OPENPLAY_API_KEY = 'IDGWJJZ69P';
const OPENPLAY_SECRET_KEY = 'dd02e91c-e7de-47b2-9524-8eb5dcde4ee2';

async function testOpenPlayAPI() {
  console.log('🧪 Testing OpenPlay API directly...');

  // Test with different endpoints and parameters
  const testCases = [
    { url: `${OPENPLAY_BASE_URL}/artists?search=test&limit=5`, desc: 'Original endpoint with search' },
    { url: `${OPENPLAY_BASE_URL}/artists/?search=test&limit=5`, desc: 'With trailing slash and search' },
    { url: `${OPENPLAY_BASE_URL}/artists?q=test&limit=5`, desc: 'Using q parameter instead of search' },
    { url: `${OPENPLAY_BASE_URL}/artists/?q=test&limit=5`, desc: 'With trailing slash and q parameter' },
    { url: `${OPENPLAY_BASE_URL}/artists`, desc: 'No parameters' },
    { url: `${OPENPLAY_BASE_URL}/artists/`, desc: 'No parameters with trailing slash' },
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n📡 Testing: ${testCase.desc}`);
      console.log(`🔗 URL: ${testCase.url}`);

      const response = await fetch(testCase.url, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${OPENPLAY_API_KEY}:${OPENPLAY_SECRET_KEY}`).toString('base64')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log(`📊 Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success! Data length: ${JSON.stringify(data).length}`);
        console.log(`📄 Preview: ${JSON.stringify(data).substring(0, 200)}...`);
      } else {
        const errorText = await response.text();
        console.log(`❌ Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`💥 Network Error: ${error.message}`);
    }
  }
}

testOpenPlayAPI();