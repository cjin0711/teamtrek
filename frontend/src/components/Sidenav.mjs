import { Link } from 'react-router-dom'

const Sidenav = () => {
    return (
        <div className='sidenav'>
            <Link to="/dashboard">
                <h3>Dashboard</h3>
            </Link>
            <Link to="/profile">
                <h3>Profile</h3>
            </Link>
            <Link to="/friends">
                <h3>Friends</h3>
            </Link>
            <Link to="/settings">
                <h3>Settings</h3>
            </Link>
        </div>
    )
}

export default Sidenav;