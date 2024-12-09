import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Profile = () => {
    const { id } = useParams();
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
                if (data.authorized === false) {
                    navigate('/login');
                }
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

    const handleEdit = async (id) => {
        try {
            navigate(`/profile/${id}/settings`);
        }
        catch {
            console.log('Error navigating to settings');
        }
    }

    return (
        <div className="user-details">
            {/* <div>Viewing details for user ID: {id}</div> */}
            <div className="user-info">
                <h1>Hello {user.username}!</h1>
                <hr></hr>
                <h4>Email: {user.email}</h4>
                {/* <p>First Name: {user.firstName}</p>
                <p>Last Name: {user.lastName}</p> */}
                <h4>Phone: {user.phone}</h4>
                <h4>{user.socials}</h4>
                <h4>Bio: {user.bio}</h4>
            </div>
            <button onClick={() => handleEdit(user._id)}>Edit Profile</button>
        </div>
    );
}

export default Profile;