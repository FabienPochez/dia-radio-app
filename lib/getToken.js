const axios = require('axios');
const qs = require('qs');

const clientId = 'fOuU0UHhjyjjFeVtEz3vR9LH9zPiiZsJ';
const clientSecret = 'Tk3X3VgvH9zThotw3P11FlRyyoNv3rr6';

let cachedToken = null;
let tokenExpiresAt = 0;

async function getValidToken() {
  // Check if token is still valid
  if (Date.now() < tokenExpiresAt && cachedToken) {
    return cachedToken;
  }

  try {
    const response = await axios.post(
      'https://api.soundcloud.com/oauth2/token',
      qs.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const { access_token, expires_in } = response.data;
    cachedToken = access_token;
    tokenExpiresAt = Date.now() + expires_in * 1000 - 10000; // 10s buffer

    console.log('✅ New token fetched');
    return cachedToken;
  } catch (err) {
    console.error('❌ Failed to get token:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = { getValidToken };
