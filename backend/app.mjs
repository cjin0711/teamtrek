import * as auth from './auth.mjs'

import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import passport from 'passport'
import { User, Trip, FriendRequest } from './db.mjs'

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

app.post('/api/login', (req, res, next) => {
  auth.login(req, res, next);
});

app.post('/api/logout', (req, res) => {
  req.logout((err) => {
      if (err) {
          console.error('Error during logout:', err);
          return res.status(500).json({ message: 'Error logging out' });
      }
      req.session.destroy(() => {
          res.clearCookie('connect.sid'); // Clear the session cookie
          res.status(200).json({ message: 'Logged out successfully' });
      });
  });
});

// // FRIENDS 

// view
app.get('/api/friends', auth.ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends');
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json({ authorized: true, friends: user.friends });
  } catch (error) {
    console.error('Error fetching friends:', error.message);
    res.status(500).json({ message: 'Server error' });
}
});

// search
app.get('/api/search', auth.ensureAuthenticated, async (req, res) => {
  try {
    // const match = await User
  }
  catch {

  }
});

// FRIEND REQUESTS

// pending
app.get('/api/friendPending', auth.ensureAuthenticated, async (req, res) => {
  try {
    const pending = await FriendRequest.find({ recipient: req.user._id, status: 'pending' }).populate('recipient');
    return json({ pending: pending.recipient});
  }
  catch(error) {
    console.error('Error fetching pending friend requests:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// approve
app.get('/api/friendApprove', auth.ensureAuthenticated, async (req, res) => {
  try {
    const pending = await FriendRequest.find({ recipient: req.user._id, status: 'approve' }).populate('sender');
    return json({ pending: pending.recipient});
  }
  catch(error) {
    console.error('Error fetching friend requests for approval:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});
 

// DASHBOARD
app.get('/api/dashboard', auth.ensureAuthenticated, async (req, res) => {
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

// SELF PROFILE
app.get('/api/profile/', auth.ensureAuthenticated, async (req, res) => {
  const userId = req.user._id;
  try {
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'Self Profile not found' });
      }
      res.json({ user: user });
  } catch (error) {
      console.error('Error fetching self profile:', error.message);
      res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/user/:id', auth.ensureAuthenticated, async (req, res) => {
  const userId = req.params.id;
  try {
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.json({ user: user });
  } catch (error) {
      console.error('Error fetching user:', error.message);
      res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/user/:id/settings', auth.ensureAuthenticated, async (req, res) => {
  const userId = req.params.id;
  const { bio, email, phone, socials } = req.body;
  try {
      const user =  await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      } 

      user.bio = bio;
      user.email = email;
      user.phone = phone;
      user.socials = socials;

      await user.save();
      res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating user information' });
  }

});

app.get('/api/trip/:id', auth.ensureAuthenticated, async (req, res) => {
  const tripId = req.params.id;
  console.log('API CALL FOR ID: ', tripId);
  try {
      const trip = await Trip.findById(tripId);
      if (!trip) {
          return res.status(404).json({ message: 'Trip not found' });
      }
      res.json({trip: trip});
  } catch (error) {
      console.error('Error fetching trip:', error.message);
      res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/delete/:id', auth.ensureAuthenticated, async (req, res) => {
  const tripId = req.params.id;
  try {
      // Find the trip by ID
      const trip = await Trip.findById(tripId);
      if (!trip) {
          return res.status(404).json({ message: 'Trip not found' });
      }

      // Check if the user is the organizer of the trip
      if (trip.organizer.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Unauthorized to delete this trip' });
      }

      // Delete the trip
      await trip.deleteOne();
      res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
      console.error('Error deleting trip:', error.message);
      res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/create' , auth.ensureAuthenticated, async (req, res) => {
  const {name, destination, startDate, endDate, description} = req.body;
  try {
        // Creates new Trip
        const trip = new Trip({
          organizer: req.user._id,
          name: name,
          destination: destination,
          dates : {
            start: startDate,
            end: endDate
          },
          description: description
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