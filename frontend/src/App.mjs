import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'

import './index.css'
import Login from './pages/Login.mjs'
import Register from './pages/Register.mjs'
import Navbar from './components/Navbar.mjs'
import Sidenav from './components/Sidenav.mjs'
import Dashboard from './pages/Dashboard.mjs'
import Create from './pages/Create.mjs'
import TripDetails from './pages/TripDetails.mjs'
import TripEdit from './pages/TripEdit.mjs'
import Explore from './pages/Explore.mjs'
import Profile from './pages/Profile.mjs'
import Settings from './pages/Settings.mjs'
import Friends from './pages/Friends.mjs'
import UserSearch from './pages/UserSearch.mjs'
import ProfileFriends from './pages/ProfileFriends.mjs'
import ProfileTrips from './pages/ProfileTrips.mjs'


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

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar/>
        <div className="app-shell">
          <SidenavWrapper/>
          <div className="pages">
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
              <Route path="/trip/create"
                element={<Create/>}
              />

              {/* TRIP DETAILS ROUTE */}
              <Route path="/trip/:id" 
                element={<TripDetails />} 
              />

              {/* TRIP EDIT ROUTE */}
              <Route path="/trip/:id/edit"
                element={<TripEdit />}
              />

              {/* PROFILE ROUTE */}
              <Route path="/profile/:id"
                element={<Profile/>}
              />

              {/* PROFILE FRIENDS ROUTE */}
              <Route path="/profile/:id/friends"
                element={<ProfileFriends/>}
              />

              {/* PROFILE TRIPS ROUTE */}
              <Route path="/profile/:id/trips"
                element={<ProfileTrips/>}
              />

              {/* USER SEARCH */}
              <Route path="/user/search"
                element={<UserSearch/>}
              />

              {/* FRIENDS ROUTE */}
              <Route path ="/friends"
                element={<Friends/>}
              />

              {/* SETTINGS ROUTE */}
              <Route path="/profile/:id/settings"
                element={<Settings/>}
              />
              <Route path="/trip/search"
                element={<Explore/>}
              />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
