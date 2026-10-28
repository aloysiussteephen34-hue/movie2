const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');

const mockStats = {
  statusCounts: { toWatch: 4, watching: 2, watched: 6, total: 12 },
  totalMinutesWatched: 845,
  totalHoursWatched: 14.1,
  averageRating: 8.7,
  topWatchedGenre: 'Sci-Fi',
  topWatchedGenreCount: 3,
};

const mockMovies = [
  {
    _id: '662fd101',
    movieCode: 'MV-2010-001',
    title: 'Inception',
    genre: 'Sci-Fi',
    releaseYear: 2010,
    runtime: 148,
    platform: 'Netflix',
    priority: 5,
    status: 'Watched',
    rating: 9.3,
    watchedDate: '2026-10-25T14:30:00.000Z',
  },
  {
    _id: '662fd102',
    movieCode: 'MV-2008-001',
    title: 'The Dark Knight',
    genre: 'Action',
    releaseYear: 2008,
    runtime: 152,
    platform: 'Prime Video',
    priority: 5,
    status: 'Watched',
    rating: 9.5,
    watchedDate: '2026-10-26T20:15:00.000Z',
  },
  {
    _id: '662fd103',
    movieCode: 'MV-2023-001',
    title: 'Oppenheimer',
    genre: 'Drama',
    releaseYear: 2023,
    runtime: 180,
    platform: 'Theatre',
    priority: 5,
    status: 'Watching',
    rating: null,
    watchedDate: null,
  },
  {
    _id: '662fd104',
    movieCode: 'MV-2024-001',
    title: 'Dune: Part Two',
    genre: 'Sci-Fi',
    releaseYear: 2024,
    runtime: 166,
    platform: 'Theatre',
    priority: 4,
    status: 'Watching',
    rating: null,
    watchedDate: null,
  },
  {
    _id: '662fd105',
    movieCode: 'MV-2019-001',
    title: 'Parasite',
    genre: 'Thriller',
    releaseYear: 2019,
    runtime: 132,
    platform: 'Prime Video',
    priority: 5,
    status: 'To Watch',
    rating: null,
    watchedDate: null,
  },
  {
    _id: '662fd106',
    movieCode: 'MV-2014-001',
    title: 'Interstellar',
    genre: 'Sci-Fi',
    releaseYear: 2014,
    runtime: 169,
    platform: 'Netflix',
    priority: 4,
    status: 'To Watch',
    rating: null,
    watchedDate: null,
  },
];

const mockRecommendation = {
  _id: '662fd105',
  movieCode: 'MV-2019-001',
  title: 'Parasite',
  genre: 'Thriller',
  releaseYear: 2019,
  runtime: 132,
  platform: 'Prime Video',
  priority: 5,
  status: 'To Watch',
  rating: null,
  watchedDate: null,
};

async function capture() {
  const screenshotsDir = path.join(__dirname, '../../screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const app = express();
  app.use(express.json());

  app.get('/api/movies/stats', (req, res) => {
    res.json({ success: true, message: 'Stats loaded', data: mockStats });
  });

  app.get('/api/movies/watch-next', (req, res) => {
    res.json({ success: true, message: 'Recommendation', data: mockRecommendation });
  });

  app.get('/api/movies', (req, res) => {
    res.json({
      success: true,
      message: 'Movies retrieved',
      data: {
        movies: mockMovies,
        pagination: {
          totalMovies: 12,
          totalPages: 2,
          currentPage: 1,
          limit: 6,
          hasNextPage: true,
          hasPrevPage: false,
        },
      },
    });
  });

  const distPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5056, resolve));
  console.log('[Capture] Screenshot preview server running on port 5056');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,850'],
    defaultViewport: { width: 1366, height: 850 },
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5056', { waitUntil: 'networkidle0' });

  // 1. Dashboard screenshot
  const shot1 = path.join(screenshotsDir, '01_dashboard_overview.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log(`[Capture] Saved Screenshot 1: ${shot1}`);

  // 2. Open Add Movie Modal
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent.includes('Add Movie'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  const shot2 = path.join(screenshotsDir, '02_add_movie_modal.png');
  await page.screenshot({ path: shot2, fullPage: false });
  console.log(`[Capture] Saved Screenshot 2: ${shot2}`);

  // Close Add Movie Modal
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const cancelBtn = buttons.find((b) => b.textContent.includes('Cancel'));
    if (cancelBtn) cancelBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  // 3. Open Watch Next Modal
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent.includes('What should I watch next?'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  const shot3 = path.join(screenshotsDir, '03_watch_next_modal.png');
  await page.screenshot({ path: shot3, fullPage: false });
  console.log(`[Capture] Saved Screenshot 3: ${shot3}`);

  await browser.close();
  server.close();
  console.log('[Capture] Complete! All screenshots generated.');
  process.exit(0);
}

capture().catch((err) => {
  console.error('[Capture Error]:', err);
  process.exit(1);
});
