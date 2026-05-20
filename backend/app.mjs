import * as auth from './auth.mjs'

import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import passport from 'passport'
import bcrypt from 'bcryptjs'
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

// ----- Search User -----
app.get('/api/user/search', auth.ensureAuthenticated, async (req, res) => {
    const username = req.query.q?.trim();

    if (!username) {
        return res.status(400).json({ message: 'Query parameter q is required' });
    }

    try {
        const escapedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const users = await User.find({
            username: { $regex: escapedUsername, $options: 'i' }
        }).select('_id username displayName profilePicture');

        return res.status(200).json({ users });
    } catch (e) {
        console.error('Error searching user:', e);
        return res.status(500).json({ message: 'Error searching user' });
    }
});
 
// ----- Dashboard ----- //
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

// ----- User Profile ----- //
app.get('/api/me', auth.ensureAuthenticated, async (req, res) => {
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
        const user = await User.findById(userId)
            .populate('friends', '_id username')
            .populate('trips', 'dates');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const selfId = req.user._id.toString();
        const isSelf = user._id.toString() === selfId;
        const isFriend = user.friends.some(
            (friend) => friend._id.toString() === selfId
        );
        const now = new Date();
        const completed = (user.trips || []).filter((trip) => {
            const endDate = trip?.dates?.end;
            return endDate && new Date(endDate) < now;
        }).length;

        res.json({
            user,
            isSelf,
            isFriend,
            completed,
            authorized: true,
        });
    } catch (error) {
        console.error('Error fetching user:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/user/:id/friends', auth.ensureAuthenticated, async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId).populate(
            'friends',
            '_id username displayName email bio hometown'
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const selfId = req.user._id.toString();
        const isSelf = user._id.toString() === selfId;
        const isFriend = user.friends.some(
            (friend) => friend._id.toString() === selfId
        );

        if (!isSelf && !isFriend) {
            return res.status(403).json({ message: 'Only friends can view this friends list' });
        }

        return res.status(200).json({
            user,
            friends: user.friends || [],
            isSelf,
            isFriend,
        });
    } catch (error) {
        console.error('Error fetching profile friends:', error.message);
        return res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/user/:id/trips', auth.ensureAuthenticated, async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId)
            .populate('friends', '_id username')
            .populate({
                path: 'trips',
                populate: {
                    path: 'organizer',
                    select: 'username',
                },
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const selfId = req.user._id.toString();
        const isSelf = user._id.toString() === selfId;
        const isFriend = user.friends.some(
            (friend) => friend._id.toString() === selfId
        );

        if (!isSelf && !isFriend) {
            return res.status(403).json({ message: 'Only friends can view these trips' });
        }

        return res.status(200).json({
            user,
            trips: user.trips || [],
            isSelf,
            isFriend,
        });
    } catch (error) {
        console.error('Error fetching profile trips:', error.message);
        return res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/user/:id/settings', auth.ensureAuthenticated, async (req, res) => {
    const userId = req.params.id;
    const { bio, email, displayName, hometown } = req.body;
    try {
        const user =  await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        } 
  
        user.bio = bio;
        user.email = email;
        user.displayName = displayName;
        user.hometown = hometown;

        await user.save();
        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while updating user information' });
    }

});

// ----- FRIENDS -----

app.get('/api/friends', auth.ensureAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate(
            'friends',
            '_id username displayName email bio hometown'
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            friends: user.friends || [],
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Error loading friends' });
    }
});

app.post('/api/friends/:id/request', auth.ensureAuthenticated, async (req, res) => {
    const senderId = req.user.id;
    const recipientId = req.params.id;

    try {
        // Case: User Doesn't Exist
        const recipientExists = await User.findById(recipientId);
        if (!recipientExists) {
            return res.status(404).json({ message: 'User not found'});
        }

        // Case: Requesting Self
        if (senderId === recipientId) {
            return res.status(400).json({ message: 'Can not send request to self'});
        }

        // Case: Already Friends
        const currentUser = await User.findById(senderId);
        const alreadyFriends = currentUser.friends.some(id => id.toString() === recipientId.toString());
        if (alreadyFriends) {
            return res.status(400).json({ message: 'Already friends'});
        }

        // Case: Request already exists (either way)
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: senderId, recipient: recipientId, status: 'pending' },
                { sender: recipientId, recipient: senderId, status: 'pending' }
            ]
        });
        if (existingRequest) {
            return res.status(400).json({ message: 'Friend request already exists'});
        }

        await FriendRequest.create({
            sender: senderId,
            recipient: recipientId,
            status: 'pending'
        });

        return res.status(201).json({ message: 'Friend request sent!'});
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Error sending friend request'});
    }

});

