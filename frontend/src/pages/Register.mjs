import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, email }),
            });
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
                    // First check if response is ok
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            console.log(username, password, email);

            const data = await response.json();
            console.log(data);
            navigate('/login');
        } catch (error) {
            console.log('OH NOES');
            console.error('Error:', error);
        }
    };

    return (
        <div className="register">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div className='username'>
                    <label htmlFor="username">New Username:</label><br/>
                    <input type="text" id="username" value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required 
                    />
                </div>
                <div className='password'>
                    <label htmlFor="password">New Password:</label><br/>
                    <input type="password" id="password" value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    />
                </div>
                <div className='email'>
                    <label htmlFor="email">Email:</label><br/>
                    <input type="text" id="email" value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                    />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;