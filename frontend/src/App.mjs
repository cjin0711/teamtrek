import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

import './index.css'
import Home from './pages/Home.mjs'
import Login from './pages/Login.mjs'
import Register from './pages/Register.mjs'
import Navbar from './components/Navbar.mjs'
import SideNav from './components/SideNav.mjs'


function App() {
  // for getting user's current route location
  const location = useLocation();

  // routes where sidenav bar should not be displayed
  const nonAuthRoutes = ['/', '/login', '/register'];

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar/>
        {/* Conditional checking for sidenav display */}
        {!nonAuthRoutes.includes(location.pathname) && <SideNav/>}
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
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
