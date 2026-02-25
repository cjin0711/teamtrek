import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {

    // username is state variable & setUsername is function used to modify its value
    const [username, setUsername] = useState("Username");  // initialized to "Username"
    const [password, setPassword] = useState("Password");  // initialized to "Password"
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents page reload
        console.log("LOGGED IN!")
        // TODO: Add fetch logic to backend /api/login

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            console.log(data);
            if (data.authorized === false) {
                navigate('/login');
            }
            else {
                navigate('/dashboard');
            }
        }
        catch(error) {
            console.log(error);

        }
    }

    return (
        <div className="login">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className='username'>
                    <label htmlFor="username">Username:</label><br/>
                    <input type="text" id="username" value={username} // placeholder value
                        onClick={(e) => setUsername('')}
                        onChange={(e) => setUsername(e.target.value)} // substitute with user input
                        required 
                    />
                </div>
                <div className='password'>
                    <label htmlFor="password">Password:</label><br/>
                    <input type="password" id="password" value={password} 
                        onClick={(e) => setPassword('')}
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit">Login</button>
                <p>Don't have an account? <Link to="/register">Register here</Link></p>
            </form>
        </div>
    )
}

export default Login;