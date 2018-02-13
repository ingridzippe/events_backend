var express = require('express');
var app = express();
const aws = require('aws-sdk');
var LocalStrategy = require('passport-local');
// var GoogleStrategy = require('passport-google-oauth20');
//var google = require('./config');
var util = require('util');
var models = require('./models/models');
var User = require('./models/models.js').User;
// var { User } = require('./models/models');
var auth = require('./routes/auth');
var routes = require('./routes/routes');
var flash = require('connect-flash');
const https = require('https');

const domain = 'https://whispering-savannah-32809.herokuapp.com';
setInterval(function() {
    console.log('set interval aAAAAAA')
    https.get(domain);
    console.log('server poked');
}, 300000); // every 5 minutes (300000)



// Transform Facebook profile because Facebook and Google profile objects look different
// and we want to transform them into user objects that have the same set of attributes
// const transformGoogleProfile = (profile) => ({
//   name: profile.displayName,
//   avatar: profile.image.url,
// });


// var session = require('express-session');
// app.use(session({
//   secret: [ process.env.FACEBOOK_APP_SECRET || 'fake secret' ]
// }));


// if (! process.env.DATABASE_URL) {
//   console.error("DATABASE_URL environment variable missing. Did you run 'source env.sh'?");
//   process.exit(1);
// }
// var pg = require('pg');
// var pool = new pg.Pool({
//     connectionString: process.env.DATABASE_URL
// })
// if (! pool) {
//   console.error('pg.Pool is not set up, edit app.js and setup the pool');
//   process.exit(1);
// }
// pool.query('SELECT NOW()', (err, res) => {
//   if (err) {
//     console.log('Error running query', err);
//   } else {
//     console.log('Success, you are connected to Postgres');
//   }
// });

// pool.query(`create table events (
//     id int primary key not null,
//     eventtitle varchar,
//     eventtime int,
//     eventlocation varchar );`)
// .then(function(result) {
//   console.log('RESULT', result);
// })
// .catch(function(err) {
//   console.log('whoops this thing errored', err)
// });


var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

var cookieSession = require('cookie-session');
app.use(cookieSession({
  keys: ['my super secret key']
}));


// passport.use(new GoogleStrategy({
//     clientID:     process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: process.env.CALLBACK_URL,
//     passReqToCallback   : true
//   },
//   function(request, accessToken, refreshToken, profile, done) {
//     models.User.findOrCreate({ googleId: profile.id }, function (err, user) {
//       return done(err, user);
//     });
//   }
// ));

// passport.use(new GoogleStrategy({
//     clientID:     process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: process.env.CALLBACK_URL,
//     passReqToCallback   : true
//   },
//   function(request, accessToken, refreshToken, profile, done) {
//     models.User.findOrCreate({ googleId: profile.id }, function (err, user) {
//       return done(err, user);
//     });
//   }
// ));

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
// app.use(auth(passport));
// app.use(routes);

// app.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/login' }),
//   (req, res) => res.redirect('/users/' + req.user));


var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;
// var FacebookStrategy = require('passport-facebook')


// postgres SQL ==> attempt
passport.use(new LocalStrategy(function(username, password, done) {
  console.log('username is faith', username)
  models.User.findOne({where:{username: username}}).then(user => {
    if (user.dataValues.password === password){
      console.log('USER', user.dataValues);
      done(null, user)
    } else {
      done(null, false)
    }
  })
  .catch(function(error){
    console.log('there was an error', error)
  })
}));

// MONGODB ==> working
// passport.use(new LocalStrategy(function(username, password, done) {
//   if (! util.isString(username)) {
//     done(null, false, {message: 'User must be string.'});
//     return;
//   }
//   // Find the user with the given username
//   models.User.findOne({ username: username, password: password }, function (err, user) {
//     if (err) {
//       done(err);
//       return;
//     }
//     if (!user) {
//       done(null, false, { message: 'Incorrect username/password combination.' });
//       return;
//     }
//     // auth has has succeeded
//     done(null, user);
//   });
// }));

