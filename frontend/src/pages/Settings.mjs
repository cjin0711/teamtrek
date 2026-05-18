import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import defaultAvatar from '../uploads/default_avatar.jpg';

const Settings = () => {
    
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [bio, setBio] = useState('');
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [hometown, setHometown] = useState('');

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

                setBio(data.user.bio || '');
                setEmail(data.user.email || '');
                setDisplayName(data.user.displayName || '');
                setHometown(data.user.hometown || '');

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="profile-spinner" />
            </div>
        );
    }
    if (error) return <div className="profile-error">{error}</div>;
    if (!user) return <div className="profile-error">No user found</div>;

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/user/${id}/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bio, email, displayName, hometown }),
            });
            // First check if response is ok
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            console.log(bio, email, displayName, hometown);

            const data = await response.json();
            console.log(data);
            navigate(`/profile/${id}`);

        } catch (error) {
            console.log('No User Update');
            console.error('Error:', error);
        }
    }

    const profileName = displayName || user.displayName || user.username;
    const joined = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Unknown';

    return (
        <div className="user-details profile-page">
            <div className="profile-container settings-container">
                <div className="user-info profile-card settings-card">
                    <img
                        src={defaultAvatar}
                        alt={`${profileName}'s avatar`}
                        className="profile-avatar"
                    />
                    <h3>{profileName}</h3>
                    <h4>@{user.username}</h4>
                    <h4>Member since {joined}</h4>

                    <hr />

                    <form onSubmit={handleSubmit} className="settings-form">
                        <div className="displayName">
                            <label htmlFor="displayName">Display Name</label>
                            <input
                                type="text"
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                        </div>
                        <div className="email">
                            <label htmlFor="email">Email</label>
                            <input
                                type="text"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="hometown">
                            <label htmlFor="hometown">Hometown / Based In</label>
                            <input
                                type="text"
                                id="hometown"
                                value={hometown}
                                onChange={(e) => setHometown(e.target.value)}
                            />
                        </div>
                        <div className="bio">
                            <label htmlFor="bio">Bio</label>
                            <textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows="4"
                            />
                        </div>
                        <div className="settings-actions">
                            <button
                                type="button"
                                className="filter-toggle"
                                onClick={() => navigate(`/profile/${id}`)}
                            >
                                Cancel
                            </button>
                            <button type="submit">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Settings;
