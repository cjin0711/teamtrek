import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { countries } from '../data/countries.mjs';
import { citiesByCountry } from '../data/citiesByCountry.mjs';

const TripEdit = () => {
    const { id } = useParams();
    const [visibility, setVisibility] = useState('true');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');
    const [maxParticipants, setMaxSize] = useState('');
    const [errors, setErrors] = useState([]);
    const navigate = useNavigate();

    const cityOptions = country ? (citiesByCountry[country] || []) : [];
    const hasPresetCities = cityOptions.length > 0;

    const handleCountryChange = (e) => {
        setCountry(e.target.value);
        setCity('');
    };

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const response = await fetch(`/api/trip/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch trip');
                }

                const data = await response.json();
                const trip = data.trip;
                const [tripCity = '', tripCountry = ''] = (trip.destination || '').split(', ');

                setVisibility(String(trip.isPublic));
                setName(trip.name || '');
                setCity(tripCity);
                setCountry(tripCountry);
                setStartDate(trip.dates?.start ? String(trip.dates.start).split('T')[0] : '');
                setEndDate(trip.dates?.end ? String(trip.dates.end).split('T')[0] : '');
                setDescription(trip.description || '');
                setMaxSize(trip.maxParticipants ? String(trip.maxParticipants) : '');
            } catch (error) {
                setErrors([error.message]);
            }
        };

        fetchTrip();
    }, [id]);

    const handleEdit = async (e) => {
        e.preventDefault();
        const destination = [city.trim(), country].filter(Boolean).join(', ');

        try {
            const response = await fetch(`/api/trip/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    visibility,
                    password: visibility === 'false' ? password : '',
                    name,
                    destination,
                    startDate,
                    endDate,
                    description,
                    maxParticipants,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                setErrors(data.errors || ['Trip edit failed']);
                return;
            }
            navigate(`/trip/${id}`)
            
        } catch (error) {
            setErrors([error.message]);
        }
    }

    return (
        <div className="create create-page">
            <div className="profile-container create-card-shell">
                <div className="create-form-card">
                    <h1>Edit Trip</h1>
                    {errors.length > 0 && (
                        <ul>
                            {errors.map((error, index) => (
                                <li key={index} style={{ color: 'red ' }}>{error}</li>
                            ))}
                        </ul>
                    )}
                    <form onSubmit={handleEdit} className="create-trip-form">
                        <div className='visiblity'>
                            <label htmlFor="visibility">Visibility:</label>
                            <select
                                id="visibility"
                                name="visibility"
                                value={visibility}
                                onChange={(e) => setVisibility(e.target.value)}
                            >
                                <option value="true">Public</option>
                                <option value="false">Private</option>
                            </select>
                        </div>
                        {visibility === 'false' && (
                            <div className="password">
                                <label htmlFor="password">Password:</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        )}
                        <div className='tripName'>
                            <label htmlFor="name">Trip Name:</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className='country'>
                            <label htmlFor="country">Country:</label>
                            <select
                                id="country"
                                value={country}
                                onChange={handleCountryChange}
                                required
                            >
                                <option value="">Select a country</option>
                                {countries.map((countryName) => (
                                    <option key={countryName} value={countryName}>
                                        {countryName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='destination'>
                            <label htmlFor="city">Destination City:</label>
                            {hasPresetCities ? (
                                <select
                                    id="city"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    required
                                    disabled={!country}
                                >
                                    <option value="">Select a city</option>
                                    {cityOptions.map((cityName) => (
                                        <option key={cityName} value={cityName}>
                                            {cityName}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    id="city"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder={country ? 'Enter a city' : 'Select a country first'}
                                    required
                                    disabled={!country}
                                />
                            )}
                        </div>
                        <div className='startDate'>
                            <label htmlFor="startDate">Start Date:</label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className='endDate'>
                            <label htmlFor="endDate">End Date:</label>
                            <input
                                type="date"
                                id="endDate"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className='tripDescription'>
                            <label htmlFor="tripDescription">Description:</label>
                            <textarea
                                id="tripDescription"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="4"
                                required
                            />
                        </div>
                        <div className='maxParticipants'>
                            <label htmlFor="maxParticipants">Team Size:</label>
                            <input
                                type="number"
                                min='1'
                                max='25'
                                id="maxParticipants"
                                value={maxParticipants}
                                onChange={(e) => setMaxSize(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit">Save</button>
                    </form>
                </div>
            </div>
        </div>
    );

}

export default TripEdit;
