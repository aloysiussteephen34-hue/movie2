const mongoose = require('mongoose');

const CURRENT_YEAR = new Date().getFullYear();

const movieSchema = new mongoose.Schema(
  {
    movieCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
      match: /^MV-\d{4}-\d{3}$/,
    },
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, 'Movie genre is required'],
      enum: {
        values: ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'],
        message: '{VALUE} is not a valid genre',
      },
    },
    releaseYear: {
      type: Number,
      required: [true, 'Release year is required'],
      min: [1950, 'Release year must be 1950 or later'],
      max: [CURRENT_YEAR, `Release year cannot exceed current year (${CURRENT_YEAR})`],
      immutable: true,
    },
    runtime: {
      type: Number,
      required: [true, 'Runtime in minutes is required'],
      min: [30, 'Runtime must be at least 30 minutes'],
      max: [300, 'Runtime cannot exceed 300 minutes'],
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: {
        values: ['Netflix', 'Prime Video', 'Hotstar', 'Theatre', 'Other'],
        message: '{VALUE} is not a valid platform',
      },
    },
    priority: {
      type: Number,
      required: [true, 'Priority is required'],
      min: [1, 'Priority must be between 1 and 5'],
      max: [5, 'Priority must be between 1 and 5'],
    },
    status: {
      type: String,
      enum: {
        values: ['To Watch', 'Watching', 'Watched'],
        message: '{VALUE} is not a valid status',
      },
      default: 'To Watch',
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating cannot exceed 10'],
      default: null,
    },
    watchedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to help with fast case-insensitive duplicate checks
movieSchema.index({ releaseYear: 1, title: 1 });

module.exports = mongoose.model('Movie', movieSchema);

