import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const response = await fetch('/api/dashboard');
                if (!response.ok && response.status !== 401) {
                    throw new Error('Failed to fetch trips');
                }
                const data = await response.json();
                console.log(`DATA: ${data}`);
                if (data.authorized === false) {
                    navigate('/login');
                }
                else {
                    navigate('/dashboard');
                }
                setTrips(data.trips);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, [navigate]);

    const handleView = async (id) => {
        try {
            navigate(`/trip/${id}`);
        }
        catch {
            console.log('Error fetching trip details');
        }
    }

    if (loading) return <div>Loading trips...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="dashboard">
            <h1>My Trips</h1>
            <div className="trips-grid">
                {trips.length === 0 ? (
                    <p>No trips found. Create your first trip!</p>
                ) : (
                    trips.map(trip => (
                        <div key={trip._id} className="trip-card">
                            <div className="trip-info">
                                <h2>{trip.name}</h2>
                                <p>Destination: {trip.destination}</p>
                                <p>Start: {new Date(trip.dates.start).toLocaleDateString()}</p>
                                <p>End: {new Date(trip.dates.end).toLocaleDateString()}</p>
                            </div>
                            <div className="trip-actions">
                                <button className='viewTrip' onClick={() => handleView(trip._id)}>
                                    <h4>View</h4>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;