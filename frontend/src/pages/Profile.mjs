import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Profile = () => {
    const { id } = useParams(); // Extract the "id" parameter from the URL
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    console.log('USER ID: ', id);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                console.log('Fetching user details for user ID:', id);
                const userDetails = await fetch(`/api/user/${id}`);
                if (!userDetails.ok) {
                    throw new Error('Failed to fetch user details');
                }
                const data = await userDetails.json();
                console.log('DATA:', data.user);
            
                setUser(data.user);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>No user found</div>;

    return (
        <div className="user-details">
            <h2>User Details</h2>
            <div>Viewing details for user ID: {id}</div>
            <div className="user-info">
                <h3>{user.username}</h3>
                <p>Email: {user.email}</p>
                <p>First Name: {user.firstName}</p>
                <p>Last Name: {user.lastName}</p>
            </div>
        </div>
    );
}
