"use strict";

var express = require('express');
const router = require('express').Router();
const aws = require('aws-sdk');
var models = require('../models/models');
var bodyParser = require('body-parser');
const processor = require('../processor');
var Event = require('../models/models.js').Event;
var User = require('../models/models.js').User;
var Reaction = require('../models/models.js').Reaction;
var Peoplelike = require('../models/models.js').Peoplelike;
var Update = require('../models/models.js').Update;

var Sequelize = require('sequelize');
const Op = Sequelize.Op;
// var mongoose = require('mongoose');

const S3_BUCKET = process.env.S3_BUCKET;

router.get('/sign-s3', function(req, res) {
  console.log('a')
  const s3 = new aws.S3();
  const fileName = req.query['file-name'];
  const fileType = req.query['file-type'];
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };
  s3.getSignedUrl('putObject', s3Params, function(err, data) {
    if(err){
      console.log('b')
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
    };
    console.log('returnData', returnData);
    res.write(JSON.stringify(returnData));
    res.end();
  });
});
// THIS WORKS
// https://www.eventbriteapi.com/v3/events/search?token=ZGQUVO5F3V3AXFDYRINO&q=arts

// router.get('https://www.eventbriteapi.com/v3/users/me/owned_events/',
//   headers = { "Authorization": "Bearer FL3SLC45OBKQTY3ICPZJ" },
//   function(req, res, next) {
//       console.log(res.json());
//       res.json({success: true, events: events})
//   });

// var token = 'ZGQUVO5F3V3AXFDYRINO';
// router.get('https://www.eventbriteapi.com/v3/events/search/?token='+token+'&organizer.id=8231868522&expand=venue', function(res) {
//   if(res.events.length) {
//     console.log(res.json());
//     res.json({success: true, events: events})
//   } else {
//     console.log('no events');
//   }
// });

// var settings = {
//   "async": true,
//   "crossDomain": true,
//   "url": "https://www.eventbriteapi.com/v3/events/17920884849/?token=ZGQUVO5F3V3AXFDYRINO",
//   "method": "GET",
//   "headers": { "Authorization": "Bearer FL3SLC45OBKQTY3ICPZJ" }
// }
router.get({
  "async": true,
  "crossDomain": true,
  "url": "https://www.eventbriteapi.com/v3/events/17920884849/?token=ZGQUVO5F3V3AXFDYRINO",
  "method": "GET",
  "headers": { "Authorization": "Bearer FL3SLC45OBKQTY3ICPZJ" }
  }, function(req, res, next) {
  console.log(req);
  console.log(req.name.text);
  console.log(req.description);
});

router.get({
  "async": true,
  "crossDomain": true,
  "url": "https://www.eventbriteapi.com/v3/events/search",
  "method": "GET",
  "headers": { "Authorization": "Bearer FL3SLC45OBKQTY3ICPZJ" }
  }, function(req, res, next) {
  console.log(req);
  console.log(req.name.text);
  console.log(req.description);
});

router.get('/getlikes', function(req, res, next) {
  console.log('req.user.id', req.user.id)
  Peoplelike.findAll({where: {likingid: req.user.id}})
  .then(function(likes) { res.json({ success: true, likes: likes }) })
  .catch(function(error){ res.json({'error': error}) })
})
router.get('/getlikes/:id', function(req, res, next) {
  Peoplelike.findAll({where: {likingid: req.params.id}})
  .then(function(likes) { res.json({ success: true, likes: likes }) })
  .catch(function(error){ res.json({'error': error}) })
})


router.post('/recordlatandlong', function(req, res, next) {
  User.update({
    latitude: req.body.latitude,
    longitude: req.body.longitude,
  }, {where: {id: req.user.id}})
  .then(function(){
    res.json({success: true, user: req.user})
  })
  .catch(function(err){console.log('user not updated', err)})
});


