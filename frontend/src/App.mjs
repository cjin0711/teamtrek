import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'

import './index.css'
import Login from './pages/Login.mjs'
import Register from './pages/Register.mjs'
import Navbar from './components/Navbar.mjs'
import Sidenav from './components/Sidenav.mjs'
import Friendbar from './components/Friendbar.mjs'
import Dashboard from './pages/Dashboard.mjs'
import Create from './pages/Create.mjs'
import TripDetails from './pages/TripDetails.mjs'
import Profile from './pages/Profile.mjs'
import Settings from './pages/Settings.mjs'
import Friends from './pages/Friends.mjs'

function SidenavWrapper() {
  // for getting user's current route location
  const location = useLocation();

  // routes where sidenav bar should not be displayed
  const nonAuthRoutes = ['/', '/login', '/register'];

  if (nonAuthRoutes.includes(location.pathname)) {
    return null;
  }

  return <Sidenav />;
}

function FriendnavWrapper() {
  const location = useLocation();
  const friendRoutes = ['/friends', '/pending', '/approve'];

  if (!friendRoutes.includes(location.pathname)) {
    return null;
  }

  return <Friendbar />;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar/>
        <div className = "content">
          <SidenavWrapper/>
          <div className="pages">
            <FriendnavWrapper/>
            <Routes>
              {/* HOME ROUTE */}
              <Route path="/"
                element={<Navigate to="/login"/>}
              />

              {/* LOGIN ROUTE */}
              <Route path="/login"
                element={<Login/>}
              />

              {/* REGISTER ROUTE */}
              <Route path="/register"
                element={<Register/>}
              />

              {/* DASHBOARD ROUTE */}
              <Route path="/dashboard"
                element={<Dashboard/>}
              />

              {/* CREATE ROUTE */}
              <Route path="/create"
                element={<Create/>}
              />

              {/* TRIP DETAILS ROUTE */}
              <Route path="/trip/:id" 
                element={<TripDetails />} 
              />

              {/* PROFILE ROUTE */}
              <Route path="/profile/:id"
                element={<Profile/>}
              />

              {/* FRIENDS ROUTE */}
              <Route path ="/friends"
                element={<Friends/>}
              />

              {/* SETTINGS ROUTE */}
              <Route path="/profile/:id/settings"
                element={<Settings/>}
              />
              
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
