import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const movieService = {
  // Fetch movies with pagination, filtering, and search
  getMovies: async (params = {}) => {
    const response = await api.get('/movies', { params });
    return response.data;
  },

  // Fetch single movie by ID
  getMovieById: async (id) => {
    const response = await api.get(`/movies/${id}`);
    return response.data;
  },

  // Add new movie
  addMovie: async (movieData) => {
    const response = await api.post('/movies', movieData);
    return response.data;
  },

  // Update existing movie (title, genre, runtime, platform, priority, rating if watched)
  updateMovie: async (id, movieData) => {
    const response = await api.put(`/movies/${id}`, movieData);
    return response.data;
  },

  // Update status with transition validation and rating
  updateStatus: async (id, { status, rating }) => {
    const response = await api.patch(`/movies/${id}/status`, { status, rating });
    return response.data;
  },

  // Delete movie (forbidden if Watching)
  deleteMovie: async (id) => {
    const response = await api.delete(`/movies/${id}`);
    return response.data;
  },

  // "What should I watch next?" recommendation
  getWatchNext: async () => {
    const response = await api.get('/movies/watch-next');
    return response.data;
  },

  // Real-time calculated dashboard statistics
  getStats: async () => {
    const response = await api.get('/movies/stats');
    return response.data;
  },
};

export default api;
