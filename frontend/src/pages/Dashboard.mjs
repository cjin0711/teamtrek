import { useState, useEffect } from 'react';

const Dashboard = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const response = await fetch('/api/user/trips');
                if (!response.ok) {
                    throw new Error('Failed to fetch trips');
                }
                const data = await response.json();
                setTrips(data.trips);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, []);

    if (loading) return <div>Loading trips...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="dashboard">
            <h2>My Trips</h2>
            <div className="trips-grid">
                {trips.length === 0 ? (
                    <p>No trips found. Create your first trip!</p>
                ) : (
                    trips.map(trip => (
                        <div key={trip._id} className="trip-card">
                            <h3>{trip.name}</h3>
                            <p>Destination: {trip.destination}</p>
                            <p>Start: {new Date(trip.dates.start).toLocaleDateString()}</p>
                            <p>End: {new Date(trip.dates.end).toLocaleDateString()}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;