const Movie = require('../models/Movie');

const CURRENT_YEAR = new Date().getFullYear();

// Helper to escape regex special characters for safe case-insensitive matching
const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Helper to generate the next unique movie code: MV-<release year>-<3-digit sequence>
const generateMovieCode = async (releaseYear) => {
  const pattern = new RegExp(`^MV-${releaseYear}-(\\d{3})$`);
  const moviesForYear = await Movie.find({ releaseYear, movieCode: { $regex: pattern } }).select('movieCode');

  let maxSequence = 0;
  moviesForYear.forEach((movie) => {
    const match = movie.movieCode.match(pattern);
    if (match && match[1]) {
      const seq = parseInt(match[1], 10);
      if (seq > maxSequence) {
        maxSequence = seq;
      }
    }
  });

  const nextSequence = maxSequence + 1;
  const sequenceStr = String(nextSequence).padStart(3, '0');
  return `MV-${releaseYear}-${sequenceStr}`;
};

// @desc    Add a new movie
// @route   POST /api/movies
const addMovie = async (req, res, next) => {
  try {
    const { title, genre, releaseYear, runtime, platform, priority } = req.body;

    // 1. Mandatory fields presence check
    if (!title || !genre || releaseYear === undefined || runtime === undefined || !platform || priority === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Title, Genre, Release Year, Runtime, Platform, Priority) are required',
        data: null,
      });
    }

    const trimmedTitle = title.trim();
    const parsedYear = parseInt(releaseYear, 10);
    const parsedRuntime = parseInt(runtime, 10);
    const parsedPriority = parseInt(priority, 10);

    // 2. Strict Range Validations
    if (isNaN(parsedYear) || parsedYear < 1950 || parsedYear > CURRENT_YEAR) {
      return res.status(400).json({
        success: false,
        message: `Release Year must be between 1950 and ${CURRENT_YEAR}`,
        data: null,
      });
    }

    if (isNaN(parsedRuntime) || parsedRuntime < 30 || parsedRuntime > 300) {
      return res.status(400).json({
        success: false,
        message: 'Runtime must be between 30 and 300 minutes',
        data: null,
      });
    }

    if (isNaN(parsedPriority) || parsedPriority < 1 || parsedPriority > 5) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be between 1 and 5',
        data: null,
      });
    }

    // 3. Duplicate Rule: Same Title and Release Year (case-insensitive) must not be added twice
    const existingDuplicate = await Movie.findOne({
      releaseYear: parsedYear,
      title: { $regex: new RegExp(`^${escapeRegex(trimmedTitle)}$`, 'i') },
    });

    if (existingDuplicate) {
      return res.status(409).json({
        success: false,
        message: `A movie with the title "${trimmedTitle}" and release year ${parsedYear} already exists`,
        data: null,
      });
    }

    // 4. Auto-generate Movie Code (client cannot set it)
    const movieCode = await generateMovieCode(parsedYear);

    // 5. Initial status is always 'To Watch'
    const movie = await Movie.create({
      movieCode,
      title: trimmedTitle,
      genre,
      releaseYear: parsedYear,
      runtime: parsedRuntime,
      platform,
      priority: parsedPriority,
      status: 'To Watch',
      rating: null,
      watchedDate: null,
    });

    return res.status(201).json({
      success: true,
      message: 'Movie added successfully to watchlist',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all movies with pagination (6 per page), search, and filtering
// @route   GET /api/movies
const getMovies = async (req, res, next) => {
  try {
    const { status, genre, search, page } = req.query;

    const query = {};

    // Filter by Status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by Genre
    if (genre && genre !== 'All') {
      query.genre = genre;
    }

    // Search by title (case-insensitive)
    if (search && search.trim() !== '') {
      query.title = { $regex: escapeRegex(search.trim()), $options: 'i' };
    }

    // Pagination: strictly 6 movies per page as per requirement
    const limit = 6;
    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const skip = (currentPage - 1) * limit;

    const totalMovies = await Movie.countDocuments(query);
    const totalPages = Math.ceil(totalMovies / limit) || 1;

    // Sorting rule: "Movies in To Watch status must be sorted by Priority (high to low) first"
    let sortOptions = {};
    if (status === 'To Watch') {
      sortOptions = { priority: -1, runtime: 1, createdAt: -1 };
    } else {
      // General view: Sort by Priority descending, then creation date
      sortOptions = { priority: -1, createdAt: -1 };
    }

    const movies = await Movie.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: 'Movies retrieved successfully',
      data: {
        movies,
        pagination: {
          totalMovies,
          totalPages,
          currentPage,
          limit,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single movie by ID
// @route   GET /api/movies/:id
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Movie retrieved successfully',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie details (Title, Genre, Runtime, Platform, Priority, Rating if Watched)
//          Note: Movie Code and Release Year CANNOT be edited after creation.
// @route   PUT /api/movies/:id
const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        data: null,
      });
    }

    const { title, genre, runtime, platform, priority, rating } = req.body;

    // Check duplicate rule if title is changed
    if (title && title.trim() !== '') {
      const trimmedTitle = title.trim();
      const duplicate = await Movie.findOne({
        _id: { $ne: movie._id },
        releaseYear: movie.releaseYear,
        title: { $regex: new RegExp(`^${escapeRegex(trimmedTitle)}$`, 'i') },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `A movie with the title "${trimmedTitle}" and release year ${movie.releaseYear} already exists`,
          data: null,
        });
      }
      movie.title = trimmedTitle;
    }

    if (genre) movie.genre = genre;

    if (runtime !== undefined) {
      const parsedRuntime = parseInt(runtime, 10);
      if (isNaN(parsedRuntime) || parsedRuntime < 30 || parsedRuntime > 300) {
        return res.status(400).json({
          success: false,
          message: 'Runtime must be between 30 and 300 minutes',
          data: null,
        });
      }
      movie.runtime = parsedRuntime;
    }

    if (platform) movie.platform = platform;

    if (priority !== undefined) {
      const parsedPriority = parseInt(priority, 10);
      if (isNaN(parsedPriority) || parsedPriority < 1 || parsedPriority > 5) {
        return res.status(400).json({
          success: false,
          message: 'Priority must be between 1 and 5',
          data: null,
        });
      }
      movie.priority = parsedPriority;
    }

    // Rating rule: "A rating can be edited later only for Watched movies."
    if (rating !== undefined && rating !== null) {
      if (movie.status !== 'Watched') {
        return res.status(400).json({
          success: false,
          message: 'Rating can only be set or edited for movies in Watched status',
          data: null,
        });
      }

      const parsedRating = Number(rating);
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 10) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 10',
          data: null,
        });
      }
      movie.rating = parsedRating;
    }

    await movie.save();

    return res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie status following strict workflow and rating rules
