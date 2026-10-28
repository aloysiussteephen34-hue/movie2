const express = require('express');
const router = express.Router();

const {
  addMovie,
  getMovies,
  getMovieById,
  updateMovie,
  updateMovieStatus,
  deleteMovie,
  getWatchNext,
  getStats,
} = require('../controllers/movieController');

// Specialized Routes (must come before /:id)
router.get('/watch-next', getWatchNext);
router.get('/stats', getStats);

// Collection Routes
router.route('/')
  .post(addMovie)
  .get(getMovies);

// Item Routes
router.route('/:id')
  .get(getMovieById)
  .put(updateMovie)
  .delete(deleteMovie);

// Status Transition Route
router.patch('/:id/status', updateMovieStatus);

module.exports = router;

