import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Trip, FriendRequest } from './db.mjs';

dotenv.config();

const DAY_MS = 24 * 60 * 60 * 1000;
const now = new Date();

const usersSeed = [
  {
    username: 'alexriver',
    displayName: 'Alex Rivera',
    email: 'alex@example.com',
    hometown: 'New York, USA',
    bio: 'Always planning the next mountain escape.',
    socials: '@alexriver',
  },
  {
    username: 'mayafern',
    displayName: 'Maya Fernandez',
    email: 'maya@example.com',
    hometown: 'Miami, USA',
    bio: 'Food-first traveler and beach itinerary specialist.',
    socials: '@mayafern',
  },
  {
    username: 'jordanlee',
    displayName: 'Jordan Lee',
    email: 'jordan@example.com',
    hometown: 'Seattle, USA',
    bio: 'Weekend explorer who turns spreadsheets into trips.',
    socials: '@jordanlee',
  },
  {
    username: 'samchen',
    displayName: 'Sam Chen',
    email: 'sam@example.com',
    hometown: 'San Francisco, USA',
    bio: 'National parks, coffee shops, and camera rolls.',
    socials: '@samchen',
  },
  {
    username: 'priyapatel',
    displayName: 'Priya Patel',
    email: 'priya@example.com',
    hometown: 'Chicago, USA',
    bio: 'Big fan of city breaks and carefully packed carry-ons.',
    socials: '@priyapatel',
  },
  {
    username: 'noahwright',
    displayName: 'Noah Wright',
    email: 'noah@example.com',
    hometown: 'Austin, USA',
    bio: 'Always down for road trips and live music stops.',
    socials: '@noahwright',
  },
];

const tripSeed = [
  {
    key: 'banff',
    organizer: 'alexriver',
    participantUsernames: ['alexriver', 'mayafern', 'samchen'],
    isPublic: true,
    name: 'Banff Hiking Week',
    destination: 'Banff, Canada',
    startOffsetDays: 21,
    endOffsetDays: 27,
    description: 'A week of hikes, lakes, and cabin dinners in Banff.',
    maxParticipants: 6,
  },
  {
    key: 'tokyo',
    organizer: 'jordanlee',
    participantUsernames: ['jordanlee', 'priyapatel'],
    isPublic: false,
    password: 'tokyo2026',
    name: 'Tokyo Food Sprint',
    destination: 'Tokyo, Japan',
    startOffsetDays: 45,
    endOffsetDays: 52,
    description: 'Street food, late trains, and a packed city itinerary.',
    maxParticipants: 4,
  },
  {
    key: 'portland',
    organizer: 'samchen',
    participantUsernames: ['samchen', 'alexriver', 'noahwright'],
    isPublic: true,
    name: 'Portland Weekend Reset',
    destination: 'Portland, USA',
    startOffsetDays: -12,
    endOffsetDays: -9,
    description: 'Coffee shops, bookstores, and an easy weekend recharge.',
    maxParticipants: 5,
  },
  {
    key: 'lisbon',
    organizer: 'priyapatel',
    participantUsernames: ['priyapatel', 'mayafern', 'jordanlee'],
    isPublic: true,
    name: 'Lisbon Sun Chase',
    destination: 'Lisbon, Portugal',
    startOffsetDays: 68,
    endOffsetDays: 75,
    description: 'Warm weather, tiled streets, and a tram-heavy city stay.',
    maxParticipants: 5,
  },
];

const pendingRequestSeed = [
  { sender: 'noahwright', recipient: 'mayafern' },
  { sender: 'priyapatel', recipient: 'samchen' },
];

const friendshipPairs = [
  ['alexriver', 'mayafern'],
  ['alexriver', 'samchen'],
  ['jordanlee', 'priyapatel'],
  ['mayafern', 'priyapatel'],
];

const connectToDatabase = async () => {
  if (!process.env.MONG_URI) {
    throw new Error('Missing MONG_URI in environment');
  }

  await mongoose.connect(process.env.MONG_URI);
};

const addDays = (date, offsetDays) => new Date(date.getTime() + offsetDays * DAY_MS);

const buildFriendMap = (createdUsers) => {
  const map = Object.fromEntries(createdUsers.map((user) => [user.username, user]));

  for (const [leftUsername, rightUsername] of friendshipPairs) {
    const leftUser = map[leftUsername];
    const rightUser = map[rightUsername];

    if (!leftUser || !rightUser) {
      continue;
    }

    leftUser.friends.push(rightUser._id);
    rightUser.friends.push(leftUser._id);
  }

  return map;
};

const createUsers = async () => {
  const passwordHash = await bcrypt.hash('password123', 10);

  const createdUsers = await User.insertMany(
    usersSeed.map((user) => ({
      ...user,
      passwordHash,
      friends: [],
      trips: [],
    }))
  );

  const userMap = buildFriendMap(createdUsers);
  await Promise.all(createdUsers.map((user) => user.save()));

  return userMap;
};

const createTrips = async (userMap) => {
  const trips = [];

  for (const trip of tripSeed) {
    const organizer = userMap[trip.organizer];
    const participants = trip.participantUsernames
      .map((username) => userMap[username]?._id)
      .filter(Boolean);

    const password = trip.isPublic
      ? ''
      : await bcrypt.hash(trip.password || 'tripsecret', 10);

    const createdTrip = await Trip.create({
      isPublic: trip.isPublic,
      password,
      organizer: organizer?._id,
      name: trip.name,
      destination: trip.destination,
      dates: {
        start: addDays(now, trip.startOffsetDays),
        end: addDays(now, trip.endOffsetDays),
      },
      description: trip.description,
      maxParticipants: trip.maxParticipants,
      participants,
    });

    trips.push(createdTrip);

    for (const username of trip.participantUsernames) {
      const user = userMap[username];
      if (user) {
        user.trips.push(createdTrip._id);
      }
    }
  }

  await Promise.all(Object.values(userMap).map((user) => user.save()));
  return trips;
};

const createPendingRequests = async (userMap) => {
  await FriendRequest.insertMany(
    pendingRequestSeed
      .map((request) => ({
        sender: userMap[request.sender]?._id,
        recipient: userMap[request.recipient]?._id,
        status: 'pending',
      }))
      .filter((request) => request.sender && request.recipient)
  );
};

const seed = async () => {
  await connectToDatabase();

  try {
    await Promise.all([
      FriendRequest.deleteMany({}),
      Trip.deleteMany({}),
      User.deleteMany({}),
    ]);

    const userMap = await createUsers();
    const trips = await createTrips(userMap);
    await createPendingRequests(userMap);

    console.log(`Seed complete: ${Object.keys(userMap).length} users, ${trips.length} trips.`);
    console.log('Login password for all seeded users: password123');
  } finally {
    await mongoose.disconnect();
  }
};

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
