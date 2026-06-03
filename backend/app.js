import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import mongoStore from 'connect-mongo';
import cors from 'cors';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import mongoose from 'mongoose';
import User from './models/User.js';
import githubRoutes from './routes/github.js';
import releaseRoutes from './routes/release.js';
import path from 'path';



import authRoutes from './routes/auth.js'; 

if (!process.env.MONGO_URI) {
  console.error('mongo uri is not set');
  process.exit(1);
}
let decodedMongoUri = process.env.MONGO_URI;

if(!decodedMongoUri.startsWith('mongodb') || decodedMongoUri.includes('base64')) {
  decodedMongoUri = Buffer.from(process.env.MONGO_URI, 'base64').toString('utf-8');
}


const app = express();
const PORT = process.env.PORT || 8080;

app.set('trust proxy', true);

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
    mongoUrl: decodedMongoUri,
    collectionName: 'sessions'
  }),
  cookie: {
    //TODO: return secure to true when deploying to production with HTTPS
    secure: false, //process.env.NODE_ENV === 'production',
    httpOnly: true, 
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/github', githubRoutes);
app.use('/api/releases', releaseRoutes);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GitHubStrategy({
    clientID: process.env.GH_CLIENT_ID,
    clientSecret: process.env.GH_CLIENT_SECRET,
    callbackURL: `${process.env.GITHUB_AUTH_URL}/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });
      let email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : undefined;

      // if (!email) {
      //   return done(new Error('GitHub profile does not contain an email address'), null);
      // }

      if (user) {
        user.accessToken = accessToken;
        await user.save();
        if (email) {
          user.email = email;
          await user.save();
        }
        return done(null, user);
      } else {
        user = await User.create({
          
          githubId: profile.id,
          username: profile.username,
          displayName: profile.displayName || profile.username,
          avatar: profile.photos[0]?.value,
          accessToken: accessToken,
          email: email
        });
        return done(null, user);
      }
    } catch (error) {
      if (error.status === 401) {
        console.error("Unauthorized error in GitHubStrategy:", error);
        return done(new Error('Unauthorized: Invalid GitHub credentials'), null);
      } else if (error.name === 'MongoError' && error.code === 11000) {
        console.error("Database error in GitHubStrategy:", error);
        return done(new Error('Database error: Duplicate entry'), null);
      }
      console.error("Error in GitHubStrategy:", error);
      return done(error, null);
    }
  }
));

app.use('/api/auth', authRoutes); 

mongoose.connect(decodedMongoUri)
  .then(() => {
    console.log('connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running and listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });


  app.use((req, res) => {
  res.status(404).send('Not Found');
});

  export default app;