router.post('/create', function(req, res, next) {
  console.log('get inside here')
  console.log('req.user.id', req.user)
  Event.create({
    userid: req.user.id,
    eventname: req.body.eventname,
    eventdate: req.body.eventdate,
    eventlocation: req.body.eventlocation,
    eventimage: req.body.eventimage,
    eventdescription: req.body.eventdescription,
    eventlongitude: req.body.eventlongitude,
    eventlatitude: req.body.eventlatitude
  })
  .then(function(result){
    Event.find({where: {id: result.id}})
    .then(function(eventfound){
      Reaction.create({
        userid: req.user.id,
        eventid: eventfound.id,
        type: 'posted',
      })
      .then(function(reaction){
        res.json({'success': true, 'reaction': reaction})
      })
      .catch(function(error){
        console.log('there was an error', error)
        res.json({'error': error})
      })
    })
    .catch(function(error){
      console.log('there was an error', error)
      res.json({'error': error})
    })

  })
  .catch(function(error){
    console.log('there was an error', error)
    res.json({'error': error})
  })
})

router.post('/createreaction', function(req, res, next) {
  console.log('gets here')
  Reaction.create({
    userid: req.user.id,
    eventid: req.body.eventid,
    type: req.body.type,
  })
  .then(function(reaction){
    res.json({'success': true, 'reaction': reaction})
  })
  .catch(function(error){
    console.log('there was an error', error)
    res.json({'error': error})
  })
});

router.get('/updates', function(req, res, next) {
  Update.findAll({
    // include: [
    //   { model: User, },
    // ],
    order: [['createdAt', 'DESC']]
  })
  .then(function(updates) {
    // var arr = Object.keys(updates);
    // how to make an array of promises
    var promises = updates.map(update => {
      return User.find({where: {id: update.people1}})
      .then(function(userfound){
        var u = {};
        console.log('USERFOUND ID', userfound.id);
        console.log('USERFOUND ID', userfound.username);
        u['id'] = userfound.people1;
        u['username'] = userfound.username;
        u['fullname'] = userfound.fullname;
        console.log('u', u);
        return u;
      })
    })
    return Promise.all(promises)
  })
  .then(function(matches){
    console.log('makes it here? match')
    res.json({
      success: true,
      updates: matches
    })
  })
  .catch(function(error) {
    console.log('there was an error loading events', error);
  })
});


router.post('/createupdate', function(req, res, next) {
  console.log('gets here')
  Update.find({where: {userid: req.user.id, people1: req.body.people1 }})
  .then(function(updatefound){
    if (updatefound) {
      res.json({'update': 'update found'})
    } else {

      Update.create({
        userid: req.user.id,
        people1: req.body.people1,
        people2: req.body.people2,
        events: req.body.events,
      })
      .then(function(update){
        res.json({'success': true, 'update': update})
      })
      .catch(function(error){
        console.log('there was an error', error)
        res.json({'error': error})
      })

    }
  })
  .catch(function(error){
    console.log('there was an error', error)
    res.json({'error': error})
  })
});


// postgres SQL
router.get('/events', function(req, res, next) {
  Event.findAll({
    include: { model: User },
    // include: [{
    //   model: User,
    //   through: {
    //     attributes: ['username', 'fullname', 'image'],
    //     where: {username: 'Sophie'}
    //   }
    // }],
    order: [['createdAt', 'DESC']]
  })
  .then(function(events) {
    res.json({
      success: true,
      events: events
    })
  })
  .catch(function(error) {
    console.log('there was an error loading events', error);
  })
});

// Reactions route generic
router.get('/reactions', function(req, res, next) {
  Reaction.findAll({
    include: [
      { model: User },
      { model: Event },
    ],
    order: [['createdAt', 'DESC']]
  })
  .then(function(reactions) {
    res.json({
      success: true,
      reactions: reactions
    })
  })
  .catch(function(error) {
    console.log('there was an error loading events', error);
  })
});

