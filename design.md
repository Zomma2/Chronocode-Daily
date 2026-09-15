# CodeBits Daily - Product Requirements Document & Implementation Guide

## 1. Executive Summary
CodeBits Daily is a web-based learning platform delivering one randomized multiple-choice coding challenge (MCQ) followed by a technical tip of the day for Python and Node.js. 

This document outlines the implementation of the application as a strict single-container architecture. To ensure simplicity and avoid microservices overhead, the application will use a full-stack framework (Next.js) and a file-based database (SQLite) all running within a single Docker container.

---

## 2. Technical Architecture

*   **Application Framework:** Next.js (React for the frontend, Next.js API routes for the backend).
*   **Styling:** Tailwind CSS.
*   **Database:** SQLite (file-based relational database running locally within the container). ORM: Prisma or better-sqlite3.
*   **Deployment:** A single Docker container exposing port 3000. Data persistence is handled via a Docker volume mounted to the SQLite database file.

---

## 3. Database Schema (SQLite)

Since we are utilizing SQLite, the database resides in a single `.db` file (e.g., `codebits.db`).

### Table: Questions
*   `id` (Integer, Primary Key, Auto-increment)
*   `track` (String - 'python' or 'node')
*   `question_text` (Text)
*   `code_snippet` (Text, nullable)
*   `options` (Text - JSON stringified array of 4 strings)
*   `correct_index` (Integer - 0 to 3)
*   `explanation` (Text)
*   `scheduled_date` (Date/String - YYYY-MM-DD to lock question to a specific day)

### Table: Tips
*   `id` (Integer, Primary Key, Auto-increment)
*   `track` (String - 'python' or 'node')
*   `tip_text` (Text)
*   `scheduled_date` (Date/String - YYYY-MM-DD)

### User State (Client-Side)
For Phase 1 MVP in a single container, user state (selected track, streak, whether they answered today) will be stored in the browser's `localStorage` to avoid the overhead of authentication and user sessions.

---

## 4. API Endpoints (Next.js API Routes)

*   `GET /api/daily-challenge?track=python`
    *   Queries SQLite for the question where `scheduled_date` matches today (UTC) and `track` matches the parameter.
    *   Omits the `correct_index` and `explanation` from the initial payload to prevent cheating via browser dev tools.
*   `POST /api/verify-answer`
    *   Payload: `{ question_id: 1, selected_index: 2 }`
    *   Validates the answer against the database.
    *   Returns: `{ correct: boolean, explanation: string, correct_index: number }`
*   `GET /api/daily-tip?track=node`
    *   Queries SQLite for the tip where `scheduled_date` matches today (UTC).

---

## 5. Development Phases & Steps

### Phase 1: Setup and Seeding
1. Initialize a Next.js project with Tailwind CSS.
2. Install SQLite dependencies (`sqlite3`, `better-sqlite3`, or Prisma).
3. Create a seed script (`seed.js`) to populate the `codebits.db` file with 14 days of hardcoded Python and Node.js questions and tips.

### Phase 2: Backend and Frontend Integration
1. Build the API routes to query the SQLite database based on the current UTC date.
2. Create the frontend UI components: Track Selector, Question Card, Answer Buttons, and Tip Panel.
3. Implement `localStorage` logic to track if the user has already answered today's question.

### Phase 3: Containerization
Create a `Dockerfile` to bundle the application and database into a single deployable artifact.

---

## 6. Single Container Implementation (Docker)

To run this entirely in one container, use the following `Dockerfile`.

```dockerfile
# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies (including SQLite requirements)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

### Data Persistence
When running the container, map a volume to the directory containing your SQLite database so that data is not lost if the container restarts.

```bash
docker run -p 3000:3000 -v /path/to/local/data:/app/data codebits-app
```