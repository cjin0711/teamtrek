import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import defaultAvatar from '../uploads/default_avatar.jpg';

const apiFetch = (url, options = {}) => (
    fetch(url, {
        credentials: 'include',
        ...options,
    })
);

const Profile = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [tripsCompleted, setTripsCompleted] = useState(null);
    const [isSelf, setIsSelf] = useState(true);
    const [isFriend, setIsFriend] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [requestSent, setRequestSent] = useState(false);
    const [requestRecieved, setRequestRecieved] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                setError(null);
                setIsSelf(true);
                setIsFriend(false);
                setRequestSent(false);
                setRequestRecieved(false);

                const userDetails = await apiFetch(`/api/user/${id}`);
                if (!userDetails.ok) throw new Error('Failed to fetch user details');

                const data = await userDetails.json();
                if (data.authorized === false) {
                    navigate('/login');
                }
                setIsSelf(Boolean(data.isSelf));
                setIsFriend(Boolean(data.isFriend));
                setUser(data.user);
                setTripsCompleted(data.completed);

                const friendStatus = await apiFetch('/api/friends/requestStatus');
                if (friendStatus.ok) {
                    const friendData = await friendStatus.json();
                    const sent = friendData.outgoingPending.some(
                        (pendingId) => pendingId.toString() === id
                    );
                    setRequestSent(sent);

                    const recieved = friendData.incomingPending.some(
                        (pendingId) => pendingId.toString() === id
                    );
                    setRequestRecieved(recieved);
                }
            } catch (fetchError) {
                setError(fetchError.message);
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

    const handleAddFriend = async () => {
        try {
            setError(null);
            const response = await apiFetch(`/api/friends/request/${id}`, {
                method: 'POST',
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to send friend request');
            }
            setRequestSent(true);
            setRequestRecieved(false);
            setIsFriend(false);
        } catch (requestError) {
            setError(requestError.message);
        }
    };

    const handleAcceptFriend = async () => {
        try {
            setError(null);
            const response = await apiFetch(`/api/friends/accept/${id}`, {
                method: 'PATCH',
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to accept friend request');
            }
            setRequestRecieved(false);
            setRequestSent(false);
            setIsFriend(true);

            setUser((prev) => ({
                ...prev,
                friends: [...(prev.friends || []), id]
            }));
        } catch (requestError) {
            setError(requestError.message);
        }
    };

    const handleRejectFriend = async () => {
        try {
            setError(null);
            const response = await apiFetch(`/api/friends/reject/${id}`, {
                method: 'PATCH',
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to reject friend request');
            }
            setRequestRecieved(false);
            setRequestSent(false);
            setIsFriend(false);
        } catch (requestError) {
            setError(requestError.message);
        }
    };

    const handleRemoveFriend = async () => {
        try {
            setError(null);
            const response = await apiFetch(`/api/friends/remove/${id}`, {
                method: 'PATCH',
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to remove friend');
            }
            setIsFriend(false);
            setRequestSent(false);
            setRequestRecieved(false);

            setUser((prev) => ({
                ...prev,
                friends: (prev.friends || []).filter((friendId) => friendId.toString() !== id)
            }));
        } catch (requestError) {
            setError(requestError.message);
        }
    };

    const displayName = user.displayName || user.username;
    const joined = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Unknown';

    return (
        <div className="user-details profile-page">
            <div className="profile-container">
                <div className="user-info profile-card">
                    <img
                        src={defaultAvatar}
                        alt={`${displayName}'s avatar`}
                        className="profile-avatar"
                    />
                    <h2>{displayName}</h2>
                    {user.displayName && <h4>@{user.username}</h4>}
                    <h4>Member since {joined}</h4>
                    {user.hometown && <h4>Based in: {user.hometown}</h4>}

                    <div className="profile-stats">
                        <button
                            type="button"
                            className="profile-stat"
                            onClick={() => navigate('/dashboard')}
                        >
                            <span className="profile-stat-value">{tripsCompleted ?? '-'}</span>
                            <span className="profile-stat-label">Completed Trips</span>
                        </button>
                        <button
                            type="button"
                            className="profile-stat"
                            onClick={() => navigate('/friends')}
                        >
                            <span className="profile-stat-value">{user.friends?.length ?? 0}</span>
                            <span className="profile-stat-label">Friends</span>
                        </button>
                    </div>

                    <hr />
                    {isSelf && <h4>Email: {user.email}</h4>}
                    <h4>Bio: {user.bio || 'No bio yet.'}</h4>
                </div>

                {isSelf ? (
                    <button
                        className="profile-edit-btn"
                        onClick={() => navigate(`/profile/${user._id}/settings`)}
                    >
                        Edit Profile
                    </button>
                ) : isFriend ? (
                    <button
                        className="remove-friend-btn"
                        onClick={handleRemoveFriend}
                    >
                        Remove Friend
                    </button>
                ) : requestSent ? (
                    <button className="add-friend-btn" disabled>
                        Request Sent
                    </button>
                ) : requestRecieved ? (
                    <div className="friend-btns">
                        <button
                            className="reject-friend-btn"
                            onClick={handleRejectFriend}
                        >
                            Decline
                        </button>
                        <button
                            className="accept-friend-btn"
                            onClick={handleAcceptFriend}
                        >
                            Accept
                        </button>
                    </div>
                ) : (
                    <button
                        className="add-friend-btn"
                        onClick={handleAddFriend}
                    >
                        Add Friend
                    </button>
                )}
            </div>
        </div>
    );
};

export default Profile;