app.patch('/api/friends/:id/accept', auth.ensureAuthenticated, async (req, res) => {
    const senderId = req.params.id;
    const recipientId = req.user.id;

    try {
        const existingRequest = await FriendRequest.findOne({
            sender: senderId,
            recipient: recipientId,
            status: 'pending'
        });

        // Case: Friend request doesn't exist
        if (!existingRequest) {
            return res.status(400).json({ message: 'Can not find friend request'});
        }

        // update fromUser friendlist
        await User.updateOne(
            { _id: senderId },
            { $addToSet: { friends: recipientId } }
        );

        // update toUser friendlist
        await User.updateOne(
            { _id: recipientId },
            { $addToSet: { friends: senderId } }
        );

        await FriendRequest.deleteOne({ _id: existingRequest._id });

        return res.status(200).json({ message: 'Friend request accepted' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Error accepting friend request' });
    }
});

app.patch('/api/friends/:id/reject', auth.ensureAuthenticated, async (req, res) => {
    const senderId = req.params.id;
    const recipientId = req.user.id;

    try {
        const existingRequest = await FriendRequest.findOne({
            sender: senderId,
            recipient: recipientId,
            status: 'pending'
        });

        if (!existingRequest) {
            return res.status(400).json({ message: 'Can not find friend request' });
        }

        await FriendRequest.deleteOne({ _id: existingRequest._id });

        return res.status(200).json({ message: 'Friend request rejected' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Error rejecting friend request' });
    }
});

app.patch('/api/friends/remove/:id', auth.ensureAuthenticated, async (req, res) => {
    const friendId = req.params.id;
    const self = req.user;

    try {
        // Remove from 'their' side
        const friend = await User.findById(friendId);
        if (!friend) {
            return res.status(404).json({ message: 'Friend not found - could not remove' });
        }
        friend.friends.pull(self.id)
        await friend.save();

        // Remove from 'your' side
        self.friends.pull(friendId);
        await req.user.save();

        return res.status(200).json({ message: 'Friend removed' });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Error removing friend' });
    }
})

app.get('/api/friends/requestStatus', auth.ensureAuthenticated, async (req, res) => {
    const userId = req.user.id;

    try {
        const [outgoingPending, incomingPending] = await Promise.all([
            FriendRequest.find({ sender: userId, status: 'pending' }).select('recipient'),
            FriendRequest.find({ recipient: userId, status: 'pending' }).select('sender')
        ]);

        return res.status(200).json({
            outgoingPending: outgoingPending.map(request => request.recipient),
            incomingPending: incomingPending.map(request => request.sender),
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Error fetching friend status' });
    }
});


// ----- Trip ----- //
app.get('/api/trip/search', auth.ensureAuthenticated, async(req, res) => {
    const { q, startDate, endDate, maxParticipants } = req.query;

    const query = {};

    // query filters
    if (q) {
        query['$or'] = [
            { name: { $regex: q, $options: 'i'} },
            { destination: { $regex: q, $options: 'i'} }
        ]
    }
    if (startDate) {
        query['dates.start'] = { $gte: new Date(startDate) };
    }
    if (endDate) {
        query['dates.end'] = { $lte: new Date(endDate) };
    }
    if (maxParticipants) {
        query['maxParticipants'] = { $lte: Number(maxParticipants) };
    }

    try {
        const trips = await Trip.find(query).populate('organizer', 'username');
        res.json({ trips });
    }
    catch (error){
        console.error('Error searching trips: ', error.message);
        res.status(500).json({ message: 'Error Searching Trip' });
    }
}); 

app.get('/api/trip/:id', auth.ensureAuthenticated, async (req, res) => {
    const tripId = req.params.id;
    console.log('API CALL FOR ID: ', tripId);
    try {
        const trip = await Trip.findById(tripId)
            .populate('organizer', 'username')
            .populate('participants', 'username');

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if(trip.organizer)

        res.json({trip: trip});

    } catch (error) {
        console.error('Error fetching trip:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/trip/:id/join', auth.ensureAuthenticated, async (req, res) => {
    const tripId = req.params.id;
    const { password } = req.body;

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const userId = req.user._id.toString();
        const isParticipant = trip.participants.some(
            (participantId) => participantId.toString() === userId
        );

        if (isParticipant) {
            return res.status(400).json({ message: 'User already joined this trip' });
        }

        if (trip.participants.length >= trip.maxParticipants) {
            return res.status(400).json({ message: 'Trip is full' });
        }

        if (!trip.isPublic) {
            const isMatch = await bcrypt.compare(password || '', trip.password || '');
            if (!isMatch) {
                return res.status(403).json({ message: 'Incorrect trip password' });
            }
        }

        trip.participants.push(req.user._id);
        await trip.save();

        if (!req.user.trips.some((userTripId) => userTripId.toString() === tripId)) {
            req.user.trips.push(trip._id);
            await req.user.save();
        }

        const updatedTrip = await Trip.findById(tripId)
            .populate('organizer', 'username')
            .populate('participants', 'username');

        res.json({ message: 'Trip joined successfully', trip: updatedTrip });
    } catch (error) {
        console.error('Error joining trip:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/trip/:id/leave', auth.ensureAuthenticated, async (req, res) => {
    const tripId = req.params.id;

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.organizer.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Organizer cannot leave their own trip' });
        }

        const isParticipant = trip.participants.some(
            (participantId) => participantId.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return res.status(400).json({ message: 'User is not part of this trip' });
        }

        await Trip.findByIdAndUpdate(tripId, {
            $pull: { participants: req.user._id }
        });

        req.user.trips = req.user.trips.filter(
            (userTripId) => userTripId.toString() !== tripId
        );
        await req.user.save();

        const updatedTrip = await Trip.findById(tripId)
            .populate('organizer', 'username')
            .populate('participants', 'username');

        res.json({ message: 'Trip left successfully', trip: updatedTrip });

    } catch (error) {
        console.error('Error leaving trip:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/trip/:id', auth.ensureAuthenticated, async (req, res) => {
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

        // remove stale reference to deleted trip
        await User.updateMany(
            { trips: trip._id },
            { $pull: { trips: trip._id } }
        );

        // Delete the trip
        await trip.deleteOne();
        res.json({ message: 'Trip deleted successfully' });
    } catch (error) {
        console.error('Error deleting trip:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/trip/create', auth.ensureAuthenticated, async (req, res) => {
    const {visibility, password, name, destination, startDate, endDate, description, maxParticipants} = req.body;

    const errors = [];
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); 

    // Validation
    if (!name || name.trim() === '') {
        errors.push('Trip name is required');
    }
    if (!destination || destination.trim() === '') {
        errors.push('Trip destination is required');
    }
    if (!description || description.trim() === '') {
        errors.push('Trip description is required');
    }
    if (!startDate) errors.push('Start date is required');

    if (!endDate) errors.push('End date is required');

    if (startDate && endDate) {
        if (new Date(endDate) < new Date(startDate)) {
          errors.push('End date must be after Start date')
        }
        if (currentDate > new Date(startDate)) {
          errors.push('Start Date must be today or in the future');
        }
        if (currentDate > new Date(endDate)) {
          errors.push('End Date must be today or in the future');
        }
    }

    if (!maxParticipants || isNaN(maxParticipants) || maxParticipants < 1) {
        errors.push('Max participants must be > 0')
    }
    if (visibility === 'false' && (!password || password.trim() === '')) {
        errors.push('Private trips require a password')
    }

    if (errors.length != 0) {
        return res.status(400).json({ message: 'Trip validation failed', errors });
    }

    let hash = '';
    if (visibility === 'false' && password) {
        const salt = bcrypt.genSaltSync(10);
        hash = bcrypt.hashSync(password, salt);
    }

    try {
        // Create Trip
        const trip = new Trip({
            isPublic: visibility,
            password: visibility === 'false'? hash : '', 
            organizer: req.user._id,
            name: name,
            destination: destination,
            dates : {
                start: startDate,
                end: endDate
            },
            description: description,
            maxParticipants: maxParticipants,
            participants: [req.user._id]
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

app.patch('/api/trip/:id/', auth.ensureAuthenticated, async (req, res) => {
    const tripId = req.params.id;
    const { visibility, password, name, destination, startDate, endDate, description, maxParticipants } = req.body;

    const errors = [];
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (!name || name.trim() === '') {
        errors.push('Trip name is required');
    }
    if (!destination || destination.trim() === '') {
        errors.push('Trip destination is required');
    }
    if (!description || description.trim() === '') {
        errors.push('Trip description is required');
    }
    if (!startDate) errors.push('Start date is required');
    if (!endDate) errors.push('End date is required');

    if (startDate && endDate) {
        if (new Date(endDate) < new Date(startDate)) {
            errors.push('End date must be after Start date');
        }
        if (currentDate > new Date(startDate)) {
            errors.push('Start Date must be today or in the future');
        }
        if (currentDate > new Date(endDate)) {
            errors.push('End Date must be today or in the future');
        }
    }

    if (!maxParticipants || isNaN(maxParticipants) || maxParticipants < 1) {
        errors.push('Max participants must be > 0');
    }

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to edit this trip' });
        }

        if (Number(maxParticipants) < trip.participants.length) {
            errors.push('Max participants cannot be less than the current participant count');
        }

        const willBePrivate = visibility === 'false';
        if (willBePrivate && !trip.password && (!password || password.trim() === '')) {
            errors.push('Private trips require a password');
        }

        if (errors.length !== 0) {
            return res.status(400).json({ message: 'Trip validation failed', errors });
        }

        let nextPassword = trip.password || '';
        if (willBePrivate && password && password.trim() !== '') {
            const salt = bcrypt.genSaltSync(10);
            nextPassword = bcrypt.hashSync(password, salt);
        }
        if (!willBePrivate) {
            nextPassword = '';
        }

        trip.isPublic = visibility === 'true';
        trip.password = nextPassword;
        trip.name = name;
        trip.destination = destination;
        trip.dates = {
            start: startDate,
            end: endDate
        };
        trip.description = description;
        trip.maxParticipants = Number(maxParticipants);

        await trip.save();

        const updatedTrip = await Trip.findById(tripId)
            .populate('organizer', 'username')
            .populate('participants', 'username');

        res.json({ message: 'Trip updated successfully', trip: updatedTrip });
    } catch (error) {
        console.error('Error updating trip:', error.message);
        res.status(500).json({ message: 'Error Updating Trip' });
    }
})
