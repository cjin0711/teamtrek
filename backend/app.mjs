import { User } from './db.mjs'
import { Trip } from './db.mjs'
import * as auth from './auth.mjs'

import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

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

app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
})

// ----- MongoDB Setup ----- // 
mongoose.connect(process.env.MONG_URI)
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
})

app.post('/api/register', (req, res) => {
  console.log('Recieved registration request');
  auth.register(req, res);
});

app.get('/api/login', (req, res) => {
  res.send("Hello");
})

app.post('/api/login', (req, res) => {
  auth.login(req, res);
});