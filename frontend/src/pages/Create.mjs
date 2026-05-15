import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { countries } from '../data/countries.mjs';
import { citiesByCountry } from '../data/citiesByCountry.mjs';

const Create = () => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const destination = [city.trim(), country].filter(Boolean).join(', ');

        try {
            const response = await fetch('/api/trip/create', {
                method: 'POST',
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
                setErrors(data.errors || ['Trip creation failed']);
                return;
            }

            await response.json();
            navigate('/dashboard');
        } catch (error) {
            console.log('No Trip Creation');
            console.error('Error:', error);
        }
    };

    return (
        <div className="create">
            <h1>Create a Trip</h1>
            {errors.length > 0 && (
                <ul>
                    {errors.map((error, index) => (
                        <li key={index} style={{ color: 'red ' }}>{error}</li>
                    ))}
                </ul>
            )}
            <form onSubmit={handleSubmit}>
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
                    <input
                        type="text"
                        id="tripDescription"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
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
                <button type="submit">Create Trip</button>
            </form>
        </div>
    );
};

export default Create;
