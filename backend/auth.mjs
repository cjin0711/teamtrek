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
        maxAge: 1 * 60 * 60 * 1000 // 1 hour
    }
});

// Middleware to ensure user is authenticated
export const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next(); // Proceed to the next middleware or route handler
    }
    console.log("NO AUTHORIZED OOF")
    return res.status(401).json({ message: 'Unauthorized access', authorized: false }); // Send a 401 response
};

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
export const login = async (req, res, next) => {
    console.log("LOGIN FUNCTION CALLED");
    passport.authenticate('local', (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging in' });
        }
        if (!user) {
            return res.status(401).json({ message: 'Incorrect username or password', authorized: false });
        }
        req.login(user, (err) => {
            if (err) {
                return res.status(401).json({ authorized: false });
            }
            // console.log('User logged in:', user);
            // return res.status(200).json({ message: 'User logged in successfully', user: req.user, authorized: true });
            if (req.isAuthenticated()) {
                console.log('User logged in:', user);
                return res.status(200).json({ message: 'User logged in successfully', user: req.user, authorized: true });
            } else {
                return res.status(401).json({ message: 'User authentication failed', authorized: false });
            }
        });
    })(req, res, next);
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
}