import passport from 'passport'
import { Strategy as GoogleStrategy }   from 'passport-google-oauth20'
import { Strategy as GitHubStrategy }   from 'passport-github2'
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2'
import User from '../models/user.js'

const BASE_URL = process.env.SERVER_URL || 'http://localhost:5000'

async function handleOAuthProfile(provider, profile, accessToken, done) {
  try {
    const email = profile.emails?.[0]?.value?.toLowerCase()
    if (!email) return done(new Error('OAuth profile has no email address'), null)
    let user = await User.findOne({ [`providers.${provider}.id`]: profile.id })
    if (!user) user = await User.findOne({ email })
    if (user) {
      user.providers[provider] = { id: profile.id, accessToken }
      user.isEmailVerified = true
      user.lastLogin = new Date()
      await user.save()
      return done(null, user)
    }
    const newUser = new User({
      name:            profile.displayName || profile.username || 'User',
      email,
      avatar:          profile.photos?.[0]?.value || '',
      isEmailVerified: true,
      providers:       { [provider]: { id: profile.id, accessToken } },
    })
    await newUser.save()
    return done(null, newUser)
  } catch (err) {
    return done(err, null)
  }
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    { clientID: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, callbackURL: `${BASE_URL}/api/auth/google/callback` },
    (accessToken, _rt, profile, done) => handleOAuthProfile('google', profile, accessToken, done)
  ))
  console.log('✅ Google OAuth ready')
} else { console.warn('⚠️  Google OAuth skipped — keys not in .env') }

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy(
    { clientID: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET, callbackURL: `${BASE_URL}/api/auth/github/callback`, scope: ['user:email'] },
    (accessToken, _rt, profile, done) => handleOAuthProfile('github', profile, accessToken, done)
  ))
  console.log('✅ GitHub OAuth ready')
} else { console.warn('⚠️  GitHub OAuth skipped — keys not in .env') }

if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use(new LinkedInStrategy(
    { clientID: process.env.LINKEDIN_CLIENT_ID, clientSecret: process.env.LINKEDIN_CLIENT_SECRET, callbackURL: `${BASE_URL}/api/auth/linkedin/callback`, scope: ['r_emailaddress', 'r_liteprofile'] },
    (accessToken, _rt, profile, done) => handleOAuthProfile('linkedin', profile, accessToken, done)
  ))
  console.log('✅ LinkedIn OAuth ready')
} else { console.warn('⚠️  LinkedIn OAuth skipped — keys not in .env') }

export default passport