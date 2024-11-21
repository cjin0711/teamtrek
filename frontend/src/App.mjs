import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './index.css'
import Home from './pages/Home.mjs'
import Login from './pages/Login.mjs'
import Register from './pages/Register.mjs'
import Navbar from './components/Navbar.mjs'


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar/>
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

          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
