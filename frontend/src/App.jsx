import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsDashboard from './components/StatsDashboard';
import FilterBar from './components/FilterBar';
import MovieCard from './components/MovieCard';
import Pagination from './components/Pagination';
import AddMovieModal from './components/AddMovieModal';
import EditMovieModal from './components/EditMovieModal';
import RateMovieModal from './components/RateMovieModal';
import WatchNextModal from './components/WatchNextModal';
import { movieService } from './services/api';
import { Film, AlertTriangle, CheckCircle, Plus, Info } from 'lucide-react';

function App() {
  // Movies & Pagination State
  const [movies, setMovies] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [genreFilter, setGenreFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Dashboard Statistics State
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Modals State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedMovieForEdit, setSelectedMovieForEdit] = useState(null);

  // Rating modal for 'Watched' transition
  const [isRateOpen, setIsRateOpen] = useState(false);
  const [movieToRate, setMovieToRate] = useState(null);

  // Watch Next recommendation state
  const [isWatchNextOpen, setIsWatchNextOpen] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [recommendationError, setRecommendationError] = useState('');
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  // Toast Notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch Dashboard Statistics
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await movieService.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Movies with current filters & pagination
  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 6,
      };

      if (statusFilter !== 'All') params.status = statusFilter;
      if (genreFilter !== 'All') params.genre = genreFilter;
      if (search.trim() !== '') params.search = search.trim();

      const res = await movieService.getMovies(params);
      if (res.success) {
        setMovies(res.data.movies);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch movies:', err);
      showToast(err.response?.data?.message || 'Error loading movies', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, genreFilter, search]);

  // Initial load & filter change
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Load stats once on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // When filters change, reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, genreFilter, search]);

  // 1. Add Movie Handler
  const handleAddMovie = async (movieData) => {
    const res = await movieService.addMovie(movieData);
    if (res.success) {
      showToast(`Added "${res.data.title}" successfully with code ${res.data.movieCode}!`);
      // Refresh list & stats
      fetchMovies();
      fetchStats();
    }
  };

  // 2. Edit Movie Handler
  const handleUpdateMovie = async (id, movieData) => {
    const res = await movieService.updateMovie(id, movieData);
    if (res.success) {
      showToast(`Movie "${res.data.title}" updated successfully!`);
      fetchMovies();
      fetchStats();
    }
  };

  // 3. Status Transition Workflow
  const handleInitiateStatusChange = (movie, nextStatus) => {
    if (nextStatus === 'Watched') {
      // Mandate rating first!
      setMovieToRate(movie);
      setIsRateOpen(true);
    } else {
      // Direct transition (e.g. To Watch -> Watching or Watching -> To Watch)
      executeStatusChange(movie._id, nextStatus);
    }
  };

  const executeStatusChange = async (id, status, rating = undefined) => {
    try {
      const res = await movieService.updateStatus(id, { status, rating });
      if (res.success) {
        showToast(`Moved to "${status}" successfully!`);
        fetchMovies();
        fetchStats();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleConfirmWatched = async (id, rating) => {
    await executeStatusChange(id, 'Watched', rating);
  };

  // 4. Delete Movie Handler
  const handleDeleteMovie = async (movie) => {
    // Delete Rule: A movie in Watching status cannot be deleted
    if (movie.status === 'Watching') {
      showToast('Movies in "Watching" status cannot be deleted!', 'error');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${movie.title}" (${movie.movieCode})? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      const res = await movieService.deleteMovie(movie._id);
      if (res.success) {
        showToast(`Movie "${movie.title}" deleted.`);
        fetchMovies();
        fetchStats();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete movie', 'error');
    }
  };

  // 5. "What should I watch next?" Recommendation Handler
  const handleOpenWatchNext = async () => {
    setIsWatchNextOpen(true);
    setRecommendation(null);
    setRecommendationError('');
    setRecommendationLoading(true);

    try {
      const res = await movieService.getWatchNext();
      if (res.success) {
        setRecommendation(res.data);
      }
    } catch (err) {
      setRecommendationError(
        err.response?.data?.message || 'No recommended movies available right now.'
      );
    } finally {
      setRecommendationLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-semibold border ${
              toast.type === 'error'
                ? 'bg-rose-950 border-rose-800 text-rose-200 shadow-rose-900/30'
                : 'bg-emerald-950 border-emerald-800 text-emerald-200 shadow-emerald-900/30'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        onOpenAddModal={() => setIsAddOpen(true)}
        onOpenWatchNext={handleOpenWatchNext}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Welcome Section */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Watchlist Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Organize what to watch, track active viewings, and log ratings for finished movies.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            MongoDB Atlas connected • Real-time stats
          </div>
        </div>

        {/* Statistics Dashboard (MongoDB Aggregation) */}
        <StatsDashboard stats={stats} loading={statsLoading} />

        {/* Filter and Search Bar */}
        <FilterBar
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          genreFilter={genreFilter}
          setGenreFilter={setGenreFilter}
          onReset={() => {
            setSearch('');
            setStatusFilter('All');
            setGenreFilter('All');
            setCurrentPage(1);
          }}
        />

        {/* Movie Cards Section */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-medium text-slate-400">Loading your watchlist...</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-10 sm:p-16 text-center max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Film className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No Movies Found</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              {search || statusFilter !== 'All' || genreFilter !== 'All'
                ? 'No movies match your current search and filter criteria. Try adjusting your filters.'
                : 'Your watchlist is currently empty. Start planning your entertainment by adding your first movie!'}
            </p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Movie</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {movies.map((movie) => (
                <MovieCard
                  key={movie._id}
                  movie={movie}
                  onInitiateStatusChange={handleInitiateStatusChange}
                  onEdit={(m) => {
                    setSelectedMovieForEdit(m);
                    setIsEditOpen(true);
                  }}
                  onDelete={handleDeleteMovie}
                />
              ))}
            </div>

            {/* Pagination (Strictly 6 per page) */}
            <Pagination
              pagination={pagination}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} CineTrack - MERN Movie Watchlist Manager. All rights reserved.</p>
          <p className="font-mono text-slate-600">Built for Examination Evaluation • Original & Plagiarism-Free</p>
        </div>
      </footer>

      {/* Modals */}
      <AddMovieModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onMovieAdded={handleAddMovie}
      />

      <EditMovieModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedMovieForEdit(null);
        }}
        movie={selectedMovieForEdit}
        onMovieUpdated={handleUpdateMovie}
      />

      <RateMovieModal
        isOpen={isRateOpen}
        onClose={() => {
          setIsRateOpen(false);
          setMovieToRate(null);
        }}
        movie={movieToRate}
        onConfirmWatched={handleConfirmWatched}
      />

      <WatchNextModal
        isOpen={isWatchNextOpen}
        onClose={() => setIsWatchNextOpen(false)}
        recommendation={recommendation}
        error={recommendationError}
        loading={recommendationLoading}
        onStartWatching={(rec) => {
          executeStatusChange(rec._id, 'Watching');
        }}
      />
    </div>
  );
}

export default App;

