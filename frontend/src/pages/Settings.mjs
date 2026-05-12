import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Settings = () => {
    
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [bio, setBio] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                console.log('Fetching user details for user ID:', id);
                const userDetails = await fetch(`/api/user/${id}`);
                if (!userDetails.ok) {
                    throw new Error('Failed to fetch user details');
                }
                const data = await userDetails.json();
                if (data.authorized === false) {
                    navigate('/login');
                }
                console.log('DATA:', data.user);
            
                setUser(data.user);

                setBio(data.user.bio || '');
                setEmail(data.user.email || '');
                setPhone(data.user.phone || '');

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, navigate]);

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>No user found</div>;

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/user/${id}/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bio, email, phone }),
            });
            // First check if response is ok
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            console.log(bio, email, phone);

            const data = await response.json();
            console.log(data);
            navigate(`/profile/${id}`);

        } catch (error) {
            console.log('No User Update');
            console.error('Error:', error);
        }
    }

    return (
        <div className="create">
            <h2>Profile Settings</h2>
            <form onSubmit={handleSubmit}>
                <div className='email'>
                    <label htmlFor="email">Email:</label><br/>
                    <input type="text" id="email" value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className='phone'>
                    <label htmlFor="phone">Phone:</label><br/>
                    <input type="text" id="phone" value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
                <div className='bio'>
                    <label htmlFor="bio">Bio:</label><br/>
                    <textarea id="bio" value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows="4" cols="50"
                    />
                </div>
                <button type="submit">Save</button>
            </form>
        </div>
    );
}

export default Settings;
