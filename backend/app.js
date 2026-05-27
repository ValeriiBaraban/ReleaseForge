import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import mongoStore from 'connect-mongo';
import cors from 'cors';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import mongoose from 'mongoose';
import User from './models/User.js';

import { sampleRoute, commitsRoute } from './routes/sample.js';
import authRoutes from './routes/auth.js'; 

if (!process.env.MONGO_URI) {
  console.error('Критическая ошибка: переменная MONGO_URI не задана!');
  process.exit(1);
}
const decodedMongoUri = Buffer.from(process.env.MONGO_URI, 'base64').toString('utf-8');

const app = express();
const PORT = process.env.PORT || 8080;

app.set('trust proxy', 1);

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
    mongoUrl: decodedMongoUri 
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7
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

passport.use(new GitHubStrategy({
    clientID: process.env.GH_CLIENT_ID,
    clientSecret: process.env.GH_CLIENT_SECRET,
    callbackURL: "https://projectsummer.click/api/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });
      let email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

      // if (!email) {
      //   return done(new Error('GitHub profile does not contain an email address'), null);
      // }

      if (user) {
        user.accessToken = accessToken;
        user.email = email;
        await user.save();
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
      console.error("ERROR DB githubstrategy:", error)
      return done(error, null);
    }
  }
));

app.use('/api/sample', sampleRoute);
app.use('/api/commits', commitsRoute);
app.use('/api/auth', authRoutes); 

mongoose.connect(decodedMongoUri)
  .then(() => {
    console.log('Успешное подключение к MongoDB');
    app.listen(PORT, () => {
      console.log(`Сервер запущен и слушает порт ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Ошибка подключения к базе данных:', err);
  });