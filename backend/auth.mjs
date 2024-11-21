
import passport from 'passport'
import { Strategy } from 'passport-local'

import bcrypt from 'bcryptjs';
import { User } from './db.mjs'

// Passport Local Strategy Configuration
// passport.use(new LocalStrategy(
//     async (username, password, done) => {
//         try {
//             const user = await User.findOne({ username });
//             if (!user) {
//                 return done(null, false, { message: 'Incorrect username' });
//             }
            
//             const isMatch = await bcrypt.compare(password, user.passwordHash);
//             if (!isMatch) {
//                 return done(null, false, { message: 'Incorrect password' });
//             }
            
//             return done(null, user);
//         } catch (err) {
//             return done(err);
//         }
//     }
// ));
export const login = async (req, res) => {
    res.json({ message: 'User logged in successfully'});
    
    
    // try {
    //     passport.authenticate('local', (err, user) => {
    //         if (err) {
    //             return res.status(500).json({ message: 'Error logging in' });
    //         }
    //         if (!user) {
    //             return res.status(401).json({ message: 'Incorrect username or password' });
    //         }
    //         req.logIn(user, (err) => {
    //             if (err) {
    //                 return res.status(500).json({ message: 'Error logging in' });
    //             }
    //             return res.status(200).json({ message: 'User logged in successfully' });
    //         });
    //     })(req, res);
    // } catch (error) {

    // }
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