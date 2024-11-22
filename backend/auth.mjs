
import passport from 'passport'
import LocalStrategy from 'passport-local'
import express from 'express'
import session from 'express-session'
import bcrypt from 'bcryptjs'
import { User } from './db.mjs'


// Session configuration
export const sessionMiddleware = session({
    secret: 'random-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
});

// used to serialize the user for the session
passport.serializeUser((user, done) => {
    console.log('Inside Serialize User: ', user);
    done(null, user.id);
});

// used to deserialize the user and get user from database
passport.deserializeUser(async (id, done) => {
    console.log('Inside Deserialize User: ', id);
    try{
        const user = await User.findById(id);
        if (!user) {
            throw new Error ("Error Not Found!");
        }   
        done(null, user);

    } catch (error) {
        console.error('Error deserializing user', error.message);
        done(error, null);
    }
})

// Passport Local Strategy Configuration
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await User.findOne({ username });
            if (!user) {
                return done(null, false, { message: 'Incorrect username' });
            }
            
            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect password' });
            }
            
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));
export const login = async (req, res) => {
    try {
        passport.authenticate('local', (err, user) => {
            if (err) {
                return res.status(500).json({ message: 'Error logging in' });
            }
            if (!user) {
                return res.status(401).json({ message: 'Incorrect username or password' });
            }
            req.login(user, (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error logging in' });
                }
                return res.status(200).json({ message: 'User logged in successfully' });
            });
        })(req, res);
    } catch (error) {
        console.error('Error logging in user', error.message);
        res.status(500).json({ message: 'Error logging in user' });
    }
}

export const register = async (req, res) => {
    const {username, password, email} = req.body;

    // Checks Username and Password Lengths
    if (username.length < 5) {
        throw { message: 'Username must be >= 5 characters long' };
    }
    
    if (password.length < 8) {
        throw { message: 'Password must be >= 8 characters long' };
    }

    try {
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }
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