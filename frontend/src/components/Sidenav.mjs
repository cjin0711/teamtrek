import { useState, useEffect } from 'react';
import { Link, useNavigate} from 'react-router-dom';

const Sidenav = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/profile');
                if (!response.ok && response.status !== 401) {
                    throw new Error('Failed to fetch profile');
                }
                const data = await response.json();
                if (data.authorized === false) {
                    navigate('/login');
                }
                console.log(`DATA: ${data}`);
                setUser(data.user);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading sidebar</div>;
    if (!user) return null;

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
            <Link to={`/profile/${user._id}`}>
                <h3>Profile</h3>
            </Link>
            <Link to="/friends">
                <h3>Friends</h3>
            </Link>
            <Link to="/create">
                <h3>Create Trip</h3>
            </Link>
            <button className="logout" onClick={handleLogout}>
                <h4>Logout</h4>
            </button>
        </div>
    )
}

export default Sidenav;