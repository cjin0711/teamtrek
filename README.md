# Team Trek

Team Trek is a social trip-planning web app for organizing group travel with friends. Users can build a profile, connect with other users, create and manage trips, and explore shared travel plans through friend-gated profile views.

## Current Functionality

### Authentication
- Register with username, email, and password
- Log in and log out with Passport.js session auth
- Protected backend routes for authenticated-only app features

### Profiles
- View your own profile and other user profiles
- Edit profile settings including display name, email, hometown, and bio
- Profile stats for completed trips and friend count
- Friend-only profile navigation to a user's trips and friends

### Friend System
- Send friend requests
- Show `Request Sent` state for outgoing requests
- Accept or decline incoming requests
- Remove existing friends
- Dedicated friends page with `Friends`, `Incoming`, and `Outgoing` tabs
- Compact user cards for friend lists and user search

### Trips
- Create trips with:
  - public or private visibility
  - optional password for private trips
  - destination city and country
  - date range
  - description
  - team size
- Edit existing trips with the same flow and layout
- Browse public trips through the explore/search flow
- Join trips
- Leave trips
- View trip details and participants
- Delete trips as the organizer

### Dashboards and Profile Trip Views
- Personal dashboard showing your trips grouped into:
  - current trips
  - upcoming trips
  - past trips
- Friend-only profile trip page showing that friend's trips grouped the same way
- Friend-only profile friends page showing that friend's friend list

### UI / UX Updates
- Profile page and profile settings page use a shared centered card layout
- Create Trip and Edit Trip use compact card-based form layouts
- Friend request actions are color-coded:
  - red for decline
  - green for accept
- Friend and user cards are simplified and sized to fit three columns on desktop

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Passport.js
- express-session

### Frontend
- React 18
- React Router
- CSS

## Project Structure

- `frontend/` - React client
- `backend/` - Express server, Mongo models, auth, and API routes

## Running The App

### Start development servers

From `backend/`:

```bash
npm start
```

This starts:
- the Express backend on port `8000`
- the React frontend on port `3000`

### Stop dev ports

From `backend/`:

```bash
npm run kill
```

## Seed Data

To populate the database with sample users, friendships, pending friend requests, and trips:

```bash
cd backend
npm run seed
```

The seed script clears existing `users`, `trips`, and `friendrequests` data first, then creates a fresh sample dataset.

All seeded users use:

```text
password123
```

## Notes

- Friend profile trip and friend pages are restricted to the profile owner or their friends.
- Private trips still keep their own trip-level privacy rules.
- The project currently builds successfully with `npm run build` in `frontend/`.
