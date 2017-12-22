// Add Passport-related auth routes here.
// routes
var express = require('express');
var router = express.Router();
var models = require('../models/models');

module.exports = function(passport) {

  router.get('/seahorse', function(req, res) {
    res.send('yo gotti')
  })

  router.get('/', function(req, res) {
    if(req.user) {
      res.redirect('/users/' + req.user._id)
    } else {
      res.render('index')
    }
  });

  var validateReq = function(userData) {
    return (userData.password === userData.passwordRepeat);
  };

  router.post('/', function(req, res) {
    if (!validateReq(req.body)) {
      return res.render('signup', { error: "Passwords don't match." });
    }
    var u = new models.User({
      displayName: req.body.displayName,
      bio: req.body.bio,
      email: req.body.username,
      password: req.body.password
    });
    u.save(function(err, user) {
      if (err) {
        console.log(err);
        res.status(500).redirect('/register');
        return;
      }
      res.redirect('/login');
    });
  });

  router.get('/testroute', function(req, res) {
    res.send('sup shorty')
  })

  router.get('/login', function(req, res) {
    res.render('login');
  });

  router.post('/login', passport.authenticate('local'), function(req, res) {
    // res.redirect('/users/' + req.user._id);
    res.redirect('/posts');
  });

  router.get('/fail', function(req, res) {
    res.status(401).send('Failed to login with Facebook.');
  });

  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
  });

  // router.get('/signup', function(req, res) {
  //   res.render('signup');
  // });

  return router;
};
