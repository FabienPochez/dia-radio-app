
const puppeteer = require('puppeteer');
const fs = require('fs');

const SCRAPE_URL = 'https://soundcloud.com/diaradio/sets';

(async () => {
  console.log('🕸 Starting improved deep playlist scraper...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(SCRAPE_URL, { waitUntil: 'networkidle2' });

  // Trigger full scroll on /sets page
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(resolve => setTimeout(resolve, 3000));

  const playlistUrls = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href^="/diaradio/sets/"]'))
      .map(a => a.href)
      .filter((value, index, self) => self.indexOf(value) === index)
  );

  const playlists = {};

  for (const url of playlistUrls) {
    console.log(`🔍 Scraping playlist: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    let trackCount = 0;
    let retries = 0;

    while (retries < 10) {
      const newCount = await page.evaluate(() =>
        document.querySelectorAll('.sound__content a[href^="/diaradio/"]').length
      );

      if (newCount <= trackCount) {
        retries++;
      } else {
        retries = 0;
        trackCount = newCount;
      }

      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    const title = await page.evaluate(() => document.querySelector('h1')?.innerText.trim() || '');
    const tracks = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.sound__content a[href^="/diaradio/"]'))
        .map(a => a.getAttribute('href'))
        .filter(href => !href.includes('/sets/') && !href.includes('/likes'))
        .map(href => href.split('/')[2])
    );

    if (title) {
      console.log(`🎵 "${title}" → ${tracks.length} tracks`);
      playlists[title] = Array.from(new Set(tracks));
    }
  }

  await browser.close();
  fs.writeFileSync('deep_soundcloud_playlists.json', JSON.stringify(playlists, null, 2));
  console.log('✅ Deep scrape done. Output saved to deep_soundcloud_playlists.json');
})();
