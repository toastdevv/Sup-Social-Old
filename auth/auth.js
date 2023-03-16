const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

module.exports = (User) => {
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id).then(doc => {
            done(null, doc);
        }).catch(err => {
            console.log(err);
        });
    });

    passport.use(new LocalStrategy({ usernameField: 'email' },(email, password, done) => {
        User.findOne({ email: email }).then(user => {
            console.log(`User with email ${email} attempted to log in.`);
            if (!user) return done(null, false);
            if (!bcrypt.compareSync(password, user.password)) return done(null, false);
            return done(null, user);
        }).catch(err => {
            console.log(err);
        });
    }));
}