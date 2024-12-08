import { Link } from 'react-router-dom'
import { useNavigate} from 'react-router-dom';

const Sidenav = () => {

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                console.log('Logout successful');
                navigate('/login'); // Redirect to login page after successful logout
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error.message);
        }
    };
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
            <Link to="/create">
                <h3>Create Trip</h3>
            </Link>
            <button className="logout" onClick={handleLogout}>
                <h3>Logout</h3>
            </button>
        </div>
    )
}

export default Sidenav;