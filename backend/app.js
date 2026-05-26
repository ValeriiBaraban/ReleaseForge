// npm install express-session passport passport-github2 connect-mongo
import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import mongoStore from 'connect-mongo';
import cors from 'cors';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from './models/User.js';

const app = express();

app.set('trust proxy', 1);//for nginx proxy

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://projectsummer.click',
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: mongoStore.create({
    mongoUrl: process.env.MONGO_URI 
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true on server false for localhost
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

//TODO: add variable for callbackURL
passport.use(new GitHubStrategy({
    clientID: process.env.CLIENT_ID_GITHUB,
    clientSecret: process.env.CLIENT_SECRET_GITHUB,
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

export default app;

// import express from 'express';
// import Message from './models/Message.js';
// import { sampleRoute, commitsRoute } from './routes/sample.js';
// import { connect } from 'mongoose';
// import cors from 'cors';
// import dotenv from 'dotenv';
// dotenv.config(); 
// const app = express();



// app.use(cors({
//   origin: process.env.CORS_ORIGIN || '*' 
// }));

// app.use(express.json()); 


// const PORT = process.env.PORT || 8080;
// const MONGO_URI = process.env.MONGO_URI;

// if (!MONGO_URI) {
//   console.error('MONGO_URI environment variable is not set. Please set it to connect to the database.');
//   process.exit(1);
// }



// try {
//   const decodedUri = Buffer.from(MONGO_URI, 'base64').toString('utf-8');
//   connect(decodedUri)
//     .then(() => console.log('Connected to the database using decoded URI'))
//     .catch((err) => console.error('Database connection error with decoded URI:', err));
// } catch (error) {
//   console.error('Error decoding MONGO_URI:', error);
// }

// app.use('/api/sample', sampleRoute);
// app.use('/api/commits', commitsRoute);


// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });