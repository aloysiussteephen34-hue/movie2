import React from 'react';
import { Clock, Star, Film, CheckCircle2, PlayCircle, Eye, Flame } from 'lucide-react';

const StatsDashboard = ({ stats, loading }) => {
  const statusCounts = stats?.statusCounts || { toWatch: 0, watching: 0, watched: 0, total: 0 };
  const totalHours = stats?.totalHoursWatched ?? 0;
  const avgRating = stats?.averageRating ?? 0;
  const topGenre = stats?.topWatchedGenre || 'None yet';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
      {/* 1. Total Movies */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Total Movies</span>
          <Film className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-white">
            {loading ? '...' : statusCounts.total}
          </span>
          <span className="text-xs text-slate-400">listed</span>
        </div>
      </div>

      {/* 2. To Watch */}
      <div className="bg-slate-900/90 border border-blue-900/40 rounded-2xl p-4 shadow-sm hover:border-blue-700/50 transition-colors">
        <div className="flex items-center justify-between text-blue-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">To Watch</span>
          <Eye className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-blue-300">
            {loading ? '...' : statusCounts.toWatch}
          </span>
          <span className="text-xs text-slate-400">queued</span>
        </div>
      </div>

      {/* 3. Watching */}
      <div className="bg-slate-900/90 border border-amber-900/40 rounded-2xl p-4 shadow-sm hover:border-amber-700/50 transition-colors">
        <div className="flex items-center justify-between text-amber-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Watching</span>
          <PlayCircle className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">
            {loading ? '...' : statusCounts.watching}
          </span>
          <span className="text-xs text-slate-400">in progress</span>
        </div>
      </div>

      {/* 4. Watched */}
      <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-4 shadow-sm hover:border-emerald-700/50 transition-colors">
        <div className="flex items-center justify-between text-emerald-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Watched</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
            {loading ? '...' : statusCounts.watched}
          </span>
          <span className="text-xs text-slate-400">completed</span>
        </div>
      </div>

      {/* 5. Total Hours Watched */}
      <div className="bg-slate-900/90 border border-indigo-900/40 rounded-2xl p-4 shadow-sm hover:border-indigo-700/50 transition-colors">
        <div className="flex items-center justify-between text-indigo-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Hours Watched</span>
          <Clock className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-300">
            {loading ? '...' : totalHours}
          </span>
          <span className="text-xs text-slate-400">hrs</span>
        </div>
      </div>

      {/* 6. Avg Rating & Top Genre */}
      <div className="bg-slate-900/90 border border-purple-900/40 rounded-2xl p-4 shadow-sm hover:border-purple-700/50 transition-colors">
        <div className="flex items-center justify-between text-purple-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Avg Rating</span>
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-200">
              {loading ? '...' : (avgRating > 0 ? avgRating : 'N/A')}
            </span>
            {avgRating > 0 && <span className="text-xs text-slate-400">/10</span>}
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-950/70 text-purple-300 border border-purple-800/50 font-medium truncate max-w-[80px]" title={`Top Genre: ${topGenre}`}>
            {topGenre}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;

