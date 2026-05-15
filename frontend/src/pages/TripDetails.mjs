import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatTripDate } from '../utils/date.mjs';

const TripDetails = () => {
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const [tripDetails, profileDetails] = await Promise.all([
                    fetch(`/api/trip/${id}`),
                    fetch('/api/profile'),
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
    if (error) return <div>{error}</div>;
    if (!trip) return <div>No trip found</div>;

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`/api/trip/${id}`, {
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
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to join trip');
            }

            setTrip(data.trip);
        } catch (error) {
            setError(error.message);
        }
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
                <h3>Participants</h3>
                <ol>
                    {trip.participants.map((participant) => (
                        <li key={participant._id}>
                            {participant.username || 'Unknown user'} 
                            {participant._id === trip.organizer?._id ? ' 👑' : ''}
                        </li>
                    ))}
                </ol>
                {isOrganizer ? (
                    <button onClick={() => handleDelete(trip._id)}>Delete Trip</button>
                ) : isParticipant ? (
                    <button onClick={handleLeave}>Leave Trip</button>
                ) : (
                    <button onClick={handleJoin}>Join Trip</button>
                )}
            </div>
        </div>
    )

}

export default TripDetails;
