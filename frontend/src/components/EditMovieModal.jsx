import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Edit3, Lock } from 'lucide-react';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'];
const PLATFORMS = ['Netflix', 'Prime Video', 'Hotstar', 'Theatre', 'Other'];

const EditMovieModal = ({ isOpen, onClose, movie, onMovieUpdated }) => {
  const [formData, setFormData] = useState({
    title: '',
    genre: 'Action',
    runtime: 120,
    platform: 'Netflix',
    priority: 3,
    rating: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || '',
        genre: movie.genre || 'Action',
        runtime: movie.runtime || 120,
        platform: movie.platform || 'Netflix',
        priority: movie.priority || 3,
        rating: movie.rating !== null && movie.rating !== undefined ? movie.rating : '',
      });
      setErrors({});
      setServerError('');
    }
  }, [movie]);

  if (!isOpen || !movie) return null;

  const isWatched = movie.status === 'Watched';

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required';
    }

    const rt = parseInt(formData.runtime, 10);
    if (isNaN(rt) || rt < 30 || rt > 300) {
      errs.runtime = 'Runtime must be between 30 and 300 minutes';
    }

    const prio = parseInt(formData.priority, 10);
    if (isNaN(prio) || prio < 1 || prio > 5) {
      errs.priority = 'Priority must be between 1 and 5';
    }

    if (isWatched) {
      const rate = Number(formData.rating);
      if (isNaN(rate) || rate < 1 || rate > 10) {
        errs.rating = 'Rating must be between 1 and 10';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const updatePayload = {
        title: formData.title.trim(),
        genre: formData.genre,
        runtime: parseInt(formData.runtime, 10),
        platform: formData.platform,
        priority: parseInt(formData.priority, 10),
      };

      if (isWatched && formData.rating !== '') {
        updatePayload.rating = Number(formData.rating);
      }

      await onMovieUpdated(movie._id, updatePayload);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update movie';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-indigo-400" />
              Edit Movie Details
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Movie Code and Release Year are immutable and cannot be changed.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server Error (409 Conflict duplicate or validation message) */}
        {serverError && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 flex items-start gap-2.5 text-rose-200 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Error:</span> {serverError}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Read-Only Locked Fields: Movie Code & Release Year */}
          <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" /> Movie Code
              </span>
              <p className="text-sm font-mono font-bold text-indigo-400 mt-0.5">
                {movie.movieCode}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" /> Release Year
              </span>
              <p className="text-sm font-mono font-bold text-slate-300 mt-0.5">
                {movie.releaseYear}
              </p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Movie Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
            {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Genre & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Genre <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Platform <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Runtime & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Runtime (30 - 300 mins) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="30"
                max="300"
                value={formData.runtime}
                onChange={(e) => setFormData({ ...formData, runtime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              {errors.runtime && <p className="text-rose-400 text-xs mt-1">{errors.runtime}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Priority (1 - 5) <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              >
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl} {lvl === 5 ? '(Highest)' : lvl === 1 ? '(Lowest)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rating Editable ONLY for Watched movies */}
          {isWatched ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                Rating (1 to 10) - Editable for Watched movies
              </label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-emerald-800/80 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
              {errors.rating && <p className="text-rose-400 text-xs mt-1">{errors.rating}</p>}
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50 text-[11px] text-slate-500 italic">
              Rating can only be assigned or edited once movie reaches Watched status.
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/25"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMovieModal;