router.get('/reactions/:lat/:lon/:radius', function(req, res, next) {
  var lat = Math.floor(req.params.lat);
  var lon = Math.floor(req.params.lon);
  var radius = Math.floor(req.params.radius);
  var latLowerBound = lat - radius;
  var latUpperBound = lat + radius;
  var lonLowerBound = lon - radius;
  var lonUpperBound = lon + radius;
  // get today's date
  var d = new Date();
  // add a year to today's date
  var year = d.getFullYear();
  var month = d.getMonth();
  var day = d.getDate();
  var dOneYearLater = new Date(year + 1, month, day)
  console.log(now);
  Reaction.findAll({
    include: [
      { model: User, },
      { model: Event,
        where: {
          eventlatitude: {[Op.between]: [latLowerBound, latUpperBound]},
          eventlongitude: {[Op.between]: [lonLowerBound, lonUpperBound]},
          eventdate: { $gt: dOneYearLater },
        },
      }
    ],
    order: [['createdAt', 'DESC']]
  })
  .then(function(reactions) {
    res.json({
      success: true,
      reactions: reactions
    })
  })
  .catch(function(error) {
    console.log('there was an error loading events', error);
  })
});

router.get('/reactions/:id', function(req, res, next) {
  Reaction.findAll({
    where: {userid: req.params.id},
    include: [
      { model: User, },
      { model: Event }
    ],
    order: [['createdAt', 'DESC']]
  })
  .then(function(reactions) {
    res.json({
      success: true,
      reactions: reactions
    })
  })
  .catch(function(error) {
    console.log('there was an error loading events', error);
  })
});

router.get('/myreactions', function(req, res, next) {
  Reaction.findAll({
    where: {userid: req.user.id},
    include: [
      { model: User, },
      { model: Event }
    ],
    order: [['createdAt', 'DESC']]
  })
  .then(function(reactions) {
    res.json({
      success: true,
      reactions: reactions
    })
  })
  .catch(function(error) {
    console.log('there was an error loading events', error);
  })
});

router.post('/deletereaction', function(req, res, next) {
  Reaction.destroy({ where: {id: 2}});
})

// postgres SQL
router.get('/getmyprofile', function(req, res, next) {
  res.json({user: req.user})
});

router.get('/peoplelist', function(req, res, next) {
  User.findAll({
    order: [['createdAt', 'DESC']]
  })
  .then(function(people) {
    res.json({
      success: true,
      people: people
    })
  })
  .catch(function(error) {
    console.log('there was an error loading events', error);
  })
});

// postgres SQL
router.get('/myevents', function(req, res, next) {
  Event.findAll({where: {userid: req.user.id}})
  .then(function(myevents){
    res.json({myevents: myevents})
  })
  .catch(function(error) {
    console.log('there was an error loading events', error);
  })
})

// postgres SQL
router.post('/updatemyuserinfo', function(req, res, next) {
  User.update({
    id: req.user.id,
    username: req.body.username,
    password: req.user.password,
    fullname: req.body.fullname,
    image: req.body.image,
    website: req.body.website,
    bio: req.body.bio,
    email: req.body.email,
    phone: req.body.phone,
    gender: req.body.gender,
  }, {where: {id: req.user.id}})
  .then(function(){
    res.json({user: req.user})
  })
  .catch(function(err){console.log('user not updated', err)})
});

router.post('/createreaction', function(req, res, next) {
  console.log('gets here')
  Reaction.create({
    userid: req.user.id,
    eventid: req.body.eventid,
    type: req.body.type,
  })
  .then(function(reaction){
    res.json({'success': true, 'reaction': reaction})
  })
  .catch(function(error){
    console.log('there was an error', error)
    res.json({'error': error})
  })
});

router.post('/createpeoplelike', function(req, res, next) {
  console.log('gets here')
  if (req.body.likedid === req.user.id) {
    res.json({ self: 'cannot like self' })
  } else {
    Peoplelike.findAll({where: {likingid: req.user.id, likedid: req.body.likedid}})
      .then(function(like) {
        console.log('like', like)
        if (!like[0]) {
          console.log('getes insssiiide?')
          Peoplelike.create({
            userid: req.user.id,
            likingid: req.user.id,
            likedid: req.body.likedid,
            vibe: req.body.vibe
          })
          .then(function(peoplelike){
            res.json({'success': true, 'peoplelike': peoplelike})
          })
          .catch(function(error){
            console.log('there was an error', error)
            res.json({'error': error})
          })

        } else {
          res.json({ success: true, alreadyexists: like });
        }
      })
      .catch(function(error){ res.json({'error': error}) })
  }
});


