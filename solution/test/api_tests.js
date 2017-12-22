var app = require('../app');
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
var { User, Message } = require('../models');
var _ = require('underscore');

chai.use(chaiHttp);

describe("API tests", function() {
  // Delete all data before testing
  before(function(done) {
    User.remove()
    .then(function() {
      return Message.remove();
    })
    .then(function() {
      done();
    });
  });

  describe("POST /register", function() {
    it("basic registration works", function(done) {
      var username = 'user' + _.random(0, 1e6);
      chai.request(app)
        .post('/register')
        .send({
          username,
          password: 'test123'
        })
        .end(function(err, res) {
          expect(err).null;
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });
    it("username must be required", function(done) {
      chai.request(app)
        .post('/register')
        .send({
          password: 'test123'
        })
        .end(function(err, res) {
          expect(err).not.null;
          expect(res.status).equal(400);
          expect(res.body.success).equal(false);
          done();
        });
    });
    it("password must be required", function(done) {
      var username = 'user' + _.random(0, 1e6);
      chai.request(app)
        .post('/register')
        .send({
          username
        })
        .end(function(err, res) {
          expect(err).not.null;
          expect(res.status).equal(400);
          expect(res.body.success).equal(false);
          done();
        });
    });
    it("registering the same username twice is not allowed", function(done) {
      var username = 'user' + _.random(0, 1e6);
      chai.request(app)
        .post('/register')
        .send({
          username,
          password: 'test123'
        })
        .end(function(err, res) {
          expect(err).null;
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          chai.request(app)
            .post('/register')
            .send({
              username,
              password: 'test345'
            })
            .end(function(err, res) {
              expect(err).not.null;
              expect(res.status).equal(400);
              expect(res.body.success).equal(false);
              done();
            });
        });
    });
  });

  describe("POST /login", function() {
    var username = 'user' + _.random(0, 1e6);
    var password = 'test123';
    // Register a user
    before(function(done) {
      chai.request(app)
        .post('/register')
        .send({
          username,
          password
        })
        .end(function(err, res) {
          expect(err).null;
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });

    it("Login with correct username works", function(done) {
      chai.request.agent(app)
        .post('/login')
        .send({
          username,
          password
        })
        .end(function(err, res) {
          expect(err).null;
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });

    it("Login with incorrect username does not work", function(done) {
      chai.request.agent(app)
        .post('/login')
        .send({
          username: username + '_nosuch',
          password
        })
        .end(function(err, res) {
          expect(err).not.null;
          expect(res.status).equal(401);
          expect(res.body.success).equal(false);
          done();
        });
    });

    it("Login with incorrect password does not work", function(done) {
      chai.request.agent(app)
        .post('/login')
        .send({
          username: username,
          password: 'wrongpass'
        })
        .end(function(err, res) {
          expect(err).not.null;
          expect(res.status).equal(401);
          expect(res.body.success).equal(false);
          done();
        });
    });
  });

  describe("GET /users", function() {
    var username = 'user' + _.random(0, 1e6);
    var password = 'test123';
    var agent = chai.request.agent(app);
    before(function(done) {
      agent
        .post('/register')
        .send({
          username,
          password
        })
        .end(function(err, res) {
          expect(err).null;
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          agent
            .post('/login')
            .send({
              username,
              password
            })
            .end(function(err, res) {
              expect(err).null;
              expect(res.status).equal(200);
              expect(res.body.success).equal(true);
              done();
            });
        });
    });

    it("requires login", function(done) {
      chai.request(app)
        .get('/users')
        .end(function(err, res) {
          expect(err).not.null;
          expect(res.status).equal(401);
          expect(res.body.success).equal(false);
          done();
        });
    });

    it("returns a list of users", function(done) {
      agent
        .get('/users')
        .end(function(err, res) {
          expect(err).null;
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          expect(res.body.users).an('array');
          expect(res.body.users).not.empty;
          done();
        });
    });
    it("Bonus: returns at most 25 users", function(done) {
      var usernames = _.range(30).map(n => 'user' + _.random(0, 1e6));
      Promise.all(usernames.map(u => {
        return agent.post('/register')
          .send({username: u, password});
      }))
      .then(function(res) {
        return agent.get('/users');
      })
      .then(function(res) {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.users).lengthOf(25);
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });
  });

  describe("POST /messages", function() {
    var username = 'user' + _.random(0, 1e6);
    var password = 'test123';
    var userId;
    var agent = chai.request.agent(app);
    before(function(done) {
      agent
        .post('/register')
        .send({
          username,
          password
        })
        .end(function(err, res) {
          expect(err).null;
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          userId = res.body.user._id;
          agent
            .post('/login')
            .send({
              username,
              password
            })
            .end(function(err, res) {
              expect(err).null;
              expect(res.status).equal(200);
              expect(res.body.success).equal(true);
              done();
            });
        });
    });

    it("requires login", function(done) {
      chai.request(app)
        .post('/messages')
        .end(function(err, res) {
          expect(err).not.null;
          expect(res.status).equal(401);
          expect(res.body.success).equal(false);
          done();
        });
    });

    it("'to' field is required", function(done) {
      agent
        .post('/messages')
        .send({body: 'test message'})
        .end(function(err, res) {
          expect(err).not.null;
          expect(res.status).equal(400);
          expect(res.body.success).equal(false);
          done();
        });
    });

    it("can send a message to self", function(done) {
      agent
        .post('/messages')
        .send({to: userId})
        .end(function(err, res) {
          expect(err).null;
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });
  });

  describe("GET /messages", function() {
    var loggedInUser = 'user' + _.random(0, 1e6);
    var otherUser = 'user' + _.random(0, 1e6);
    var password = 'test123';
    var loggedInUserId;
    var otherUserId;
    var agent = chai.request.agent(app);
    before(function(done) {
      agent
        .post('/register')
        .send({
          username: loggedInUser,
          password
        })
      .then(function(res) {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        loggedInUserId = res.body.user._id;
        return agent.post('/register')
          .send({
            username: otherUser,
            password
          });
      })
      .then(function(res) {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        otherUserId = res.body.user._id;
        return agent
          .post('/login')
          .send({
            username: loggedInUser,
            password
          });
      })
      .then(function(res) {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });

    it("requires login", function(done) {
      chai.request(app)
        .get('/messages')
        .end(function(err, res) {
          expect(err).not.null;
          expect(res.status).equal(401);
          expect(res.body.success).equal(false);
          done();
        });
    });

    it("messages are sorted in reverse chronological order", function(done) {
      agent
        .post('/messages')
        .send({body: 'first message', to: loggedInUserId})
      .then(function() {
        return agent
          .post('/messages')
          .send({body: 'second message', to: loggedInUserId});
      })
      .then(function() {
        return agent
          .get('/messages');
      })
      .then(function(res) {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.messages).not.empty;
        var sortedMessages = _.sortBy(res.body.messages, function(message) {
          return -message.timestamp;
        });
        expect(sortedMessages).deep.equal(res.body.messages);
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });

    it("to and from fields are populated with username", function(done) {
      agent
        .post('/messages')
        .send({body: 'first message', to: loggedInUserId})
        .then(function(res) {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          return agent
            .get('/messages');
        })
        .then(function(res) {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          expect(res.body.messages).not.empty;
          res.body.messages.forEach(function(message) {
            expect(message.from.username).a('string');
            expect(message.to.username).a('string');
          });
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });

    it("includes messages sent from logged in user", function(done) {
      var body = 'message sent from user';
      agent
        .post('/messages')
        .send({body, to: otherUserId})
        .then(function(res) {
          return agent.get('/messages');
        })
        .then(function(res) {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          expect(res.body.messages).not.empty;
          var messageBodies = res.body.messages.map(function(message) {
            return message.body;
          });
          expect(messageBodies).contains(body);
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });

    it("Bonus: includes messages sent to logged in user", function(done) {
      var body = 'message sent to user';
      agent
        .post('/messages')
        .send({body, to: otherUserId})
        .then(function(res) {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          return agent
            .post('/login')
            .send({username: otherUser, password});
        })
        .then(function(res) {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          return agent.get('/messages');
        })
        .then(function(res) {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          expect(res.body.messages).not.empty;
          var messageBodies = res.body.messages.map(function(message) {
            return message.body;
          });
          expect(messageBodies).contains(body);
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });
  });
});
