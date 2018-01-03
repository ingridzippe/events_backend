const Sequelize = require('sequelize');
// var sequelize = new Sequelize('PostgressEvents', 'aws_postgres', 'dirgni1!!A', {
//   dialect: 'postgres',
//   host: 'postgres-eventsapp.cppczcupjsh9.us-east-1.rds.amazonaws.com'
// });

const sequelize = new Sequelize('eventsapp', null, null, {
  // host: 'localhost',
  dialect: 'postgres',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});

const sequelize = new Sequelize(process.env.HEROKU_DBNAME, process.env.HEROKU_USERNAME, process.env.HEROKU_PASSWORD, {
  // host: 'postgres-eventsapp.cppczcupjsh9.us-east-1.rds.amazonaws.com:5432',
  // host: 'postgres-eventsapp.cppczcupjsh9.us-east-1.rds.amazonaws.com',
  // port: '5432',
  // dialect: 'postgres',
  database: process.env.HEROKU_DBNAME,
  host: process.env.HEROKU_DBHOST,
  port: '5432',
  dialect: 'postgres',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});


// Or you can simply use a connection uri
// const sequelize = new Sequelize('postgres-eventsapp.cppczcupjsh9.us-east-1.rds.amazonaws.com:5432');


console.log('getss shere')
sequelize
  .authenticate()
  .then(() => {
    console.log('sequelize: Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


  // sequelize.query(`create table events (
  //     id int primary key not null,
  //     userid int foreign key,
  //     eventname varchar,
  //     eventdate int,
  //     eventlocation varchar,
  //     eventdescription varchar,
  //     eventlongitude int,
  //     eventLatitude int,
  //     eventimage varchar );`)
  // .then(function(result) {
  //   console.log('RESULT', result);
  // })
  // .catch(function(err) {
  //   console.log('whoops this thing errored', err)
  // });

  // sequelize.query(`create table updates (
  //     id int primary key not null,
  //     message varchar,
  //     people1 int,
  //     people2 int,
  //     events int );`)
  // .then(function(result) {
  //   console.log('RESULT', result);
  // })
  // .catch(function(err) {
  //   console.log('whoops this thing errored', err)
  // });

  // sequelize.query(`create table peoplelikes (
  //     id int primary key not null,
  //     vibe varchar,
  //     likingid int,
  //     likedid int );`)
  // .then(function(result) {
  //   console.log('RESULT', result);
  // })
  // .catch(function(err) {
  //   console.log('whoops this thing errored', err)
  // });

  // sequelize.query(`ALTER TABLE users ADD COLUMN longitude varchar(20);`)
  // .then(function(result) {
  //   console.log('RESULT', result);
  // })
  // .catch(function(err) {
  //   console.log('whoops this thing errored', err)
  // });


  // sequelize.query(`create table users (
  //     id int primary key not null auto_increment = 1,
  //     fullname varchar,
  //     username varchar,
  //     password varchar,
  //     image varchar,
  //     website varchar,
  //     bio varchar,
  //     email varchar,
  //     phone int,
  //     gender varchar );`)
  // .then(function(result) {
  //   console.log('RESULT', result);
  // })
  // .catch(function(err) {
  //   console.log('whoops this thing errored', err)
  // });

  // sequelize.query(`ALTER TABLE users AUTO_INCREMENT = 1;`)
  // .then(function(result) {
  //   console.log('RESULT', result);
  // })
  // .catch(function(err) {
  //   console.log('whoops this thing errored', err)
  // });



  var Update = sequelize.define('update', {
    userid: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    message: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    people1: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    events: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    createdAt: {
     type: Sequelize.DATE,
     allowNull: true
    },
  });


  var User = sequelize.define('user', {
      id: {
       type: Sequelize.INTEGER,
       unique: true,
       autoIncrement: true,
       primaryKey: true
      },
      fbid: {
       type: Sequelize.STRING,
      },
      username: {
       type: Sequelize.STRING,
       allowNull: false,
       unique: true
      },
      password: {
       type: Sequelize.STRING,
       allowNull: false
      },
      fullname: {
       type: Sequelize.STRING,
       allowNull: true
      },
      image: {
       type: Sequelize.STRING,
       allowNull: true
      },
      website: {
       type: Sequelize.STRING,
       allowNull: true
      },
      bio: {
       type: Sequelize.STRING,
       allowNull: true
      },
      email: {
       type: Sequelize.STRING,
       allowNull: true
      },
      phone: {
       type: Sequelize.STRING,
       allowNull: true
      },
      gender: {
       type: Sequelize.STRING,
       allowNull: true
      },
      latitude: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      longitude: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
       type: Sequelize.DATE,
       allowNull: true
      },
  });

  var Event = sequelize.define('event', {
      id: {
       type: Sequelize.INTEGER,
       unique: true,
       autoIncrement: true,
       primaryKey: true
      },
      // userid: {
      //  type: Sequelize.STRING,
      //  allowNull: true
      // },
      eventname: {
        type: Sequelize.STRING,
        allowNull: true
      },
      eventdate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      eventlocation: {
        type: Sequelize.STRING,
        allowNull: true
      },
      eventimage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      eventdescription: {
        type: Sequelize.STRING,
        allowNull: true
      },
      eventlongitude: {
        type: Sequelize.STRING,
        allowNull: true
      },
      eventlatitude: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
       type: Sequelize.DATE,
       allowNull: true
      },
  });

  var Reaction = sequelize.define('reaction', {
      id: {
       type: Sequelize.INTEGER,
       unique: true,
       autoIncrement: true,
       primaryKey: true
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
       type: Sequelize.DATE,
       allowNull: true
      },
  });

  var Peoplelike = sequelize.define('peoplelike', {
      id: {
       type: Sequelize.INTEGER,
       unique: true,
       autoIncrement: true,
       primaryKey: true
      },
      vibe: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      likingid: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      likedid: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
       type: Sequelize.DATE,
       allowNull: true
      },
  });



  User.hasMany(Event, {foreignKey: 'userid'})
  Event.belongsTo(User, {foreignKey: 'userid'})

  User.hasMany(Reaction, {foreignKey: 'userid'})
  Reaction.belongsTo(User, {foreignKey: 'userid'})
  Event.hasMany(Reaction, {foreignKey: 'eventid'})
  Reaction.belongsTo(Event, {foreignKey: 'eventid'})

  User.hasMany(Peoplelike, {foreignKey: 'userid'})
  Peoplelike.belongsTo(User, {foreignKey: 'userid'})

  User.hasMany(Update, {foreignKey: 'userid'})
  Update.belongsTo(User, {foreignKey: 'userid'})

  module.exports = {
    // Export models here
    // YOUR CODE HERE
    User,
    Event,
    Reaction,
    Update,
    Peoplelike,
    sequelize,
    Sequelize
  };


