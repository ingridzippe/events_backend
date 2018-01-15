"use strict";

var express = require('express');
var _ = require('underscore');
var router = require('express').Router();
var models = require('../models/models');
var bodyParser = require('body-parser');
var User = require('../models/models.js').User;
// var mongoose = require('mongoose');

module.exports = function (passport) {
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));

  // postgres SQL ==> working, postman
  router.post('/register', function(req, res, next) {
    User.create({
      fbid: req.body.fbid,
      username: req.body.username,
      password: req.body.password,
      fullname: req.body.fullname,
      image: req.body.image,
      website: req.body.website,
      bio: req.body.bio,
      email: req.body.email,
      phone: req.body.phone,
      gender: req.body.gender,
      latitude: 0,
      longitude: 0,
    })
    .then(function(result){
      res.json({'success': true})
    })
    .catch(function(error){
      console.log('there was an error', error)
      res.json({'error': error})
    });
  })
  //
  // router.post('/create', function(req, res, next) {
  //   console.log('get inside here')

  /* Authentication routes */
  router.get('/login/failure', function(req, res) {
    res.status(401).json({
      success: false,
      error: req.flash('error')[0]
    });
  });

  router.get('/login/success', function(req, res) {
    var user = _.pick(req.user, 'username', '_id');
    console.log('REQ.USER', req.user)
    res.json({
      success: true,
      send: req.user,
      user: req.user
    });
  });

  router.post('/login', passport.authenticate('local', {
    successRedirect: '/login/success',
    failureRedirect: '/login/failure',
    failureFlash: true
  }));

  // MONGODB VERSION ==> working
  // router.post('/register', function(req, res, next) {
  //   console.log('did it get here yayayayay')
  //   const user = new models.User({
  //     email: req.body.email,
  //     fullname: req.body.fullname,
  //     username: req.body.username,
  //     password: req.body.password,
  //   })
  //   console.log('USER', user);
  //   //var params = _.pick(req.body, ["username", "password"]);
  //   user.save(function(err, user) {
  //     if (err) {
  //       res.status(400).json({
  //         success: false,
  //         error: err.message
  //       });
  //     } else {
  //       res.json({
  //         success: true,
  //         user: user
  //       });
  //     }
  //   });
  // });



  // router.get('/fb/login', function(req, res) {
  //   res.send('it hit the fb login route');
  // })
  // router.get('/fb/login', passport.authenticate('facebook'));


// COMMENT BACK IN
  // router.get('/fb/login', passport.authenticate('facebook'));
  //
  // // router.get('/fb/login/callback',
  // //   passport.authenticate('facebook', { failureRedirect: '/fb/login' }),
  // //   // Redirect user back to the mobile app using Linking with a custom protocol OAuthLogin
  // //   (req, res) => {
  // //       console.log('REQ.USER', req.user);
  // //       res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user));
  // //   });
  //
  // router.get('/fb/login/callback', passport.authenticate('facebook', {
  //   successRedirect: '/login/success/fb',
  //   failureRedirect: '/login/failure',
  // }),
  // (req, res) => {
  //     console.log('REQ.USER', req.user);
  //     res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user));
  // });

  // router.get('/login/success/fb', function(req, res) {
  //   res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user));
  // });

// COMMENT BACK IN


  // router.get('/fb/login/callback', passport.authenticate('facebook', {
  //   successRedirect: '/',
  //   failureRedirect: '/fail'
  // }));

  router.get('/fail', function(req, res) {
    res.status(401).send('Failed to login with Facebook.');
  });

  router.get('/logout', function(req, res) {
    req.logout();
    res.json({
      success: true,
      message: 'logged out.'
    });
  });

  // router.use('/', function(req,res,next){
  //   if(req.user){
  //     next();
  //   }
  //   else{
  //     res.status(401).json({
  //       success: false,
  //       error: 'Error: Session not found. Please log in to see content.'
  //     });
  //   }
  // });
  router.get('/', function(req,res,next){
    res.json('hi there!')
  });
  router.use(function(req,res,next){
    next()
  })
  return router;
};
