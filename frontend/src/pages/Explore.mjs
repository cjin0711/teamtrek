import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Explore = () => {
    const [query, setQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [maxParticipants, setMaxParticipants] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        console.log('SEARCH QUERIED');

        const params = new URLSearchParams();
        if (query.trim()) {
            params.set('q', query.trim());
        }
        if (startDate) {
            params.set('startDate', startDate);
        }
        if (endDate) {
            params.set('endDate', endDate);
        }
        if (maxParticipants) {
            params.set('maxParticipants', maxParticipants);
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

    const handleView = async(id) => {
        try {
            navigate(`/trip/${id}`);
        } 
        catch (e) {
            console.error(e);
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
                <button
                    type="button"
                    className="filter-toggle"
                    onClick={() => setShowFilters((current) => !current)}
                >
                    {showFilters ? 'Hide Filters' : 'Filters'}
                </button>
                <button type='submit'>Search</button>
            </form>
            {showFilters && (
                <div className="filter-panel">
                    <div className="filter-field">
                        <label htmlFor="startDate">Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="filter-field">
                        <label htmlFor="endDate">End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="filter-field">
                        <label htmlFor="maxParticipants">Max Participants</label>
                        <input
                            type="number"
                            min="1"
                            id="maxParticipants"
                            value={maxParticipants}
                            onChange={(e) => setMaxParticipants(e.target.value)}
                            placeholder="e.g. 6"
                        />
                    </div>
                </div>
            )}
            <div className="trips-grid">
                {results.length === 0 ? (
                    <p>No trips found.</p>
                ) : (
                    results.map(result => (
                        <div
                            key={result._id}
                            className="trip-card clickable-card"
                            onClick={() => handleView(result._id)}
                        >
                            <div className="trip-info">
                                <h3>{result.name}</h3>
                                <p>Destination: {result.destination}</p>
                                <p>Start: {new Date(result.dates.start).toLocaleDateString()}</p>
                                <p>End: {new Date(result.dates.end).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

    );
}

export default Explore;