// var mongoose = require('mongoose');
//
// var connect = process.env.MONGODB_URI || require('./connect');
// mongoose.connect(connect);
//
// var userSchema = mongoose.Schema({
//   email: {
//     type: String,
//     required: false
//   },
//   fullname: {
//     type: String,
//     required: false
//   },
//   username: {
//     type: String,
//     required: false
//   },
//   password: {
//     type: String,
//     required: false
//   },
//   displayName: {
//     type: String
//   },
//   image: {
//     type: String
//   },
//   website: {
//     type: String
//   },
//   bio: {
//     type: String
//   },
//   email: {
//     type: String
//   },
//   phone: {
//     type: String
//   },
//   gender: {
//     type: String
//   },
//   fbId: {
//     type: String
//   }
// });
//
// // delete soon
// var pinSchema = mongoose.Schema({
//   user: {
//     type: mongoose.Schema.ObjectId,
//     ref: 'User'
//   },
//   displayName: {
//     type: String,
//     required: false
//   },
//   content: {
//     type: String,
//     required: false
//   }
// });
//
// var eventSchema = mongoose.Schema({
//   user: {
//     type: mongoose.Schema.ObjectId,
//     ref: 'User'
//   },
//   userDetails: {
//     type: Object,
//     required: false
//   },
//   displayName: {
//     type: String,
//     required: false
//   },
//   eventImage: {
//     type: String,
//     required: false
//   },
//   eventDate: {
//     type: Date,
//     required: false
//   },
//   eventLocation: {
//     type: String,
//     required: false
//   },
//   eventLongitude: {
//     type: Number,
//     required: false
//   },
//   eventLatitude: {
//     type: Number,
//     required: false
//   },
//   eventDescription: {
//     type: String,
//     required: false
//   }
// });
//
// // the ID of the user that follows the other
// // the ID of the user being followed
// var followsSchema = mongoose.Schema({
//   follower: {
//     type: mongoose.Schema.ObjectId,
//     ref: 'User'
//   },
//   following: {
//     type: mongoose.Schema.ObjectId,
//     ref: 'User'
//   }
// });
//
// userSchema.methods.getFollowRelations = function (callback){
//     var youFollow = [];
//     var followYou = [];
//     var saveUserId = this._id;
//     // peopleWhoFollowYou
//     Follow.find({following: this._id}).populate('follower').exec(function(err, peopleWhoFollowYou){
//       if(err) {
//         res.send(err);
//       } else {
//         // peopleYouFollow
//         Follow.find({follower: saveUserId}).populate('following').exec(function(err, peopleYouFollow){
//           if (err) {
//             res.send(err);
//           } else {
//             callback(null, peopleYouFollow, peopleWhoFollowYou);
//           }
//         })
//       }
//     })
// }
//
// userSchema.methods.isFollowing = function(userId, otherUserId, userDoesFollow) {
//   Follow.find({following: this._id, follower: otherUserId},
//     function(err, userDoesFollow) {
//       if (err) {
//         userDoesFollow = false;
//         res.send(userDoesFollow);
//       } else {
//         userDoesFollow = true;
//         res.send(userDoesFollow);
//       }
//   })
// }
//
// userSchema.methods.follow = function (idToFollow, callback){
//   var newFollow = new Follow ({
//     follow: this._id,
//     following: idToFollow
//   })
//   newFollow.save(function(err, result) {
//     if(err) {
//       callback(err)
//     } else {
//       callback(null, result)
//     }
//   })
// }
//
// userSchema.methods.unfollow = function (idToUnfollow, callback){
//   Follow.findByIdandRemove({
//     follower: this._id,
//     following: idToUnfollow
//     },
//     function(err, foundIdtoRemove) {
//       if(err) {
//         callback(err)
//       } else {
//         callback(null, foundIdtoRemove)
//       }
//     })
// }
//
// userSchema.methods.getTweets = function (callback){
//   Tweet.find({ user: this._id }),
//   function(err, foundTweets) {
//     if(err) {
//       callback(err)
//     } else {
//       callback(null, foundTweets)
//     }
//   }
// }
//
// var User = mongoose.model('User', userSchema);
// var Pin = mongoose.model('Pin', pinSchema);
// var Event = mongoose.model('Event', eventSchema);
// var Follow = mongoose.model('Follow', followsSchema);
//
// module.exports = {
//   User: User,
//   Pin: Pin,
//   Event: Event,
//   Follow: Follow
// };
