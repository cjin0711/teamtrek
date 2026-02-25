import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TripDetails = () => {
    const { id } = useParams(); // Extract the "id" parameter from the URL
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    console.log('TRIP ID: ', id);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                console.log('Fetching trip details for trip ID:', id);
                const tripDetails = await fetch(`/api/trip/${id}`);
                if (!tripDetails.ok) {
                    throw new Error('Failed to fetch trip details');
                }
                const data = await tripDetails.json();
                console.log('DATA:', data.trip);
            
                setTrip(data.trip);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTrip();
    }, [id]);



    if (loading) return <div>Loading...</div>;
    if (!trip) return <div>No trip found</div>;


    const handleDelete = async (id) => {
        try {
            const response = await fetch(`/api/delete/${id}`, {
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


    return (
        <div className="trip-details">
            <div className="trip-info">
                <h1>{trip.name}</h1>
                <p>Destination: {trip.destination}</p>
                <p>Start: {new Date(trip.dates.start).toLocaleDateString()}</p>
                <p>End: {new Date(trip.dates.end).toLocaleDateString()}</p>
                <p>Description: {trip.description}</p>
                <button onClick={() => handleDelete(trip._id)}>Delete Trip</button>
            </div>
        </div>
    )

}

export default TripDetails;
