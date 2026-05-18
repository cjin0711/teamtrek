import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidenav = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/me');
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
        <aside className='sidenav'>
            <div className="sidenav-header">
                <p className="eyebrow">Navigator</p>
                <h2>{user.username}</h2>
            </div>
            <nav className="sidenav-links">
                <Link to="/dashboard">
                    <h3>Dashboard</h3>
                </Link>
                <Link to={`/profile/${user._id}`}>
                    <h3>Profile</h3>
                </Link>
                <Link to="/friends">
                    <h3>Friends</h3>
                </Link>
                <Link to="/user/search">
                    <h3>Search User</h3>
                </Link>
                <Link to="/trip/search">
                    <h3>Explore</h3>
                </Link>
                <Link to="/trip/create">
                    <h3>Create Trip</h3>
                </Link>
            </nav>
            <button className="logout" onClick={handleLogout}>
                <h4>Logout</h4>
            </button>
        </aside>
    )
}

export default Sidenav;
