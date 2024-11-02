import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  passwordHash: String,
  email: String,
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  trips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }]
});

// Trip Schema
const TripSchema = new mongoose.Schema({
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  destination: String,
  dates: {
    start: Date,
    end: Date
  },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// Define other schemas similarly...

export const User = mongoose.model('User', UserSchema);
export const Trip = mongoose.model('Trip', TripSchema);
