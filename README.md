# 🎬 CineTrack — Movie Watchlist & Tracking Manager

A complete, production-grade **MERN Stack (MongoDB Atlas, Express.js, React.js, Node.js)** web application built for movie lovers to plan what to watch, track active viewings, and log ratings for finished movies.

All data is persisted in **MongoDB Atlas**, and every operation communicates end-to-end from the responsive React frontend through the Express REST API.

---

## 📸 Application Screenshots

### 1. Watchlist Dashboard & Movie Cards
Displays real-time aggregation metrics, search & multi-attribute filtering, priority sorting, and responsive movie cards with status badges and workflow controls:

![Watchlist Dashboard & Movie Cards](./screenshots/01_dashboard_overview.png)

---

### 2. Add Movie Modal with Validation & Duplicate Prevention
Full input validation (Release Year 1950–current year, Runtime 30–300 mins, Priority 1–5), client-immutable movie codes, and 409 Conflict duplicate checking:

![Add Movie Modal](./screenshots/02_add_movie_modal.png)

---

### 3. "What Should I Watch Next?" Smart Recommendation
Backend algorithm identifies top-priority movies from the "To Watch" queue with shortest runtime tie-breaker:

![Watch Next Recommendation](./screenshots/03_watch_next_modal.png)

---

## 📁 Repository Structure

```text
movie2/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas connection setup
│   ├── controllers/
│   │   └── movieController.js    # Business logic, aggregation & workflow handlers
│   ├── middleware/
│   │   └── errorHandler.js       # Centralized error handler & 404 middleware
│   ├── models/
│   │   └── Movie.js              # Mongoose schema, validation & indexes
│   ├── routes/
│   │   └── movieRoutes.js        # Express RESTful route declarations
│   ├── scripts/
│   │   └── capture_screenshots.js # Automated verification & screenshot script
│   ├── .env                      # Included for evaluators (Atlas URI & Port)
│   ├── package.json              # Backend dependencies
│   └── server.js                 # Express server & static asset serving
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddMovieModal.jsx     # Add movie form modal with validation
│   │   │   ├── EditMovieModal.jsx    # Pre-filled edit modal (code & year locked)
│   │   │   ├── FilterBar.jsx         # Search, status & genre filter bar
│   │   │   ├── MovieCard.jsx         # Card with colored status badge & dropdown
│   │   │   ├── Navbar.jsx            # Brand header & action triggers
│   │   │   ├── Pagination.jsx        # 6 movies per page pagination bar
│   │   │   ├── RateMovieModal.jsx    # Mandatory 1-10 rating modal on Watched
│   │   │   ├── StatsDashboard.jsx    # Aggregation statistics dashboard
│   │   │   └── WatchNextModal.jsx    # "What should I watch next?" modal
│   │   ├── services/
│   │   │   └── api.js                # Axios REST API service client
│   │   ├── App.jsx                   # Main application container
│   │   ├── index.css                 # Tailwind CSS styles
│   │   └── main.jsx                  # React entry point
│   ├── index.html
│   ├── package.json              # Frontend dependencies
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── screenshots/
│   ├── 01_dashboard_overview.png
│   ├── 02_add_movie_modal.png
│   └── 03_watch_next_modal.png
├── .env                          # Root environment config for convenience
├── .gitignore                    # Production gitignore
├── package.json                  # Workspace runner scripts
└── README.md                     # Comprehensive project documentation
```

---

## ⚙️ Environment Variables

The `.env` file is intentionally included in the repository so evaluators can run the project immediately:

```env
PORT=5000
MONGODB_URI=mongodb+srv://aloysius225701_db_user:Aloysius123@cluster0.iktlsq7.mongodb.net/movie_watchlist?retryWrites=true&w=majority
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Option 1: Run Full Stack Simultaneously (Recommended)
From the project root:
```bash
# 1. Install all dependencies
npm run install:all

# 2. Build frontend for direct server hosting
npm --prefix frontend run build

# 3. Start the backend server (serves both API & Frontend on port 5000)
npm run server
```
Then visit **`http://localhost:5000`** in your browser.

### Option 2: Run Backend and Frontend in Separate Terminals
**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
# Vite dev server runs on http://localhost:5173 (proxied to backend)
```

---

## 📡 RESTful API Documentation

All API responses follow the consistent JSON format:
```json
{
  "success": true | false,
  "message": "Human-readable status description",
  "data": ...
}
```

### 1. Movie Collection & Creation

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/movies` | Add a new movie to watchlist | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `GET` | `/api/movies` | Get paginated movies (6/page) with search and filters | `200 OK`, `500 Internal Error` |

