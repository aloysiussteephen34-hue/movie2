import React, { useState } from 'react';
import { X, Star, AlertCircle, CheckCircle } from 'lucide-react';

const RateMovieModal = ({ isOpen, onClose, movie, onConfirmWatched }) => {
  const [rating, setRating] = useState(8);
  const [hoverRating, setHoverRating] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !movie) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 10) {
      setError('Please provide a mandatory rating between 1 and 10');
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirmWatched(movie._id, numericRating);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-white">Mark as Watched</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          You are completing <span className="text-indigo-300 font-semibold">"{movie.title}"</span>. Please rate this movie to finalize.
        </p>

        {/* Error message */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs text-left flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          {/* Star selector */}
          <div className="flex items-center justify-center gap-1.5 mb-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starValue) => {
              const active = (hoverRating || rating) >= starValue;
              return (
                <button
                  type="button"
                  key={starValue}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(starValue)}
                  className="p-1 focus:outline-none transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-5 h-5 ${
                      active ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="text-center mb-6">
            <span className="text-3xl font-black text-amber-400">{rating}</span>
            <span className="text-slate-500 text-sm font-semibold"> / 10</span>
          </div>

          <div className="flex items-center justify-center gap-3">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-md shadow-emerald-600/25"
            >
              {isSubmitting ? 'Saving...' : 'Confirm & Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RateMovieModal;

