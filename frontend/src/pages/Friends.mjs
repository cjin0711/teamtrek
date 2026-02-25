import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Friends = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const friends = await fetch('/api/friends');
                if (!friends.ok) {
                    throw new Error('Failed to fetch friends');
                }
                const data = await friends.json();
                console.log('FRIENDS:', data.friends);
                setFriends(data.friends);
                if (data.authorized === false) {
                    navigate('/login');
                }
                else {
                    navigate('/friends');
                }
            }
            catch (error) {
                setError(error.message);
            }
            finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, [navigate]);

    if (loading) return <div>Loading trips...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="friends">
            <h1>My Friends</h1>
            <form>
                <input type="text"></input>
                <input type="submit" value="Search"></input>
            </form>
            <div classname="friends-grid">
                {friends.length === 0 ? (
                    <p>No friends found. Add some friends!</p>
                ) : (
                    friends.map(friend => (
                        <div key={friend._id} className="friend-card">
                            <div className="friend-info">
                                <h2>{friend.username}</h2>
                                <p>Email: {friend.email}</p>
                                <p>Phone: {friend.phone}</p>
                                <p>Bio: {friend.bio}</p>
                                <p>Socials: {friend.socials}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

    )
}

export default Friends;