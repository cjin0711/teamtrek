import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TripCard from '../components/TripCard.mjs';

const apiFetch = (url, options = {}) => (
    fetch(url, {
        credentials: 'include',
        ...options,
    })
);

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

const ProfileTrips = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const res = await apiFetch(`/api/user/${id}/trips`);
                if (!res.ok) {
                    let message = 'Failed to load trips';
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
                setTrips(data.trips || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
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
    const currentTrips = trips.filter((trip) => getTripStatus(trip) === 'current');
    const futureTrips = trips.filter((trip) => getTripStatus(trip) === 'future');
    const pastTrips = trips.filter((trip) => getTripStatus(trip) === 'past');
    const hasNoTrips = currentTrips.length === 0 && futureTrips.length === 0 && pastTrips.length === 0;

    return (
        <div className="dashboard">
            <h1>{displayName}&apos;s Trips</h1>

            <button
                className="profile-edit-btn"
                style={{ width: 'auto', marginBottom: '1.5rem' }}
                onClick={() => navigate(`/profile/${id}`)}
            >
                Back to Profile
            </button>

            {hasNoTrips ? (
                <p>{displayName} has no trips yet.</p>
            ) : (
                <>
                    {currentTrips.length > 0 && (
                        <div className="current-trips">
                            <h2>Current Trips</h2>
                            <div className="trips-grid">
                                {currentTrips.map((trip) => (
                                    <TripCard
                                        key={trip._id}
                                        trip={trip}
                                        onClick={(tripId) => navigate(`/trip/${tripId}`)}
                                    />
                                ))}
                            </div><br />
                        </div>
                    )}
                    {futureTrips.length > 0 && (
                        <div className="upcoming-trips">
                            <h2>Upcoming Trips</h2>
                            <div className="trips-grid">
                                {futureTrips.map((trip) => (
                                    <TripCard
                                        key={trip._id}
                                        trip={trip}
                                        onClick={(tripId) => navigate(`/trip/${tripId}`)}
                                    />
                                ))}
                            </div><br />
                        </div>
                    )}
                    {pastTrips.length > 0 && (
                        <div className="past-trips">
                            <h2>Past Trips</h2>
                            <div className="trips-grid">
                                {pastTrips.map((trip) => (
                                    <TripCard
                                        key={trip._id}
                                        trip={trip}
                                        onClick={(tripId) => navigate(`/trip/${tripId}`)}
                                    />
                                ))}
                            </div><br />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProfileTrips;
