import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import defaultAvatar from '../uploads/default_avatar.jpg';

const apiFetch = (url, options = {}) => (
    fetch(url, {
        credentials: 'include',
        ...options,
    })
);

const ProfileFriends = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await apiFetch(`/api/user/${id}/friends`);
                if (!res.ok) {
                    let message = 'Failed to load friends';
                    try {
                        const data = await res.json();
                        message = data.message || message;
                    } catch {
                        // Keep fallback message when response body is not JSON.
                    }
                    throw new Error(message);
                }

                const data = await res.json();
                setUser(data.user);
                setFriends(data.friends || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, [id]);

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="profile-spinner" />
            </div>
        );
    }
    if (error) return <div className="profile-error">{error}</div>;
    if (!user) return <div className="profile-error">No user found</div>;

    const displayName = user.displayName || user.username;

    return (
        <div className="friends">
            <h1>{displayName}&apos;s Friends</h1>

            <button
                className="profile-edit-btn"
                style={{ width: 'auto', marginBottom: '1.5rem' }}
                onClick={() => navigate(`/profile/${id}`)}
            >
                Back to Profile
            </button>

            {friends.length > 0 ? (
                <div className="friends-grid">
                    {friends.map((friend) => (
                        <div
                            key={friend._id}
                            className="friend-card clickable-card"
                            onClick={() => navigate(`/profile/${friend._id}`)}
                        >
                            <img
                                src={defaultAvatar}
                                alt={`${friend.username}'s avatar`}
                                className="user-card-avatar"
                            />
                            <div className="friend-info">
                                <h3 className="user-card-handle">@{friend.username}</h3>
                                <p className="user-card-name">{friend.displayName || friend.username}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>{displayName} has no friends yet.</p>
            )}
        </div>
    );
};

export default ProfileFriends;
