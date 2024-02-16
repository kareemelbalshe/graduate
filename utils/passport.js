import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import User from "../models/User";

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: "api/auth/google/callback",
			scope: ["profile", "email"],
		},
		async function (accessToken, refreshToken, profile, callback) {
			let user = await User.findOne({ googleId: profile.id });

			if (!user) {
				const password = () => {
					var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
					var password = "";
					for (var i = 0; i < 10; i++) {
						var randomIndex = Math.floor(Math.random() * charset.length);
						password += charset[randomIndex];
					}
					return password;
				}
				const salt = await bcrypt.genSalt(10)
				const hashPassword = await bcrypt.hash(password, salt)
				user = new User({
					googleId: profile.id,
					username: profile.displayName,
					email: profile.emails[0].value,
					photo: profile.photos[0].value,
					password: hashPassword
				});
				await user.save();
			}
			callback(null, profile);
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});
