import React from 'react';
import { X, Sparkles, Star, Clock, Calendar, Tv, Play, AlertCircle } from 'lucide-react';

const WatchNextModal = ({ isOpen, onClose, recommendation, error, loading, onStartWatching }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 text-indigo-400 mb-1">
          <Sparkles className="w-5 h-5 text-amber-400 animate-bounce" />
          <span className="text-xs font-bold uppercase tracking-widest">Recommended Pick</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">What to Watch Next</h2>

        {/* Content */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Consulting your watchlist priority algorithm...</p>
          </div>
        ) : error ? (
          <div className="my-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice</p>
              <p className="text-xs text-amber-300/90 mt-0.5">{error}</p>
            </div>
          </div>
        ) : recommendation ? (
          <div className="my-6">
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                  {recommendation.movieCode}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/60">
                  {recommendation.status}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                {recommendation.title}
              </h3>

              <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 font-medium">
                  {recommendation.genre}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {recommendation.releaseYear}
                </span>
                <span className="flex items-center gap-1 font-mono text-emerald-400 font-semibold">
                  <Clock className="w-3 h-3" />
                  {recommendation.runtime} mins (Shortest)
                </span>
                <span className="flex items-center gap-1">
                  <Tv className="w-3 h-3 text-slate-500" />
                  {recommendation.platform}
                </span>
              </div>

              {/* Priority Highlight */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">Calculated Priority:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= recommendation.priority
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-amber-300 ml-1">
                    {recommendation.priority} / 5 (Highest)
                  </span>
                </div>
              </div>
            </div>

            {/* CTA: Move to Watching */}
            <button
              onClick={() => {
                onStartWatching(recommendation);
                onClose();
              }}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20 transition-all active:scale-98"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Watching Now (Move to Watching)</span>
            </button>
          </div>
        ) : null}

        {/* Footer */}
        <div className="text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WatchNextModal;

