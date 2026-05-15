# 🧳 Team Trek

A group trip planner web application that helps friends coordinate and plan travel adventures together.

## 🎯 Features

### 🔐 Authentication
- User registration with secure password hashing (bcryptjs)
- Login/logout with Passport.js session management

### 👥 Friend System
- Add and manage friends
- Send/receive friend requests with approval workflow
- View friend profiles and their public trips

### ✈️ Trip Management
- **Create trips** with destination, dates, description, and capacity settings
- **Browse trips** via explore page to discover public trips
- **Trip details** view with participant lists and trip information
- **Dashboard** showing all your trips at a glance
- Public/private trip visibility with optional password protection

### 👤 User Profiles
- Customizable profile with bio and social links
- View other users' profiles
- Settings page for account configuration

## 🛠️ Tech Stack

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- Passport.js for authentication
- Session-based user management

**Frontend:**
- React 18 with React Router for navigation
- Component-based architecture (Navbar, Sidenav, Friendbar)
- Responsive layout with CSS

