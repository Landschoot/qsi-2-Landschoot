import passport from 'passport';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
import { getUser } from '../business/users';

// Create our strategy
function jwtStrategy(opts) {
  return new JWTStrategy(opts, (jwtPayload, done) =>
    getUser(jwtPayload)
      .then(user => {
        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
        return null;
      })
      .catch(err => done(err, false))
  );
}

// Init passport with our jwt strategy
export function initAuth() {
  const opts = {};
  opts.secretOrKey = process.env.JWT_SECRET;
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
  passport.use(jwtStrategy(opts));
}

// Create a middleware to check authentication
export function isAuthenticated(req, res, next) {
  return passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new Error('UNAUTHORIZED USER'));
    }
    req.user = user;
    return next();
  })(req, res, next);
}
