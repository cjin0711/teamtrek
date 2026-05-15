import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatTripDate } from '../utils/date.mjs';

const TripDetails = () => {
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tripPassword, setTripPassword] = useState('');
    const [showJoinModal, setShowJoinModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const [tripDetails, profileDetails] = await Promise.all([
                    fetch(`/api/trip/${id}`),
                    fetch('/api/me'),
                ]);

                if (!tripDetails.ok) {
                    throw new Error('Failed to fetch trip details');
                }

                if (!profileDetails.ok) {
                    throw new Error('Failed to fetch profile');
                }

                const tripData = await tripDetails.json();
                const profileData = await profileDetails.json();

                setTrip(tripData.trip);
                setCurrentUser(profileData.user);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTrip();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error && !trip) return <div>{error}</div>;
    if (!trip) return <div>No trip found</div>;

    const handleDelete = async (tripId) => {
        try {
            const response = await fetch(`/api/trip/${tripId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete trip');
            }
            navigate('/dashboard');
        } catch (error) {
            console.error('Error deleting trip:', error);
        }
    };

    const handleJoin = async () => {
        try {
            const response = await fetch(`/api/trip/${id}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: tripPassword,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to join trip');
            }

            setTrip(data.trip);
            setTripPassword('');
            setShowJoinModal(false);
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleJoinClick = () => {
        setError(null);

        if (trip.isPublic) {
            handleJoin();
            return;
        }

        setTripPassword('');
        setShowJoinModal(true);
    };

    const handleLeave = async () => {
        try {
            const response = await fetch(`/api/trip/${id}/leave`, {
                method: 'POST',
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to leave trip');
            }

            setTrip(data.trip);
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const isOrganizer = currentUser && trip.organizer?._id === currentUser._id;
    const isParticipant = currentUser && trip.participants.some(
        (participant) => participant._id === currentUser._id
    );

    return (
        <div className="trip-details">
            <div className="trip-info">
                <h1>{trip.name}</h1>
                <p>Trip Organizer: {trip.organizer?.username || 'Unknown'}</p>
                <p>Destination: {trip.destination}</p>
                <p>Start: {formatTripDate(trip.dates.start)}</p>
                <p>End: {formatTripDate(trip.dates.end)}</p>
                <p>Description: {trip.description}</p>
                {!trip.isPublic && <p>This is a private trip.</p>}
                <h3>Participants</h3>
                <ol>
                    {trip.participants.map((participant) => (
                        <li key={participant._id}>
                            {participant.username || 'Unknown user'}
                            {participant._id === trip.organizer?._id ? ' \u{1F451}' : ''}
                        </li>
                    ))}
                </ol>
                {error && <p className="modal-error">{error}</p>}
                {isOrganizer ? (
                    <button onClick={() => handleDelete(trip._id)}>Delete Trip</button>
                ) : isParticipant ? (
                    <button onClick={handleLeave}>Leave Trip</button>
                ) : (
                    <button onClick={handleJoinClick}>Join Trip</button>
                )}
            </div>
            {showJoinModal && (
                <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3>Enter Trip Password</h3>
                        <input
                            type="password"
                            value={tripPassword}
                            onChange={(e) => setTripPassword(e.target.value)}
                            placeholder="Trip password"
                        />
                        {error && <p className="modal-error">{error}</p>}
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="filter-toggle"
                                onClick={() => setShowJoinModal(false)}
                            >
                                Cancel
                            </button>
                            <button type="button" onClick={handleJoin}>
                                Join Trip
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripDetails;
