# SprintMate

SprintMate is a lightweight productivity web application for managing schedules, tasks, and personal progress. It provides a dashboard-style UI, chat/AI assists, and account management including secure password reset flows. This repository contains both the frontend (React + Vite + Tailwind) and backend (Node.js + Express + MongoDB) implementations.

## About

SprintMate is designed to help individuals plan sprints, track progress, create schedules, and manage tasks. It also includes account management (register/login, forgot/reset password flows), and integrations for notifications and AI-assisted chat features.

## Features

- Dashboard with charts and widgets
- Task and schedule management
- Progress tracking
- In-app chat / AI assistant
- User authentication and profile management
- Forgot password → email OTP flow and Reset Password

## Architecture

- Frontend: React (Vite), Tailwind CSS, React Router
- Backend: Node.js, Express, MongoDB (Mongoose)
- API: REST endpoints under `backend` served from `server.js`/`app.js`

Project layout (top-level):

- `backend/` — Express server, controllers, models, routes, services
- `frontend/` — React app source and components

## Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- MongoDB (local or Atlas)

## Environment variables

Create a `.env` file in `backend/` with at least the following variables:

- `PORT` - backend port (default 5173 in some dev setups)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `EMAIL_USER` - SMTP email user (for OTPs)
- `EMAIL_PASS` - SMTP email password

Example `.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/sprintmate
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=youremail@example.com
EMAIL_PASS=your_email_password
```

## Setup & Run (Backend)

1. Open a terminal and navigate to the `backend` folder:

```powershell
cd e:\Sprint-Mate\backend
```

2. Install dependencies and start the server:

```powershell
npm install
npm run dev
```

Common backend scripts are defined in `backend/package.json` (check `start`/`dev`). Confirm the server's listening port in `backend/app.js` or environment variables.

## Setup & Run (Frontend)

1. Open a separate terminal and navigate to the `frontend` folder:

```powershell
cd e:\Sprint-Mate\frontend
```

2. Install dependencies and start the dev server:

```powershell
npm install
npm run dev
```

By default the React app uses Vite and will print the local dev URL (e.g. `http://localhost:5173`).

## Important routes

Frontend routes (see `frontend/src/routes.jsx`):

- `/` — Landing
- `/login` — Login
- `/register` — Register
- `/forgot-password` — Forgot Password (enter email to get OTP)
- `/reset-password` — Reset Password (enter OTP + new password)
- `/dashboard` — Protected app area (nested routes: `/profile`, `/schedules`, `/progress`, `/chat`, ...)

Backend API (see `backend/routes/authRoutes.js` and controllers):

- `POST /auth/login` — Login
- `POST /auth/register` — Register
- `POST /auth/forgot-password` — Send OTP to email
- `POST /auth/reset-password` — Reset password using email + OTP
- `POST /auth/verify-otp` — Verify OTP (used in signup/verification flows)
- `PUT /auth/profile` — Update profile (protected)

## Notes on the Reset Password flow

- The app uses a two-step flow:
	1. `/forgot-password` — user enters email and the backend sends an OTP to the email.
	2. `/reset-password` — user enters the OTP and a new password to complete the reset.

- The Profile page's "Reset Password" button should redirect users to `/forgot-password`. (If you need to change this behavior, edit `frontend/src/pages/ProfilePage.jsx` and update the `handleResetPassword` function.)

## Tests

Check `backend/tests/` for any available unit tests. To run tests (if present):

```powershell
cd e:\Sprint-Mate\backend
npm test
```

## Contributing

If you'd like to contribute:

1. Fork the repo and create a new branch
2. Make changes and add tests where appropriate
3. Run linters and tests locally
4. Open a pull request with a clear description of changes

## License

This project does not include a license file. Add a `LICENSE` file if you intend to open-source it.

---

If you'd like, I can also:

- Add a minimal `README` note for contributing developers with common commands.
- Create a `.env.example` file in `backend/` to document required env vars.
- Update the ProfilePage comment to reference the navigation change (I already changed the code if you asked before).

Tell me which of these you'd like next and I'll implement it.
