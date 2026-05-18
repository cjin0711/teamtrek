import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from '../uploads/default_avatar.jpg';

const TABS = [
    { key: 'friends', label: 'Friends' },
    { key: 'incoming', label: 'Incoming' },
    { key: 'outgoing', label: 'Outgoing' },
];

const EMPTY_MESSAGES = {
    friends: 'No friends yet.',
    incoming: 'No incoming requests.',
    outgoing: 'No outgoing requests.',
};

const apiFetch = (url, options = {}) => (
    fetch(url, {
        credentials: 'include',
        ...options,
    })
);

const Friends = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('friends');
    const [friends, setFriends] = useState([]);
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmRemove, setConfirmRemove] = useState(null);

    const fetchUsersByIds = async (ids) => {
        if (!ids.length) {
            return [];
        }

        const responses = await Promise.all(
            ids.map((userId) => apiFetch(`/api/user/${userId}`))
        );

        const validResponses = responses.filter((response) => response.ok);
        const users = await Promise.all(
            validResponses.map(async (response) => {
                const data = await response.json();
                return data.user;
            })
        );

        return users.filter(Boolean);
    };

    const loadFriendsData = async () => {
        setLoading(true);
        setError('');

        try {
            const [friendsRes, statusRes] = await Promise.all([
                apiFetch('/api/friends'),
                apiFetch('/api/friends/requestStatus'),
            ]);

            if (!friendsRes.ok) {
                throw new Error('Failed to load friends');
            }
            if (!statusRes.ok) {
                throw new Error('Failed to load friend requests');
            }

            const friendsData = await friendsRes.json();
            const statusData = await statusRes.json();

            const incomingIds = statusData.incomingPending || [];
            const outgoingIds = statusData.outgoingPending || [];

            const [incomingUsers, outgoingUsers] = await Promise.all([
                fetchUsersByIds(incomingIds),
                fetchUsersByIds(outgoingIds),
            ]);

            setFriends(friendsData.friends || []);
            setIncoming(incomingUsers);
            setOutgoing(outgoingUsers);
        } catch (err) {
            setError(err.message || 'Failed to load friends');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFriendsData();
    }, []);

    const handleAccept = async (userId) => {
        try {
            const res = await apiFetch(`/api/friends/accept/${userId}`, {
                method: 'PATCH',
            });
            if (!res.ok) {
                throw new Error('Failed to accept request');
            }
            await loadFriendsData();
        } catch (err) {
            setError(err.message || 'Failed to accept request');
        }
    };

    const handleReject = async (userId) => {
        try {
            const res = await apiFetch(`/api/friends/reject/${userId}`, {
                method: 'PATCH',
            });
            if (!res.ok) {
                throw new Error('Failed to reject request');
            }
            await loadFriendsData();
        } catch (err) {
            setError(err.message || 'Failed to reject request');
        }
    };

    const handleRemove = async (userId) => {
        try {
            const res = await apiFetch(`/api/friends/remove/${userId}`, {
                method: 'PATCH',
            });
            if (!res.ok) {
                throw new Error('Failed to remove friend');
            }
            await loadFriendsData();
        } catch (err) {
            setError(err.message || 'Failed to remove friend');
        }
    };

    const usersByTab = {
        friends,
        incoming,
        outgoing,
    };

    const counts = { friends: friends.length, incoming: incoming.length, outgoing: outgoing.length };
    const currentUsers = usersByTab[activeTab];

    const renderActions = (user) => {
        if (activeTab === 'incoming') {
            return (
                <div className="friends-card-actions">
                    <button
                        className="friends-icon-btn friends-icon-btn-reject"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleReject(user._id);
                        }}
                        aria-label={`Decline friend request from ${user.username}`}
                        title="Decline"
                    >
                        ×
                    </button>
                    <button
                        className="friends-icon-btn friends-icon-btn-accept"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAccept(user._id);
                        }}
                        aria-label={`Accept friend request from ${user.username}`}
                        title="Accept"
                    >
                        ✓
                    </button>
                </div>
            );
        }

        if (activeTab === 'friends') {
            return (
                <div className="friends-card-actions">
                    <button
                        className="friends-remove-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            setConfirmRemove(user);
                        }}
                    >
                        Remove
                    </button>
                </div>
            );
        }

        return <p className="friends-pending-label">Request pending</p>;
    };

    return (
        <div className="friends">
            <h1>Friends</h1>
            <div className="friends-tabs" role="tablist" aria-label="Friend categories">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        className={`friends-tab${activeTab === tab.key ? ' active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label} {!loading && `(${counts[tab.key]})`}
                    </button>
                ))}
            </div>

            {error ? <p>{error}</p> : null}

            {confirmRemove && (
                <div className="modal-overlay" onClick={() => setConfirmRemove(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3>Remove Friend?</h3>
                        <p>Remove <strong>@{confirmRemove.username}</strong> from your friends?</p>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="filter-toggle"
                                onClick={() => setConfirmRemove(null)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    handleRemove(confirmRemove._id);
                                    setConfirmRemove(null);
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div>Loading friends...</div>
            ) : currentUsers.length > 0 ? (
                <div className="friends-grid">
                    {currentUsers.map((user) => (
                        <div
                            key={user._id}
                            className="friend-card clickable-card"
                            onClick={() => navigate(`/profile/${user._id}`)}
                        >
                            <img
                                src={defaultAvatar}
                                alt={`${user.username}'s avatar`}
                                className="user-card-avatar"
                            />
                            <div className="friend-info">
                                <h3 className="user-card-handle">@{user.username}</h3>
                                <p>Email: {user.email || 'No email listed'}</p>
                                <p>Bio: {user.bio || 'No bio yet'}</p>
                                {renderActions(user)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>{EMPTY_MESSAGES[activeTab]}</p>
            )}
        </div>
    );
};

export default Friends;
