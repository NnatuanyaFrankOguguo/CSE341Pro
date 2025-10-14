/**
 * Passport Configuration for GitHub OAuth
 * Simple GitHub authentication setup
 */

const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const logger = require('../utils/logger');

// Configure GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || "https://cse341pro.onrender.com/auth/github/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    logger.info('GitHub OAuth callback received', {
      userId: profile.id,
      username: profile.username,
      email: profile.emails?.[0]?.value
    });

    // Check if user already exists
    let user = await User.findOne({ githubId: profile.id });

    if (user) {
      logger.info('Existing GitHub user found', { userId: user._id });
      return done(null, user);
    }

    // Create new user from GitHub profile
    user = await User.create({
      githubId: profile.id,
      name: profile.displayName || profile.username,
      email: profile.emails?.[0]?.value || `${profile.username}@github.user`,
      username: profile.username,
      avatarUrl: profile.photos?.[0]?.value,
      // Set default fitness values for GitHub users
      activityLevel: 'moderately_active',
      isActive: true
    });

    logger.success('New GitHub user created', {
      userId: user._id,
      githubId: profile.id,
      username: profile.username
    });

    return done(null, user);
  } catch (error) {
    logger.error('GitHub OAuth error', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  logger.debug('Serializing user', { userId: user._id });
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    logger.debug('Deserializing user', { userId: id });
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    logger.error('User deserialization error', error);
    done(error, null);
  }
});

module.exports = passport;