#### POST `/api/movies`
**Request Body:**
```json
{
  "title": "Interstellar",
  "genre": "Sci-Fi",
  "releaseYear": 2014,
  "runtime": 169,
  "platform": "Netflix",
  "priority": 5
}
```
**Success Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Movie added successfully to watchlist",
  "data": {
    "_id": "662fd9b31910a95c9a7102e1",
    "movieCode": "MV-2014-001",
    "title": "Interstellar",
    "genre": "Sci-Fi",
    "releaseYear": 2014,
    "runtime": 169,
    "platform": "Netflix",
    "priority": 5,
    "status": "To Watch",
    "rating": null,
    "watchedDate": null,
    "createdAt": "2026-10-28T13:45:00.000Z",
    "updatedAt": "2026-10-28T13:45:00.000Z"
  }
}
```

#### GET `/api/movies`
**Query Parameters:**
- `status`: Filter by status (`To Watch`, `Watching`, `Watched`, or `All`)
- `genre`: Filter by genre (`Action`, `Comedy`, `Drama`, `Horror`, `Sci-Fi`, `Romance`, `Thriller`)
- `search`: Search movie titles (case-insensitive substring)
- `page`: Page number (default: 1)
- `limit`: Fixed strictly to 6 movies per page

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Movies retrieved successfully",
  "data": {
    "movies": [...],
    "pagination": {
      "totalMovies": 12,
      "totalPages": 2,
      "currentPage": 1,
      "limit": 6,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 2. Specialized Query Endpoints

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/movies/watch-next` | Recommends highest priority "To Watch" movie (shortest runtime tie-breaker) | `200 OK`, `404 Not Found` |
| `GET` | `/api/movies/stats` | Aggregated dashboard metrics calculated by MongoDB aggregation pipeline | `200 OK` |

#### GET `/api/movies/watch-next`
**Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Recommended next movie to watch",
  "data": {
    "_id": "662fd9b31910a95c9a7102e5",
    "movieCode": "MV-2019-001",
    "title": "Parasite",
    "genre": "Thriller",
    "releaseYear": 2019,
    "runtime": 132,
    "platform": "Prime Video",
    "priority": 5,
    "status": "To Watch"
  }
}
```
**Empty State Response (`404 Not Found`):**
```json
{
  "success": false,
  "message": "No movies found in \"To Watch\" list to recommend. Add some movies first!",
  "data": null
}
```

#### GET `/api/movies/stats`
Calculated dynamically using MongoDB `$group`, `$match`, and `$sort` aggregation stages.
**Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Dashboard statistics calculated successfully",
  "data": {
    "statusCounts": {
      "toWatch": 4,
      "watching": 2,
      "watched": 6,
      "total": 12
    },
    "totalMinutesWatched": 845,
    "totalHoursWatched": 14.1,
    "averageRating": 8.7,
    "topWatchedGenre": "Sci-Fi",
    "topWatchedGenreCount": 3
  }
}
```

---

### 3. Movie Item Operations

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/movies/:id` | Retrieve single movie by ID | `200 OK`, `404 Not Found` |
| `PUT` | `/api/movies/:id` | Update editable fields (Title, Genre, Runtime, Platform, Priority, Rating if Watched). `movieCode` & `releaseYear` are immutable. | `200 OK`, `400 Bad Request`, `404 Not Found`, `409 Conflict` |
| `PATCH` | `/api/movies/:id/status` | Transition movie status following strict workflow & mandatory rating rules | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/api/movies/:id` | Delete movie (forbidden if status is `Watching`) | `200 OK`, `400 Bad Request`, `404 Not Found` |

#### PATCH `/api/movies/:id/status`
**Transitioning to "Watched" (Mandatory Rating):**
```json
{
  "status": "Watched",
  "rating": 9
}
```
**Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Movie status updated to \"Watched\" successfully",
  "data": {
    "_id": "662fd9b31910a95c9a7102e1",
    "status": "Watched",
    "rating": 9,
    "watchedDate": "2026-10-28T14:15:22.381Z"
  }
}
```

---

## 🔒 Business Rules & Workflow Enforcement

1. **Auto-Generated Movie Code:**
   - Format: `MV-<release year>-<3-digit sequence>` (e.g. `MV-2019-001`, `MV-2019-002`).
   - The sequence automatically increments per release year.
   - Client is strictly prohibited from setting or updating the code.

2. **Status Transition Workflow:**
   - Initial status upon creation is strictly `To Watch`.
   - Allowed transitions:
     - `To Watch` → `Watching` or `Watched`
     - `Watching` → `Watched` or `To Watch`
     - `Watched` is final and cannot be modified.
   - The dropdown on the frontend displays **only** the allowed next statuses.

3. **Mandatory Rating on Watched:**
   - Marking a movie as `Watched` requires a rating between 1 and 10.
   - The backend automatically stores `watchedDate`.
   - Providing a rating for a non-Watched movie is rejected (`400 Bad Request`).
   - Ratings can be edited later only for movies in `Watched` status.

4. **Duplicate Prevention (409 Conflict):**
   - The combination of `title` and `releaseYear` (case-insensitive) cannot be added twice.
   - Returns HTTP `409 Conflict` and displays a clear error banner on the form.

5. **Delete Protection:**
   - A movie in `Watching` status **cannot** be deleted.
   - The frontend disables the delete button and locks the action.
   - The backend rejects delete attempts with `400 Bad Request`.
   - All other statuses prompt for user confirmation before deletion.

6. **Sorting & Pagination:**
   - Pagination is set strictly to 6 movies per page.
   - Movies in `To Watch` status are prioritized from high to low priority (`priority: 5` down to `1`).

---

## 💻 Technical Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Axios
- **Backend**: Node.js, Express.js, Mongoose ODM
- **Database**: MongoDB Atlas (Cloud Cluster)
- **Architecture**: Modular MVC (Controllers, Models, Routes, Middlewares, Components)
