import passport from "passport";
import useJWTStrategy from "../config/passport";

useJWTStrategy(passport);

export const authenticateJWT = passport.authenticate('jwt', { session: false });