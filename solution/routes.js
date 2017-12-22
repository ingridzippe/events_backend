"use strict";

var express = require('express');
var models = require('./models');
var User = models.User;
var Message = models.Message;
var _ = require('underscore');

module.exports = function (passport) {
  var router = express.Router();

  /* Authentication routes */

  router.get('/login/failure', function(req, res) {
    res.status(401).json({
      success: false,
      error: req.flash('error')[0]
    });
  });

  router.post('/login', passport.authenticate('local', {
    successRedirect: '/login/success',
    failureRedirect: '/login/failure',
    failureFlash: true
  }));

  router.post('/register', function(req, res, next) {
    var params = _.pick(req.body, ['username', 'password']);
    models.User.create(params, function(err, user) {
      if (err) {
        res.status(400).json({
          success: false,
          error: err.message
        });
      } else {
        res.json({
          success: true,
          user: user
        });
      }
    });
  });

  // Beyond this point the user must be logged in
  router.use(function(req, res, next) {
    if (!req.isAuthenticated()) {
      res.status(401).json({
        success: false,
        error: 'not authenticated'
      });
    } else {
      next();
    }
  });
  router.get('/logout', function(req, res) {
    req.logout();
    res.json({
      success: true,
      message: 'logged out.'
    });
  });

  router.get('/login/success', function(req, res) {
    var user = _.pick(req.user, 'username', '_id');
    res.json({
      success: true,
      user: user
    });
  });

  router.get('/users', function(req, res) {
    User
    .find()
    // TODO remove
    .limit(24)
    .exec(function(err, users) {
      if (err) {
        res.status(500).json({
          success: false,
          error: err.message
        });
      } else {
        res.json({
          success: true,
          // TODO simplify this
          users: [_.pick(req.user, ['username', '_id'])].concat(users.map(_.partial(_.pick, _, ['username', '_id'])))
        });
      }
    });
  });

  router.get('/messages', function(req, res) {
    // TODO introduce bug
    Message.find({$or: [{from: req.user._id}, {to: req.user._id}]})
      .sort({
        timestamp: 1
      })
      .populate('to from', 'username')
      .exec(function(err, messages) {
        if (err) {
          res.status(500).json({
            success: false,
            error: err.message
          });
        } else {
          res.json({
            success: true,
            messages: messages
          });
        }
      });
  });

  router.post('/messages', function(req, res) {
    var params = _.pick(req.body, ['body', 'location', 'to']);
    params.from = req.user._id;
    new Message(params).save(function(err, message) {
      if (err) {
        res.status(400).json({
          success: false,
          error: err.message
        });
      } else {
        res.json({
          success: true,
          message: message
        });
      }
    });
  });

  return router;
};
