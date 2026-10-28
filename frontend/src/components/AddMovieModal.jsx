import React, { useState } from 'react';
import { X, AlertCircle, PlusCircle, CheckCircle } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();
const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'];
const PLATFORMS = ['Netflix', 'Prime Video', 'Hotstar', 'Theatre', 'Other'];

const AddMovieModal = ({ isOpen, onClose, onMovieAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    genre: 'Action',
    releaseYear: CURRENT_YEAR,
    runtime: 120,
    platform: 'Netflix',
    priority: 3,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required';
    }

    const year = parseInt(formData.releaseYear, 10);
    if (isNaN(year) || year < 1950 || year > CURRENT_YEAR) {
      errs.releaseYear = `Release Year must be between 1950 and ${CURRENT_YEAR}`;
    }

    const rt = parseInt(formData.runtime, 10);
    if (isNaN(rt) || rt < 30 || rt > 300) {
      errs.runtime = 'Runtime must be between 30 and 300 minutes';
    }

    const prio = parseInt(formData.priority, 10);
    if (isNaN(prio) || prio < 1 || prio > 5) {
      errs.priority = 'Priority must be between 1 and 5';
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
      await onMovieAdded({
        title: formData.title.trim(),
        genre: formData.genre,
        releaseYear: parseInt(formData.releaseYear, 10),
        runtime: parseInt(formData.runtime, 10),
        platform: formData.platform,
        priority: parseInt(formData.priority, 10),
      });
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to add movie';
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
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              Add Movie to Watchlist
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Initial status will automatically be set to <strong>To Watch</strong> with an auto-generated Movie Code.
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
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Movie Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Inception, The Dark Knight"
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

          {/* Release Year & Runtime */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Release Year (1950 - {CURRENT_YEAR}) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1950"
                max={CURRENT_YEAR}
                value={formData.releaseYear}
                onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              {errors.releaseYear && <p className="text-rose-400 text-xs mt-1">{errors.releaseYear}</p>}
            </div>

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
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              {errors.runtime && <p className="text-rose-400 text-xs mt-1">{errors.runtime}</p>}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Priority (1 to 5, where 5 is highest) <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <label
                  key={lvl}
                  className={`flex-1 flex flex-col items-center justify-center p-2.5 rounded-xl border cursor-pointer transition-all ${
                    parseInt(formData.priority, 10) === lvl
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={lvl}
                    checked={parseInt(formData.priority, 10) === lvl}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="sr-only"
                  />
                  <span className="text-base">{lvl}</span>
                  <span className="text-[10px] text-slate-500">
                    {lvl === 5 ? 'Highest' : lvl === 1 ? 'Lowest' : ''}
                  </span>
                </label>
              ))}
            </div>
            {errors.priority && <p className="text-rose-400 text-xs mt-1">{errors.priority}</p>}
          </div>

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
              {isSubmitting ? 'Saving...' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMovieModal;
