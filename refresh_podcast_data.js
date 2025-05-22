
const puppeteer = require('puppeteer');
const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const xml2js = require('xml2js');

const SOUNDLOUD_RSS_URL = 'https://feeds.soundcloud.com/users/soundcloud:users:683767394/sounds.rss';
const PUBLIC_DATA_PATH = './public/data/enriched_episodes.json';
const SCRAPE_URL = 'https://soundcloud.com/diaradio/sets';

(async () => {
  console.log('⬇️  Downloading RSS feed...');
  const rssRes = await fetch(SOUNDLOUD_RSS_URL);
  const rssXml = await rssRes.text();
  fs.writeFileSync('sounds.rss', rssXml);

  console.log('🕸 Scraping SoundCloud playlists...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(SCRAPE_URL, { waitUntil: 'networkidle2' });

  // Scroll to bottom to trigger lazy loading
  await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
  await new Promise(resolve => setTimeout(resolve, 2000));

  const playlistUrls = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href^="/diaradio/sets/"]'))
      .map(a => a.href)
      .filter((value, index, self) => self.indexOf(value) === index)
  );

  const playlists = {};

  for (const url of playlistUrls) {
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Scroll to trigger track loading
    await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
    await new Promise(resolve => setTimeout(resolve, 2000));

    const title = await page.evaluate(() => document.querySelector('h1')?.innerText.trim() || '');
    const tracks = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href^="/diaradio/"]'))
        .map(a => a.getAttribute('href'))
        .filter(href => !href.includes('/sets/') && !href.includes('/likes'))
        .map(href => href.split('/')[2])
    );
    if (title && tracks.length > 0) {
      playlists[title] = Array.from(new Set(tracks));
    }
  }
  await browser.close();
  fs.writeFileSync('soundcloud_playlists.json', JSON.stringify(playlists, null, 2));

  console.log('🔗 Matching episodes to shows...');
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(rssXml);
  const items = result.rss.channel[0].item;

  const episodes = items.map(item => {
    const url = item.link[0];
    const slug = url.split('/').pop();

    const matchedShow = Object.entries(playlists).find(([_, slugs]) =>
      slugs.some(track =>
        slug.includes(track) ||
        track.includes(slug) ||
        slug.replace(/-/g, '').includes(track.replace(/-/g, '')) ||
        track.replace(/-/g, '').includes(slug.replace(/-/g, ''))
      )
    );

    return {
      title: item.title[0],
      slug,
      url,
      show: matchedShow ? matchedShow[0] : null,
      pubDate: item.pubDate?.[0] || null,
      audio: item.enclosure?.[0]?.$.url || null,
      description: item.description?.[0] || null,
      image: item['itunes:image']?.[0]?.$.href || result.rss.channel[0]['itunes:image']?.[0]?.$.href || null
    };
  });

  fs.writeFileSync(PUBLIC_DATA_PATH, JSON.stringify(episodes, null, 2));
  console.log(`✅ Done: ${episodes.length} episodes saved to ${PUBLIC_DATA_PATH}`);
})();
