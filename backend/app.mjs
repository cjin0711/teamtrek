import * as auth from './auth.mjs'

import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import passport from 'passport'
import { User, Trip } from './db.mjs'

dotenv.config();

// ----- Express Server ----- //
const app = express();
//const router = app.router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.listen(process.env.PORT, ()=> {
  console.log(`Server is running on port ${process.env.PORT}`);
});

// ----- Middleware ----- //
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(auth.sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());


// ----- MongoDB Setup ----- // 
await mongoose.connect(process.env.MONG_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully!');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });


// ----- Routes ----- //
app.get('/api', (req, res) => {
  res.redirect(301, '/api/login');
  res.send("Redirect to Login");
});


app.get('/api/register', (req, res) => {
  res.send("Hello");
});

app.post('/api/register', (req, res) => {
  auth.register(req, res);
});

app.get('/api/login', (req, res) => {
  res.send("Hello");
});

app.post('/api/login', (req, res) => {
  auth.login(req, res);
  // if (!req.isAuthenticated()) {
  //   return res.status(401).json({ authorized: false });
  // }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    // Fetch the user from the database using the ID from the session
    const user = await User.findById(req.user._id).populate('trips'); // Populate the trips array

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Send the trips as part of the response
    res.json({ authorized: true, trips: user.trips });
  } catch (error) {
    console.error('Error fetching trips:', error.message);
    res.status(500).json({ message: 'Server error' });
}
});

app.post('/api/create' , async (req, res) => {
  const {name, destination, startDate, endDate} = req.body;
  try {
        // Creates new Trip
        const trip = new Trip({
          organizer: req.user._id,
          name: name,
          destination: destination,
          dates : {
            start: startDate,
            end: endDate
          }
      });

      await trip.save();

      // Add the trip to the user's trips array
      req.user.trips.push(trip._id);  
      await req.user.save();  

      res.status(201).json({ message: 'Trip Created Successfully' });
  }
  catch (error){
      console.error('Error Creating Trip', error.message);
      res.status(500).json({ message: 'Error Creating Trip' });
  }
});