import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

import './index.css'
import Home from './pages/Home.mjs'
import Login from './pages/Login.mjs'
import Register from './pages/Register.mjs'
import Navbar from './components/Navbar.mjs'
import Sidenav from './components/Sidenav.mjs'
import Dashboard from './pages/Dashboard.mjs'
import Create from './pages/Create.mjs'
import TripDetails from './pages/TripDetails.mjs'


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
        <div className = "content">
          <SidenavWrapper/>
          <div className="pages">
            <Routes>

              {/* HOME ROUTE */}
              <Route path="/"
                element={<Home/>}
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
              <Route path="/trip/:id" element={<TripDetails />} />

            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
