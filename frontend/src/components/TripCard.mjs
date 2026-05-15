import { formatTripDate } from '../utils/date.mjs';

const TripCard = ({ trip, onClick }) => {
    return (
        <div
            className="trip-card clickable-card"
            onClick={() => onClick(trip._id)}
        >
            <div className="trip-info">
                <h2>{trip.name}</h2>
                <p>Destination: {trip.destination}</p>
                <p>Start: {formatTripDate(trip.dates.start)}</p>
                <p>End: {formatTripDate(trip.dates.end)}</p>
            </div>
        </div>
    );
};

export default TripCard;
