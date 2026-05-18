import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from '../uploads/default_avatar.jpg';

const UserSearch = () => {
    
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);

    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/user/search?q=${encodeURIComponent(query.trim())}`, {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Search request failed');
            }
            const data = await response.json();
            setResults(data.users || []);
            setSearched(true);

            
        }
        catch (error) {
            console.error('User search failed:', error);
        }
    }

    return (
        <div className="search">
            <h2>Search Users</h2>
            <form onSubmit={handleSearch}>
                <div className="searchbar">
                    <input
                        type='text'
                        placeholder='Search by username...'
                        id='searchbar'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <button type='submit'>Search</button>
            </form>

            <div className="friends-grid">
                {results.length > 0 ? (
                    results.map((user) => (
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
                                <p>Name: {user.displayName || user.username}</p>
                            </div>
                        </div>
                    ))
                ) : searched ? (
                    <p className="search-meta">No users found.</p>
                ) : (
                    <p className="search-meta">Search for a user!</p>
                )}
            </div>
        </div>
    );
}

export default UserSearch;
