import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <header className="topbar">
            <div className="container">
                <Link to="/dashboard">
                    <h1>teamtrek</h1>
                </Link>
            </div>
        </header>
    )
}

export default Navbar;
