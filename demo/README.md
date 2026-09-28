# College Demo & Presentation Guide

Welcome to the **Demo Package** for the MERN Stack Blog Platform. This folder contains all the assets, credentials, scripts, and quick steps needed to deliver a presentation or live demonstration.

---

## 1. Quick Presentation Credentials

Use these pre-seeded accounts during live presentation to demonstrate authentication, role differentiation, author permissions, and multi-user interactions (comments/likes):

| Role | Display Name | Username | Email | Password |
|---|---|---|---|---|
| **Author (Primary)** | Demo Student | `demo_user` | `demo@example.com` | `Password123!` |
| **Reviewer / Commenter** | Sarah Connor | `sarah_reviewer` | `sarah@example.com` | `Password123!` |

---

## 2. Instant Zero-Config Demo Mode

If you are presenting on a machine without MongoDB installed or without internet:

1. **Start In-Memory Backend (Seeds DB automatically)**:
   ```bash
   cd backend
   npm run dev:mem
   ```
   *This automatically starts an in-memory MongoDB database and Express server on `http://localhost:5000` pre-loaded with sample posts, comments, and users.*

2. **Start Frontend Client**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Access the client at `http://localhost:5173`.*

---

## 3. Demo Contents in this Folder

- [`assets/`](./assets/): High-resolution sample cover photos for demonstrating new blog post creation across categories:
  - `demo-tech.jpg` (Technology)
  - `demo-programming.jpg` (Coding / Web Dev)
  - `demo-travel.jpg` (Travel)
  - `demo-food.jpg` (Food & Dining)
  - `demo-lifestyle.jpg` (Lifestyle)
  - `demo-photography.jpg` (Photography)
- [`test_college_demo.cjs`](./test_college_demo.cjs): Automated 16-step end-to-end test script verifying all features (auth, CRUD, uploads, search, comments, authorization protection).
- [`start_demo.bat`](./start_demo.bat): One-click Windows batch file to launch both backend and frontend servers simultaneously.

---

## 4. Suggested Presentation Flow (5 Minutes)

1. **Homepage & Feed**: Show the responsive card grid, category filters, and live search bar.
2. **Authentication**: Log in with `demo@example.com` (`Password123!`). Show JWT persistence in local state.
3. **Create a Post**: Upload one of the photos from [`assets/`](./assets/), choose a category, and publish.
4. **Interactive Discussion**: Switch to the second user (`sarah@example.com`) in an Incognito window and comment on the post.
5. **Authorization Security**: Demonstrate that User 2 cannot edit or delete User 1's posts.
6. **Responsive Design**: Toggle device toolbar to show mobile layout and drawer navigation.
