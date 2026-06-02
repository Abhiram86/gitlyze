# Gitlyze Server

A Node.js/Express application that fetches, stores, and displays GitHub user profiles and their repository statistics. The data is cached in a MySQL database (TiDB) to optimize API calls and allow for rapid profile rendering.

## Prerequisites
To run this project, you will need:
- **Node.js** (v18+ recommended)
- **pnpm** (Package manager)
- **TiDB / MySQL** (A running MySQL-compatible database instance. TiDB was used for this project)

## Getting Started

1. **Clone the repository** and navigate to the project directory:
   ```bash
   cd server
   ```

2. **Install dependencies** using pnpm:
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your TiDB/MySQL database connection URI:
   ```env
   DATABASE_URI="mysql://<user>:<password>@<host>:<port>/<database>?ssl={"minVersion":"TLSv1.2"}"
   ```

4. **Run the application**:
   For development (with hot-reloading):
   ```bash
   pnpm run watch
   ```
   For production build:
   ```bash
   pnpm run build
   pnpm run start
   ```

## Database Schema

The application requires a `users` table to cache the GitHub profile data. Run the following SQL block in your TiDB/MySQL database to create the table:

```sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    company VARCHAR(255),
    location VARCHAR(255),
    bio TEXT,
    email VARCHAR(255),
    avatar_url VARCHAR(500),
    github_link VARCHAR(255) NOT NULL,
    follower_count INT NOT NULL,
    following_count INT NOT NULL,
    public_repo_count INT NOT NULL,
    most_used_language VARCHAR(255),
    total_stars INT NOT NULL,
    top_repo VARCHAR(255),
    joined_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

The endpoints for user operations are prefixed with `/users` as mounted in the main application.

### 1. GET `/users`
Fetches a list of all users currently saved in the database.

- **Example Request**: `GET /users`
- **Response**: A JSON array of all saved user objects.

### 2. GET `/users/:username`
Retrieves a specific GitHub user's data. 
- **Behavior**: It first checks if the user exists in the local database. If found, it returns the local record. If not found, it dynamically fetches the data from the GitHub API, formats it, and returns it (without saving it to the database).
- **Query Parameter**: `?html=true` (or `1`). If provided, the API returns a beautifully rendered HTML profile card instead of raw JSON data.
- **Example JSON Request**: `GET /users/abhiram86`
- **Example HTML Request**: `GET /users/abhiram86?html=true`

### 3. POST `/users/:username`
Fetches a GitHub user's data and their repositories, calculates their statistics, and saves the data to the local database.
- **Behavior**: It first checks if the user is already in the database. If so, it returns a `409 Conflict` (User already exists). If not, it fetches data from GitHub, calculates metrics like `total_stars`, `top_repo`, and `most_used_language`, inserts the record into the DB, and returns the newly saved record.
- **Query Parameter**: `?html=true` (or `1`). If provided, it responds with the HTML profile upon successful database insertion.
- **Example Request**: `POST /users/abhiram86`
- **Error Response**:
  ```json
  { "error": "User already exists" }
  ```
- **Success Response** (when `?html=false`): 
  Returns the saved JSON user object.
