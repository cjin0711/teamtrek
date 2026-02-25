import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  passwordHash: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  bio: { type: String },
  socials: { type: String},
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  trips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }]
});

const FriendRequestSchema = new mongoose.Schema({
  sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  recipient: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  // enum prevents invalid data outside from the defined set from being inserted into 'status'
  status: {type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending'}},
  {timestamps: true}
)

// Trip Schema
const TripSchema = new mongoose.Schema({
  isPublic: { type: Boolean, required: true, default: true},
  password: { type: String, default: null },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  destination: { type: String, required: true },
  dates: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  description: { type: String, required: true },
  maxParticipants: { type: Number, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// Define other schemas similarly...

export const User = mongoose.model('User', UserSchema);
export const FriendRequest = mongoose.model('FriendRequest', FriendRequestSchema);
export const Trip = mongoose.model('Trip', TripSchema);