// MONGODB ==> working
// router.post('/create', function(req, res) {
//     console.log('gets insiide create route');
//     console.log('req.user', req.user);
//     // save new event
//     var e = new models.Event({
//       user: req.user,
//       userDetails: req.user,
//       eventImage: req.body.eventImage,
//       eventDate: req.body.eventDate,
//       eventLocation: req.body.eventLocation,
//       eventDescription: req.body.eventDescription,
//       eventLatitude: req.body.eventLatitude,
//       eventLongitude: req.body.eventLongitude
//     });
//     e.save(function(err, savedEvent) {
//       if (err) { res.send(err) }
//       else {
//         console.log('savedEvent', savedEvent)
//         res.json({success: true, event: savedEvent});
//       }
//     });
//     // find current user
//
//     // find event you just saved
//     // update event you just saved with current user
//     // models.User.find({_id: req.user._id}, function(req, userFound) {
//     //   console.log('e', e)
//     //   e.save(function(err, savedEvent) {
//     //     if (err) { res.send(err) }
//     //     console.log('savedEvent', savedEvent)
//     //     res.json({success: true, event: savedEvent});
//     //   })
//     // })
//
//     //   models.Event.find(savedEvent).populate('user').exec(function(err, event) {
//     //       if (err) { res.send(err); }
//     //       console.log('event', event)
//     //   models.Event.update({savedEvent},
//     //   {$set: {'userDetails': req.body.name, 'phone': req.body.phone}},
//     //   function(err, result) {
//     //     if(err) {
//     //       res.send(err)
//     //     } else {
//     //       console.log('RESULT', result)
//     //       res.redirect('/contacts')
//     //     }
//     // })
//     //       res.json({success: true, event: event});
//     //   });
//     // });
// })

// router.post('/image',function(req,res){
//   const imageContent = res.body.base64;
//   processor(imageContent).then(a=>{
//     console.log(a);
//     res.json(a)
//   }).catch(err=>{
//     console.log(err);
//   })
// })

// MONGODB ==> working
// router.get('/events', function(req, res, next) {
//   // Gets all users
//   models.Event.find({}, function(err, events) {
//     if (events) {
//       console.log(events);
//       res.json({success: true, events: events});
//     } else {
//       res.json({success: false, error: err})
//     }
//   })
// });

// MONGODB ==> working
// router.get('/myevents', function(req, res, next) {
//   // Gets all users
//   console.log('my events route here')
//   console.log('my events req.user', req.user)
//   models.Event.find({user: req.user}, function(err, events) {
//     if (events) {
//       console.log(events);
//       res.json({success: true, events: events});
//     } else {
//       res.json({success: false, error: err})
//     }
//   })
// });

// MONGODB ==> working
// router.get('/getmyprofile', function(req, res, next) {
//   console.log('reached get my profile');
//   models.User.find({_id: req.user._id}, function(req, user) {
//     console.log('user', user[0]);
//     if (user) {
//       res.json({success: true, user: user});
//     } else { res.json({success: false, error: err}); }
//   });
// });

// MONGODB ==> working
// router.post('/updatemyuserinfo', function(req, res, next) {
//   console.log('posting update my user info');
//   console.log('req.user._id', req.user._id);
//   models.User.find({_id: req.user._id}, function(req, res, next) {
//     console.log('res', res)
//   })
//   models.User.update({_id: req.user._id},
//     {$set: {
//       'name': req.body.name,
//       'image': req.body.image,
//       'fullname': req.body.fullname,
//       'username': req.body.username,
//       'website': req.body.website,
//       'bio': req.body.bio,
//       'email': req.body.email,
//       'phone': req.body.phone,
//       'gender': req.body.gender}},
//     function(err, user) {
//       if(err) { res.json({success: false, errr: err}); }
//       else {
//         console.log('success it seams')
//         // res.json({success: true, user: user});
//       }
//     })
//   res.json({success: true});
// })

