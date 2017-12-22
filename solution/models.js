"use strict";

var mongoose = require('mongoose');
mongoose.Promise = Promise;
var findOrCreate = require('mongoose-findorcreate');

var userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

var messageSchema = mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  body: {
    type: String,
    default: 'HoHoHo',
    required: true
  },
  location: {
    longitude: {
      type: Number,
      required: false
    },
    latitude: {
      type: Number,
      required: false
    }
  }
});

userSchema.plugin(findOrCreate);

module.exports = {
  User: mongoose.model('User', userSchema),
  Message: mongoose.model('Message', messageSchema),
};
