import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

//dotenv.config({ path: path.resolve('../.env') });
dotenv.config();


const CACHE_PATH = path.resolve('./token-cache.json');

// Base64 encoded "client_id:client_secret"
const BASIC_AUTH = process.env.SOUNDCLOUD_BASIC_AUTH;
const CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;
const CLIENT_SECRET = process.env.SOUNDCLOUD_CLIENT_SECRET;

function isExpired(expires_at) {
  return !expires_at || Date.now() > expires_at - 60_000; // refresh 1 min before expiry
}

async function loadCachedToken() {
  try {
    const raw = await fs.readFile(CACHE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function saveTokenToCache(tokenData) {
  const expires_at = Date.now() + tokenData.expires_in * 1000;
  const toStore = { ...tokenData, expires_at };
  await fs.writeFile(CACHE_PATH, JSON.stringify(toStore, null, 2), 'utf-8');
  return toStore;
}

async function getAccessTokenViaClientCredentials() {
  const res = await fetch("https://secure.soundcloud.com/oauth/token", {
    method: "POST",
    headers: {
      accept: "application/json; charset=utf-8",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${BASIC_AUTH}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Token fetch failed: ${JSON.stringify(data)}`);
  return saveTokenToCache(data);
}

async function refreshAccessToken(refresh_token) {
  const res = await fetch("https://secure.soundcloud.com/oauth/token", {
    method: "POST",
    headers: {
      accept: "application/json; charset=utf-8",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Refresh failed: ${JSON.stringify(data)}`);
  return saveTokenToCache(data);
}

export async function getValidAccessToken() {
  const cached = await loadCachedToken();

  if (cached && !isExpired(cached.expires_at)) {
    return cached.access_token;
  }

  if (cached?.refresh_token) {
    console.log("🔁 Refreshing token...");
    return (await refreshAccessToken(cached.refresh_token)).access_token;
  }

  console.log("🔑 Getting new token via client_credentials...");
  return (await getAccessTokenViaClientCredentials()).access_token;
}

// Example usage if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const token = await getValidAccessToken();
  console.log("✅ Valid token:", token.slice(0, 10) + "...");
}