// router.use(function(req, res, next){
//   if (!req.user) {
//     res.redirect('/login');
//   } else {
//     return next();
//   }
// });
//
// router.get('/users/', function(req, res, next) {
//   // Gets all users
//   models.User.find({}, function(err, users) {
//     res.render('profiles', {allUsers: users, requser: req.user})
//   })
// });
//
// // Gets all information about a single user
// router.get('/users/:userId', function(req, res, next) {
//   models.User.findOne({_id: req.params.userId}, function(err, user) {
//     if (err) { res.json({'error': 'error'}); }
//     else if (!user) { res.json({'error': 'User not found.'}); }
//     User.findById({_id: req.params.userId}, function(err, user){
//       if (err) { res.json({'error': 'error'}); }
//       if (!user) { res.json({'error': 'User not found.'}); }
//       user.getFollowRelations(function(err, peopleYouFollow, peopleWhoFollowYou) {
//         Event.find({user: req.params.userId}, function(err, events){
//           console.log('REQ.USERrrrr', req.user);
//           res.render('singleProfile', {
//             user: user,
//             requser: req.user,
//             peopleYouFollow: peopleYouFollow,
//             peopleWhoFollowYou: peopleWhoFollowYou,
//             events: events
//           });
//         });
//       });
//     })
//   });
// });
//
// router.get('/posts/', function(req, res, next) {
//   // Displays all tweets in the DB
//   // Tweet.find({}).populate('follower').exec(function(err, peopleWhoFollowYou){
//   Event.find({}, function(err, events) {
//     console.log('EVENTSSSSSS', events);
//     res.render('tweets', { events: events, requser: req.user })
//   })
// });
//
// router.get('/posts/:tweetId', function(req, res, next) {
//
//   //Get all information about a single tweet
//
// });
//
// router.get('/posts/:tweetId/likes', function(req, res, next) {
//
//   //Should display all users who like the current tweet
//
// });
//
// router.post('/posts/:postId/likes', function(req, res, next) {
//
//   //Should add the current user to the selected tweets like list (a.k.a like the tweet)
//
// });
//
// router.get('/post/new', function(req, res, next) {
//   //Display the form to fill out for a new tweet
//   console.log('GET REQ USER', req.user)
//   res.render('newTweet.hbs', {user: req.user, requser: req.user});
// });
//
// router.post('/post/new', function(req, res) {
//   // Handle submission of new tweet form, should add tweet to DB
//   console.log('POST REQ USER', req.user)
//   var event = new models.Event({
//     user: req.user,
//     displayName: req.user.displayName,
//     eventDate: req.body.eventDate,
//     eventLocation: req.body.eventLocation,
//     eventDescription: req.body.eventDescription
//   });
//   console.log('NEW EVENT', event)
//   console.log('REQ BODY', req.body)
//   event.save(function(err, event) {
//     if (err) {
//       console.log(err);
//       res.status(500).redirect('/register');
//       return;
//     }
//     // res.redirect('/users/' + req.user._id);
//     res.redirect('/posts');
//   });
// });
//
// router.post('/follow/:userId', function(req, res, next) {
//   Follow.findOne({follower: req.user._id, following: req.params.userId},
//     function(err, result) {
//       if(err){
//         res.send(err)
//       } else {
//         console.log('UNFOLLOW JUST RAN')
//           if (result) {
//             result.remove(function(err) {
//               if (err) {
//                 res.status(500);
//                 res.json({'error': 'Did not remove token.'});
//               } else {
//                 res.status(200);
//                 res.redirect('/users/' + req.params.userId)
//               }
//             });
//           } else {
//             var newFollow = new Follow({
//               follower: req.user._id,
//               following: req.params.userId
//             })
//             newFollow.save(function(err, result) {
//               if(err){
//                 res.send(err)
//               } else {
//                 console.log('FOLLOW JUST RAN')
//                 followString = 'Unfollow'
//                 res.redirect('/users/' + req.params.userId)
//               }
//             })
//           }
//       }
//     })
//   })

module.exports = router;
