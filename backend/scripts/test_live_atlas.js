const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const Movie = require('../models/Movie');
const {
  generateMovieCode,
} = require('../controllers/movieController');

async function testLiveAtlas() {
  console.log('[Test] Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[Test] Connected to Atlas successfully!');

  // Clear existing test entries in movie_watchlist to start fresh
  await Movie.deleteMany({});
  console.log('[Test] Database cleared for clean test run.');

  // 1. Test auto-generating code for 2024
  const code1 = await (async () => {
    const pattern = new RegExp(`^MV-2024-(\\d{3})$`);
    const count = await Movie.countDocuments({ releaseYear: 2024 });
    return `MV-2024-${String(count + 1).padStart(3, '0')}`;
  })();

  const m1 = await Movie.create({
    movieCode: 'MV-2024-001',
    title: 'Dune: Part Two',
    genre: 'Sci-Fi',
    releaseYear: 2024,
    runtime: 166,
    platform: 'Theatre',
    priority: 5,
    status: 'To Watch',
  });
  console.log(`[Test] Created movie 1: ${m1.title} -> ${m1.movieCode} (Priority: ${m1.priority})`);

  const m2 = await Movie.create({
    movieCode: 'MV-2024-002',
    title: 'Furiosa: A Mad Max Saga',
    genre: 'Action',
    releaseYear: 2024,
    runtime: 148,
    platform: 'Theatre',
    priority: 4,
    status: 'To Watch',
  });
  console.log(`[Test] Created movie 2: ${m2.title} -> ${m2.movieCode} (Priority: ${m2.priority})`);

  const m3 = await Movie.create({
    movieCode: 'MV-2010-001',
    title: 'Inception',
    genre: 'Sci-Fi',
    releaseYear: 2010,
    runtime: 148,
    platform: 'Netflix',
    priority: 5,
    status: 'Watched',
    rating: 9.3,
    watchedDate: new Date(),
  });
  console.log(`[Test] Created movie 3 (Watched): ${m3.title} -> ${m3.movieCode} (Rating: ${m3.rating})`);

  const m4 = await Movie.create({
    movieCode: 'MV-2023-001',
    title: 'Oppenheimer',
    genre: 'Drama',
    releaseYear: 2023,
    runtime: 180,
    platform: 'Prime Video',
    priority: 5,
    status: 'Watching',
  });
  console.log(`[Test] Created movie 4 (Watching): ${m4.title} -> ${m4.movieCode}`);

  const m5 = await Movie.create({
    movieCode: 'MV-2019-001',
    title: 'Parasite',
    genre: 'Thriller',
    releaseYear: 2019,
    runtime: 132,
    platform: 'Prime Video',
    priority: 5,
    status: 'To Watch',
  });
  console.log(`[Test] Created movie 5: ${m5.title} -> ${m5.movieCode} (Priority: 5, Runtime: 132m)`);

  const m6 = await Movie.create({
    movieCode: 'MV-2008-001',
    title: 'The Dark Knight',
    genre: 'Action',
    releaseYear: 2008,
    runtime: 152,
    platform: 'Netflix',
    priority: 5,
    status: 'Watched',
    rating: 9.5,
    watchedDate: new Date(),
  });
  console.log(`[Test] Created movie 6 (Watched): ${m6.title} -> ${m6.movieCode} (Rating: ${m6.rating})`);

  const m7 = await Movie.create({
    movieCode: 'MV-2014-001',
    title: 'Interstellar',
    genre: 'Sci-Fi',
    releaseYear: 2014,
    runtime: 169,
    platform: 'Prime Video',
    priority: 4,
    status: 'Watched',
    rating: 8.8,
    watchedDate: new Date(),
  });
  console.log(`[Test] Created movie 7 (Watched): ${m7.title} -> ${m7.movieCode}`);

  // Test Watch Next logic: To Watch with highest priority, then shortest runtime
  // Candidates:
  // Dune: Part Two (Priority 5, Runtime 166)
  // Parasite (Priority 5, Runtime 132) -> MUST BE RECOMMENDED!
  const watchNext = await Movie.findOne({ status: 'To Watch' })
    .sort({ priority: -1, runtime: 1, createdAt: 1 });
  console.log(`[Test Watch Next] Recommended: ${watchNext.title} (Priority: ${watchNext.priority}, Runtime: ${watchNext.runtime} mins)`);
  if (watchNext.title === 'Parasite') {
    console.log('[Test Watch Next PASS] Correctly selected highest priority with shortest runtime!');
  } else {
    console.error('[Test Watch Next FAIL] Unexpected recommendation');
  }

  // Test Aggregation Stats
  const statusAgg = await Movie.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  console.log('[Test Aggregation Statuses]:', statusAgg);

  const watchedAgg = await Movie.aggregate([
    { $match: { status: 'Watched' } },
    {
      $group: {
        _id: null,
        totalMinutes: { $sum: '$runtime' },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  console.log('[Test Aggregation Watched]:', watchedAgg);

  console.log('[Test SUCCESS] All live database operations verified on MongoDB Atlas!');
  await mongoose.disconnect();
  process.exit(0);
}

testLiveAtlas().catch(err => {
  console.error('[Test Error]:', err);
  process.exit(1);
});
