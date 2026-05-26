import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import mongoStore from 'connect-mongo';
import cors from 'cors';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import mongoose from 'mongoose';
import User from './models/User.js';

import authRoutes from './routes/auth.js'; 

const app = express();
const PORT = process.env.PORT || 8080;

app.set('trust proxy', 1); // need for Nginx

app.use(cors({
  origin: process.env.CLIENT_URL || 'https://projectsummer.click',
  credentials: true 
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: mongoStore.create({
    mongoUrl: process.env.MONGO_URI 
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true on server, false in local
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// GitHub strategy with correct environment variables
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://projectsummer.click/api/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });

      if (user) {
        user.accessToken = accessToken;
        await user.save();
        return done(null, user);
      } else {
        user = await User.create({
          githubId: profile.id,
          username: profile.username,
          displayName: profile.displayName || profile.username,
          avatar: profile.photos[0]?.value,
          accessToken: accessToken
        });
        return done(null, user);
      }
    } catch (error) {
      return done(error, null);
    }
  }
));

//app.use('/api/sample', sampleRoute);
//app.use('/api/commits', commitsRoute);
app.use('/api/auth', authRoutes); 

if (!process.env.MONGO_URI) {
  console.error('Critical error: MONGO_URI environment variable is not set!');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Successful connection to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });