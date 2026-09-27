# Modern MERN Stack Blog Platform

> A production-grade, full-stack blogging application engineered with **Node.js, Express, MongoDB (Mongoose), and React (Vite)**. Featuring JWT authentication, Multer-powered image uploads, relational MongoDB referencing, real-time comments, and a clean, high-contrast light design system.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [MongoDB Setup Options](#mongodb-setup-options)
4. [Installation & Setup](#installation--setup)
5. [Environment Variables (.env)](#environment-variables-env)
6. [Exact Run Commands](#exact-run-commands)
7. [Demo Login Credentials (College Demo)](#demo-login-credentials-college-demo)
8. [Full API Reference](#full-api-reference)
9. [Features & Design System](#features--design-system)

---

## Prerequisites
Before running the application, ensure the following are installed:
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **npm**: v9.0.0 or higher
* **MongoDB**: Either local MongoDB (v6.0+), a MongoDB Atlas account, or the included zero-config in-memory MongoDB runner.
* **Modern Web Browser**: Chrome, Edge, Firefox, or Safari.

---

## Architecture Overview
```
blog/
├── backend/
│   ├── config/         # MongoDB connection lifecycle & error handling
│   ├── controllers/    # Business logic (auth, posts, comments, users)
│   ├── middleware/     # JWT authentication, upload handlers, 404, error handler
│   ├── models/         # Mongoose schemas (User, Post, Comment)
│   ├── routes/         # Express REST route definitions
│   ├── uploads/        # Static disk storage for uploaded cover images
│   ├── utils/          # Seed script & automated API test runner
│   ├── app.js          # Express middleware and routing pipeline
│   ├── server.js       # HTTP server bootstrap with DB connection
│   └── devServer.js    # In-memory MongoDB runner (for instant demos)
├── frontend/
│   ├── src/
│   │   ├── components/ # Navbar, Footer, BlogCard, ProtectedRoute, Modals
│   │   ├── context/    # AuthContext, ToastContext, AppContext
│   │   ├── pages/      # Home, PostDetail, CreateBlog, EditPost, MyBlogs, Profile, Login, Register, Search, 404
│   │   ├── services/   # Axios API client, authService, postService, commentService, userService
│   │   ├── App.jsx     # Client routing with React Router v7
│   │   └── index.css   # Custom CSS tokens, modern white theme, animations, responsive rules
│   └── index.html
└── README.md
```

---

## MongoDB Setup Options

### Option A: Local MongoDB (Recommended for Local Dev)
1. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community).
2. Start the MongoDB daemon (`mongod`). The default connection URI is:
   ```
   mongodb://127.0.0.1:27017/blog-platform
   ```

### Option B: MongoDB Atlas (Cloud Database)
1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, add `0.0.0.0/0` (or your current IP address).
3. Under **Database Access**, create a user with read/write permissions.
4. Obtain your connection string and set it in `backend/.env`:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/blog-platform?retryWrites=true&w=majority
   ```

### Option C: Zero-Config In-Memory MongoDB (Instant College Demo)
If presenting on a machine without MongoDB installed or without internet:
* Run `npm run dev:mem` inside `backend/`. This automatically boots a local in-memory MongoDB server on port `27018` without any external dependencies!

---

## Installation & Setup

### 1. Clone or Open Project Directory
```bash
cd blog
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

## Environment Variables (.env)

### Backend (`backend/.env`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/blog-platform
JWT_SECRET=supersecret_jwt_key_blog_platform_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`frontend/.env` - optional defaults to `http://localhost:5000/api`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Exact Run Commands

### 1. Database Seeder (Populate Sample Posts & Demo Users)
Run the automated database seed script:
```bash
cd backend
npm run seed
```
> **What this does**: Clears the database and seeds 1 Author user, 1 Reviewer user, 6 detailed blog articles across 6 distinct categories, copies real image files to `backend/uploads/`, and creates sample comments.

### 2. Start Backend Server
* **Standard (Local/Atlas MongoDB)**:
  ```bash
  cd backend
  npm run dev
  ```
  *Server starts on `http://localhost:5000`*

* **Instant Demo Mode (With MongoDB Memory Server)**:
  ```bash
  cd backend
  npm run dev:mem
  ```

### 3. Start Frontend Client
In a separate terminal window:
```bash
cd frontend
npm run dev
```
*Frontend opens at `http://localhost:5173`*

---

## Demo Login Credentials (College Demo)

Use these credentials during your presentation to demonstrate multi-user workflows:

| Role | Name | Username | Email | Password |
|---|---|---|---|---|
| **Author (Primary)** | Demo Student | `demo_user` | `demo@example.com` | `Password123!` |
| **Reviewer (Secondary)** | Sarah Connor | `sarah_reviewer` | `sarah@example.com` | `Password123!` |

---

## Full API Reference

All API routes are prefixed with `/api`.

### 1. System Health
| Method | Endpoint | Protected | Description |
|---|---|:---:|---|
| `GET` | `/api/health` | No | Server health status, uptime, and timestamp |

### 2. Authentication (`/api/auth`)
| Method | Endpoint | Protected | Description |
|---|---|:---:|---|
| `POST` | `/api/auth/register` | No | Register new user (validates duplicate email/username) |
| `POST` | `/api/auth/login` | No | Log in via email/username + password, issues signed JWT |
| `GET` | `/api/auth/me` | **Yes** | Returns authenticated user details (password omitted) |

### 3. Posts (`/api/posts`)
| Method | Endpoint | Protected | Description |
|---|---|:---:|---|
| `GET` | `/api/posts` | No | Retrieve all posts sorted newest first with populated author and comment/like counts |
| `GET` | `/api/posts/search` | No | Search posts by text query (`q`) and category (`category`) |
| `GET` | `/api/posts/:id` | No | Retrieve single post details by MongoDB ID (increments views counter) |
| `GET` | `/api/posts/:id/related` | No | Retrieve related posts in the same category |
| `POST` | `/api/posts/:id/like` | **Yes** | Toggle like/unlike on a post for the authenticated user |
| `POST` | `/api/posts` | **Yes** | Create new post (supports `multipart/form-data` image upload) |
| `PUT` | `/api/posts/:id` | **Yes** (Author only) | Update post content, category, or replace cover image |
| `DELETE` | `/api/posts/:id` | **Yes** (Author only) | Delete post, cascade-delete comments, and delete image from disk |

### 4. Comments (`/api/comments`)
| Method | Endpoint | Protected | Description |
|---|---|:---:|---|
| `GET` | `/api/comments/:postId` | No | Fetch all comments for a post sorted newest first |
| `POST` | `/api/comments/:postId` | **Yes** | Post a new comment linked to the authenticated user |
| `DELETE` | `/api/comments/:commentId` | **Yes** (Author only) | Delete own comment (strictly forbidden to non-authors: returns 403) |

### 5. Users (`/api/users`)
| Method | Endpoint | Protected | Description |
|---|---|:---:|---|
| `GET` | `/api/users/:id` | No | Retrieve public user profile (name, username, email, join date) |
| `GET` | `/api/users/:id/posts` | No | Retrieve all posts authored by a specific user |

---

## Features & Design System

### 🎨 Clean Modern Pink Aesthetic
* **Tailored Light Theme**: Crisp pure white backgrounds (`#ffffff`), subtle borders (`#fce7ef`), deep slate typography (`#0f172a`), and vibrant pink accents (`#ec4899`, `#db2777`, `#f472b6`).
* **Visual Polish**: Smooth CSS transitions, card elevations, badge pills, like animations, and avatar initials.

### 🔔 Interactive Feedback & Animations
* **Toast Notifications**: Automatic non-blocking feedback for login, registration, article creation, edits, deletion, and comment events.
* **Loading States**: Skeletons for post cards and detail views; interactive inline spinners on action buttons.

### 📱 Responsive Layout
* **Mobile First**: Fluid navigation with hamburger menu drawer on mobile screens (< 768px).
* **Adaptive Grids**: Blog grids collapse dynamically to single-column feeds on smaller devices.
* **Touch-Friendly Controls**: Horizontally scrollable category pills on mobile viewport.

### 🛡️ Security Best Practices
* Passwords hashed using `bcryptjs` with salt rounds.
* Stateless JWT authentication with expiration.
* Input validation on both client and server layers.
* Author verification guards preventing unauthorized updates or deletions.
* File upload restrictions: restricted to JPG/PNG/WEBP under 5MB with automated orphan file cleanup.
