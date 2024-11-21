import passport from 'passport-local'
import bcrypt from 'bcryptjs';
import { User } from './db.mjs'

export const login = async (req, res) => {
    const { username, password} = req.body;
    if (username === 'admin' && password === 'admin') {
        res.status(200).json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
}

export const register = async (req, res) => {
    const {username, password, email} = req.body;
    console.log('OOF');

    // Checks Username and Password Lengths
    if (username.length < 5) {
        throw { message: 'Username must be >= 5 characters long' };
    }
    
    if (password.length < 8) {
        throw { message: 'Password must be >= 8 characters long' };
    }

    try {
        // Generates salt and hash password
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        // Creates new user 
        const user = new User({
            username: username,
            email: email,
            passwordHash: hash
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error){
        console.error('Error registering user', error.message);
        res.status(500).json({ message: 'Error registering user' });
    }


    // const user = new User(username, password, email);
    // console.log('REGISTER FUNCTION CALLED');
}