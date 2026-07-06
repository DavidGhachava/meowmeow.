// ============================================================
// Silent Data Collector - Serverless Backend (Netlify Function)
// ============================================================
// Accepts POST requests with JSON body containing collected
// browser/device data. Extracts IP, country, city from headers.
// Logs everything to function logs. Returns confirmation.
// ============================================================

// Headers Netlify injects for geolocation (must enable in Netlify dashboard)
// - x-forwarded-for: client IP
// - x-client-ip: alternative client IP
// - x-nf-client-connection-ip: Netlify's client IP header
// - x-nf-country: country code
// - x-nf-region: region/state code
// - x-nf-city: city name
// - x-nf-latitude: latitude
// - x-nf-longitude: longitude
// - x-nf-timezone: timezone

exports.handler = async (event, context) => {
  // --- CORS headers for local development ---
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  // --- Extract geolocation from request headers ---
  const ip =
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['x-client-ip'] ||
    event.headers['x-forwarded-for'] ||
    event.headers['client-ip'] ||
    'unknown';

  const country = event.headers['x-nf-country'] || null;
  const region = event.headers['x-nf-region'] || null;
  const city = event.headers['x-nf-city'] || null;
  const latitude = event.headers['x-nf-latitude'] || null;
  const longitude = event.headers['x-nf-longitude'] || null;
  const timezone = event.headers['x-nf-timezone'] || null;

  // Parse JSON body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (parseError) {
    console.error('[track] Invalid JSON body:', parseError.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  // --- Log everything to Netlify function logs ---
  console.log('=== [track] New Data Received ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('IP:', ip);
  console.log('Country:', country);
  console.log('Region:', region);
  console.log('City:', city);
  console.log('Latitude:', latitude);
  console.log('Longitude:', longitude);
  console.log('Timezone:', timezone);
  console.log('User-Agent:', event.headers['user-agent'] || 'N/A');
  console.log('Content-Type:', event.headers['content-type'] || 'N/A');
  console.log('Origin:', event.headers['origin'] || 'N/A');
  console.log('Referer:', event.headers['referer'] || 'N/A');
  console.log('Accept-Language:', event.headers['accept-language'] || 'N/A');
  console.log('--- Collected Data ---');
  console.log(JSON.stringify(body, null, 2));
  console.log('=== End [track] ===');

  // Return success with geolocation data
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Data received successfully',
      ip,
      country,
      region,
      city,
      latitude,
      longitude,
      timezone,
      timestamp: new Date().toISOString(),
      dataPoints: Object.keys(body).length,
      warning: 'This is an educational demonstration. No data is stored or shared.'
    })
  };
};
