import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Explore = () => {
    
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = async (e) => {
        e.preventDefault();
        console.log('SEARCH QUERIED');

        const params = new URLSearchParams();
        if (query.trim()) {
            params.set('q', query.trim());
        }

        try {
            const response = await fetch(`/api/trip/search?${params.toString()}`, {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Search request failed');
            }
            const data = await response.json();
            setResults(data.trips || []);
            
        }
        catch (error) {
            console.error('Trip search failed:', error);
        }
    }

    return (
        <div className="search">
            <h2>Search Trips</h2>
            <form onSubmit={handleSearch}>
                <div className='searchbar'>
                    <input type='text' placeholder='Search...' id='searchbar' value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <button type='submit'>Search</button>
            </form>
            <ul>
                {results.map((trip) => (
                    <li key={trip._id}>{trip.name}</li>
                ))}
            </ul>
        </div>

    );
}

export default Explore;