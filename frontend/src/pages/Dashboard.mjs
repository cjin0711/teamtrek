import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TripCard from '../components/TripCard.mjs';

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
                if (data.authorized === false) {
                    navigate('/login');
                } else {
                    setTrips(data.trips);
                }
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
        } catch {
            console.log('Error fetching trip details');
        }
    };

    const getTripStatus = (trip) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const start = new Date(trip.dates.start);
        start.setHours(0, 0, 0, 0);

        const end = new Date(trip.dates.end);
        end.setHours(0, 0, 0, 0);

        if (today < start) {
            return 'future';
        }
        if (today > end) {
            return 'past';
        }
        return 'current';
    };

    const currentTrips = trips.filter((trip) => getTripStatus(trip) === 'current');
    const futureTrips = trips.filter((trip) => getTripStatus(trip) === 'future');
    const pastTrips = trips.filter((trip) => getTripStatus(trip) === 'past');
    const hasNoTrips = currentTrips.length === 0 && futureTrips.length === 0 && pastTrips.length === 0;

    if (loading) return <div>Loading trips...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="dashboard">
            <h1>My Trips</h1>
            {hasNoTrips ? (
                <p>Create or join a trip to get started!</p>
            ) : (
                <>
                    {currentTrips.length > 0 && (
                        <div className="current-trips">
                            <h2>Current Trips</h2>
                            <div className="trips-grid">
                                {currentTrips.map((trip) => (
                                    <TripCard key={trip._id} trip={trip} onClick={handleView} />
                                ))}
                            </div><br/>
                        </div> 
                    )}
                    {futureTrips.length > 0 && (
                        <div className="upcoming-trips">
                            <h2>Upcoming Trips</h2>
                            <div className="trips-grid">
                                {futureTrips.map((trip) => (
                                    <TripCard key={trip._id} trip={trip} onClick={handleView} />
                                ))}
                            </div><br/>
                        </div>
                    )}
                    {pastTrips.length > 0 && (
                        <div className="past-trips">
                            <h2>Past Trips</h2>
                            <div className="trips-grid">
                                {pastTrips.map((trip) => (
                                    <TripCard key={trip._id} trip={trip} onClick={handleView} />
                                ))}
                            </div><br/>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Dashboard;
