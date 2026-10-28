import React from 'react';
import { Star, Clock, Tv, Calendar, Trash2, Edit3, ArrowRight, ShieldAlert, Check } from 'lucide-react';

const MovieCard = ({
  movie,
  onInitiateStatusChange,
  onEdit,
  onDelete,
}) => {
  const isWatching = movie.status === 'Watching';
  const isWatched = movie.status === 'Watched';
  const isToWatch = movie.status === 'To Watch';

  // Allowed transitions map strictly as per requirements:
  // To Watch → Watching or Watched
  // Watching → Watched or To Watch
  // Watched is final and cannot be changed
  const getNextStatusOptions = (current) => {
    if (current === 'To Watch') return ['Watching', 'Watched'];
    if (current === 'Watching') return ['Watched', 'To Watch'];
    return []; // Watched is final
  };

  const nextOptions = getNextStatusOptions(movie.status);

  // Status Badge Colors & Icons
  const getStatusBadge = (status) => {
    switch (status) {
      case 'To Watch':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/70 text-blue-300 border border-blue-800/60 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            To Watch
          </span>
        );
      case 'Watching':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/60 shadow-sm animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Watching
          </span>
        );
      case 'Watched':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 shadow-sm">
            <Check className="w-3 h-3 text-emerald-400" />
            Watched
          </span>
        );
      default:
        return null;
    }
  };

  // Format watched date if available
  const formattedWatchedDate = movie.watchedDate
    ? new Date(movie.watchedDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className="group relative bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-slate-700/80 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
      {/* Top Header: Movie Code & Status Badge */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-950 text-indigo-400 border border-slate-800 tracking-wider">
            {movie.movieCode}
          </span>
          {getStatusBadge(movie.status)}
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors line-clamp-1 mb-2" title={movie.title}>
          {movie.title}
        </h3>

        {/* Meta badges: Genre, Year, Runtime, Platform */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-slate-400">
          <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 font-medium border border-slate-700/50">
            {movie.genre}
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Calendar className="w-3 h-3 text-slate-500" />
            {movie.releaseYear}
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-slate-500" />
            {movie.runtime} min
          </span>
          <span className="flex items-center gap-1">
            <Tv className="w-3 h-3 text-slate-500" />
            {movie.platform}
          </span>
        </div>

        {/* Priority & Rating Info */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-5">
          {/* Priority */}
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block mb-0.5">
              Priority
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= movie.priority
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-700'
                  }`}
                />
              ))}
              <span className="text-xs font-bold text-slate-300 ml-1">
                {movie.priority}/5
              </span>
            </div>
          </div>

          {/* Rating */}
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block mb-0.5">
              Rating
            </span>
            {movie.rating ? (
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                <Star className="w-3.5 h-3.5 fill-emerald-400" />
                <span>{movie.rating} / 10</span>
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">Not rated</span>
            )}
          </div>
        </div>

        {/* Watched Date notice if completed */}
        {formattedWatchedDate && (
          <p className="text-[11px] text-emerald-400/80 mb-4 flex items-center gap-1">
            <Check className="w-3 h-3" />
            Watched on {formattedWatchedDate}
          </p>
        )}
      </div>

      {/* Footer Controls: Status Transition Dropdown, Edit, Delete */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-3">
        {/* Status Workflow Selector: Show ONLY valid next statuses */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-400">Status:</span>

          {isWatched ? (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-900/50">
              Completed (Final)
            </span>
          ) : (
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  onInitiateStatusChange(movie, e.target.value);
                }
              }}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
            >
              <option value="" disabled>
                Move to...
              </option>
              {nextOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Action Buttons: Edit & Delete */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => onEdit(movie)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/60 hover:bg-slate-800 hover:text-white border border-slate-700/60 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Edit</span>
          </button>

          {/* Delete Button: Disabled if movie is in 'Watching' status */}
          <div className="flex-1" title={isWatching ? 'Movies in Watching status cannot be deleted' : 'Delete movie'}>
            <button
              onClick={() => onDelete(movie)}
              disabled={isWatching}
              className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isWatching
                  ? 'bg-slate-950 text-slate-600 border border-slate-800/80 cursor-not-allowed opacity-50'
                  : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 hover:text-rose-100 border border-rose-900/40'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isWatching ? 'Locked' : 'Delete'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
