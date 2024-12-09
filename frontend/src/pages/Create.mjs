import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Create = () => {

    const [name, setName] = useState('');
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, destination, startDate, endDate, description }),
            });
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
                    // First check if response is ok
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            console.log(name, destination, startDate, endDate, description);

            const data = await response.json();
            console.log(data);
            navigate('/dashboard');

        } catch (error) {
            console.log('No Trip Creation');
            console.error('Error:', error);
        }
    };

    return (
        <div className="create">
            <h1>Create a Trip</h1>
            <form onSubmit={handleSubmit}>
                <div className='tripName'>
                    <label htmlFor="name">Trip Name:</label><br/>
                    <input type="text" id="name" value={name}
                        onChange={(e) => setName(e.target.value)}
                        required 
                    />
                </div>
                <div className='destination'>
                    <label htmlFor="destination">Destination:</label><br/>
                    <input type="text" id="destination" value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        required 
                    />
                </div>
                <div className='startDate'>
                    <label htmlFor="startDate">Start Date:</label><br/>
                    <input type="date" id="startDate" value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required 
                    />
                </div>
                <div className='endDate'>
                    <label htmlFor="endDate">End Date:</label><br/>
                    <input type="date" id="endDate" value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required 
                    />
                </div> 
                <div className='tripDescription'>
                    <label htmlFor="tripDescription">Description:</label><br/>
                    <input type="text" id="tripDescription" value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required 
                    />
                </div>
                <button type="submit">Create Trip</button>
            </form>
        </div>
    );
}

export default Create;