// @route   PATCH /api/movies/:id/status
const updateMovieStatus = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        data: null,
      });
    }

    const { status: targetStatus, rating } = req.body;

    if (!targetStatus) {
      return res.status(400).json({
        success: false,
        message: 'Target status is required',
        data: null,
      });
    }

    const currentStatus = movie.status;

    // Rule: "Watched is final and cannot be changed"
    if (currentStatus === 'Watched') {
      return res.status(400).json({
        success: false,
        message: "Status of a 'Watched' movie is final and cannot be changed",
        data: null,
      });
    }

    // Allowed transitions:
    // To Watch → Watching or Watched
    // Watching → Watched or To Watch
    const validTransitions = {
      'To Watch': ['Watching', 'Watched'],
      'Watching': ['Watched', 'To Watch'],
    };

    const allowedNext = validTransitions[currentStatus] || [];
    if (!allowedNext.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from "${currentStatus}" to "${targetStatus}". Allowed next statuses are: ${allowedNext.join(', ')}`,
        data: null,
      });
    }

    // Rating rule:
    // "When a movie is moved to Watched, a rating from 1 to 10 is mandatory, and the backend must also store the Watched Date automatically."
    if (targetStatus === 'Watched') {
      if (rating === undefined || rating === null || rating === '') {
        return res.status(400).json({
          success: false,
          message: 'Rating from 1 to 10 is mandatory when marking a movie as Watched',
          data: null,
        });
      }

      const parsedRating = Number(rating);
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 10) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be a number between 1 and 10',
          data: null,
        });
      }

      movie.rating = parsedRating;
      movie.watchedDate = new Date();
    } else {
      // "A rating must be rejected for any movie that is not in Watched status."
      if (rating !== undefined && rating !== null) {
        return res.status(400).json({
          success: false,
          message: 'Rating cannot be provided for movies not in Watched status',
          data: null,
        });
      }
    }

    movie.status = targetStatus;
    await movie.save();

    return res.status(200).json({
      success: true,
      message: `Movie status updated to "${targetStatus}" successfully`,
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie
//          Rule: "A movie in Watching status cannot be deleted, and the backend must return an error in that case."
// @route   DELETE /api/movies/:id
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        data: null,
      });
    }

    // Strict rule: "A movie in Watching status cannot be deleted"
    if (movie.status === 'Watching') {
      return res.status(400).json({
        success: false,
        message: 'Movies currently in "Watching" status cannot be deleted',
        data: null,
      });
    }

    await Movie.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Movie deleted successfully',
      data: { id: req.params.id, movieCode: movie.movieCode, title: movie.title },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Watch Next recommendation: Return To Watch movie with highest priority (tie breaker: shortest runtime)
// @route   GET /api/movies/watch-next
const getWatchNext = async (req, res, next) => {
  try {
    // "The backend must return the To Watch movie with the highest priority. If several movies have the same priority, return the one with the shortest runtime. If there is no such movie, return a proper message with status 404."
    const nextMovie = await Movie.findOne({ status: 'To Watch' })
      .sort({ priority: -1, runtime: 1, createdAt: 1 });

    if (!nextMovie) {
      return res.status(404).json({
        success: false,
        message: 'No movies found in "To Watch" list to recommend. Add some movies first!',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Recommended next movie to watch',
      data: nextMovie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Statistics Dashboard: aggregation pipeline
//          - Total movies in each status
//          - Total hours watched (sum of runtime of Watched movies)
//          - Average rating of Watched movies (rounded to 1 decimal place)
//          - Genre with the most Watched movies
// @route   GET /api/movies/stats
const getStats = async (req, res, next) => {
  try {
    // 1. Status Counts Aggregation
    const statusAgg = await Movie.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = {
      toWatch: 0,
      watching: 0,
      watched: 0,
      total: 0,
    };

    statusAgg.forEach((item) => {
      if (item._id === 'To Watch') statusCounts.toWatch = item.count;
      else if (item._id === 'Watching') statusCounts.watching = item.count;
      else if (item._id === 'Watched') statusCounts.watched = item.count;
      statusCounts.total += item.count;
    });

    // 2. Watched Movies Metrics (Total hours and Average rating)
    const watchedMetricsAgg = await Movie.aggregate([
      { $match: { status: 'Watched' } },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$runtime' },
          avgRating: { $avg: '$rating' },
          watchedCount: { $sum: 1 },
        },
      },
    ]);

    let totalMinutesWatched = 0;
    let totalHoursWatched = 0;
    let averageRating = 0.0;

    if (watchedMetricsAgg.length > 0) {
      totalMinutesWatched = watchedMetricsAgg[0].totalMinutes || 0;
      // Convert to hours rounded to 1 decimal place
      totalHoursWatched = parseFloat((totalMinutesWatched / 60).toFixed(1));
      if (watchedMetricsAgg[0].avgRating !== null && watchedMetricsAgg[0].avgRating !== undefined) {
        averageRating = parseFloat(watchedMetricsAgg[0].avgRating.toFixed(1));
      }
    }

    // 3. Genre with the most Watched movies
    const topGenreAgg = await Movie.aggregate([
      { $match: { status: 'Watched' } },
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    let topWatchedGenre = 'None yet';
    let topWatchedGenreCount = 0;
    if (topGenreAgg.length > 0) {
      topWatchedGenre = topGenreAgg[0]._id;
      topWatchedGenreCount = topGenreAgg[0].count;
    }

    return res.status(200).json({
      success: true,
      message: 'Dashboard statistics calculated successfully',
      data: {
        statusCounts,
        totalMinutesWatched,
        totalHoursWatched,
        averageRating,
        topWatchedGenre,
        topWatchedGenreCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addMovie,
  getMovies,
  getMovieById,
  updateMovie,
  updateMovieStatus,
  deleteMovie,
  getWatchNext,
  getStats,
};