// var FacebookStrategy = require('passport-facebook');

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: 'http://localhost:3000/fb/login/callback',
},
function(accessToken, refreshToken, profile, done) {
  console.log('arrives here')
    var u;
    // checks if user exists
    models.User.findOne({where:{fbid: profile.id}}).then(user=>{
      u = user;
      console.log('found it', user);
    })
    // .catch(func3tion(err){
    //   console.log('err', err)
    // })
    console.log('u', u)
    // if no user, make one
    if(!u){
      console.log('PROFILE PROFILE', profile)
      models.User.create({
        fullname: profile.displayName,
        username: profile.id,
        password: profile.id,
        fbid: profile.id,
      })
      done(null, {token: accessToken, displayName: profile.displayName, fbId: profile.id});
    } else {
      done(null, user)
    }



  // models.User.findOne({where: {fbid: '2'}})
  // .then(user => {
  //   if (err) { return done(err) }
  //   if (!user) {
  //     models.User.create({
  //       fullname: profile.displayName,
  //       fbid: profile.id,
  //     })
  //     done(null, {token: accessToken, displayName: profile.displayName, fbId: profile.id});
  //   } else {
  //     console.log('IMAG?', profile)
  //     console.log('USER FOUND', user);
  //       done(null, user);
  //   }
  // })
  // .catch(function(error){
  //   console.log('there was an error', error)
  // })
}));

// passport.use(new LocalStrategy(function(username, password, done) {
//   // Find a user by username, if password matches call done(null, user)
//   // otherwise call done(null, false)
//   // YOUR CODE HERE
//
//   User.findOne({where:{username: username}}).then(user=>{
//     if (user.password === password){
//       done(null, user)
//     } else {
//       done(null, false)
//     }
//   })
//   .catch(function(error){
//     console.log('there was an error', error)
//   })
// })
// );


// MONGODB ==> working
// passport.use(new FacebookStrategy({
//   clientID: process.env.FACEBOOK_APP_ID,
//   clientSecret: process.env.FACEBOOK_APP_SECRET,
//   callbackURL: 'https://still-citadel-74266.herokuapp.com/fb/login/callback',
//   // profileFields: ['_id', 'token', 'displayName', 'fbId'],
// },
// function(accessToken, refreshToken, profile, done) {
//   var u;
//   models.User.findOne({fbId: profile.id}, function(err, user) {
//     if (err) { return done(err); }
//     if (!user) {
//         u = new models.User({
//         displayName: profile.displayName,
//         fbId: profile.id
//       });
//       u.save(function(err, user) {
//         console.log('saved user')
//         if (err) { return; }
//       })
//       done(null, {_id: u._id, token: accessToken, displayName: profile.displayName, fbId: profile.id});
//     } else {
//       console.log('IMAG?', profile)
//       console.log('USER FOUND', user);
//       done(null, user);
//     }
//   });
// }));


// Serialize user into the sessions
passport.serializeUser((user, done) => done(null, user));

// Deserialize user from the sessions
passport.deserializeUser((user, done) => done(null, user));


// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());


// app.get('/fb/login', passport.authenticate('facebook'));
// app.get('/fb/login/callback',
//   passport.authenticate('facebook', { failureRedirect: '/fb/login' }),
//   // Redirect user back to the mobile app using Linking with a custom protocol OAuthLogin
//   (req, res) => res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user)));
//
// app.get('/fb/login/callback', passport.authenticate('facebook', {
//   successRedirect: '/',
//   failureRedirect: '/fail'
// }));


app.get('/fb/login', passport.authenticate('facebook'));

app.get('/fb/login/callback', passport.authenticate('facebook', {
  successRedirect: '/login/success/fb',
  failureRedirect: '/login/failure',
}),
(req, res) => {
    console.log('REQ.USER', req.user);
    res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user));
});

app.get('/login/success/fb', function(req, res) {
  res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user));
});

app.use(flash());
app.use('/', auth(passport));
app.use('/', routes);

//ROUTES
//
// app.get('/auth/google',
//   passport.authenticate('google', { scope:
//   	[ 'https://localhost:3000/auth/plus.login',
//   	  'https://localhost:3000/auth/plus.profile.emails.read' ] }
// ));
//
// app.get( '/users/register',
// 	passport.authenticate( 'google', {
// 		successRedirect: '/users',
// 		failureRedirect: '/login'
// }));



module.exports = app;
