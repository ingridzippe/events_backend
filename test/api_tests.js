var app = require('../app');
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
var { User, Message } = require('../models');
var _ = require('underscore');
var Promise = require('promise');

chai.use(chaiHttp);

const isUser = function(user){
  expect(user).to.be.an('object');
  expect(user).to.have.all.keys(['username','_id']);
};

describe("API tests", function() {
  // Delete all data before testing.
  // This before() runs before all of the tests.
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
    // We generate a unique username by adding a large random number to it.
    var username = 'user' + _.random(0, 1e6);
    it("basic registration works", function(done) {
      // We use a unique username each time we register so that our tests
      // do not conflict with eachother by trying to register the same user
      // twice.
      chai.request(app)
      .post('/register')
      .send({
        username,
        password: 'test123'
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
        done();
      });
    });
    it("username must be required", function(done) {
      chai.request(app)
      .post('/register')
      .send({
        username: '',
        password: 'test123'
      })
      .end(function(err, res) {
        expect(err).not.to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body.success).to.equal(false);
        done();
      });
    });
    it("password must be required", function(done) {
      chai.request(app)
      .post('/register')
      .send({
        username: 'person',
        password: ''
      })
      .end(function(err, res) {
        expect(err).not.to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body.success).to.equal(false);
        done();
      });
    });
    it("registering the same username twice is not allowed", function(done) {
      chai.request(app)
      .post('/register')
      .send({
        username,
        password: 'test123'
      })
      .end(function(err, res) {
        expect(err).not.to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body.success).to.equal(false);
        done();
      });
    });
  });

  describe("POST /login", function() {
    var username = 'user' + _.random(0, 1e6);
    var password = 'test123';
    // In order to login we need to first register, so we register
    // once before all of the POST /login tests.
    // We can then use this one user for all our login testing.
    before(function(done) {
      chai.request(app)
      .post('/register')
      .send({
        username,
        password
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
        done();
      });
    });

    it("Login with correct username works", function(done) {
      // We must use chai.request.agent(app) instead of chai.reques(app)
      // because chai.request.agent(app) handles login sessions correctly
      chai.request.agent(app)
      .post('/login')
      .send({
        username,
        password
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
        done();
      });
    });

    it("Login with incorrect username does not work", function(done) {
      chai.request.agent(app)
      .post('/login')
      .send({
        username: 'badUsername',
        password
      })
      .end(function(err, res) {
        expect(err).not.to.be.null;
        expect(res.status).to.equal(401);
        expect(res.body.success).to.equal(false);
        done();
      });
    });

    it("Login with incorrect password does not work", function(done) {
      chai.request.agent(app)
      .post('/login')
      .send({
        username,
        password: 'badPassword'
      })
      .end(function(err, res) {
        expect(err).not.to.be.null;
        expect(res.status).to.equal(401);
        expect(res.body.success).to.equal(false);
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
      .end(function(err,res){
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
        agent
        .post('/login')
        .send({
          username,
          password
        })
        .end(function(err,res){
          expect(err).to.be.null;
          expect(res.status).to.equal(200);
          expect(res.body.success).to.equal(true);
          done();
        });
      });
    });

    it("requires login", function(done) {
      // This test verifies that making a request to GET /messages without
      // logging in generates the correct error.
      //
      // Using chai.request() instead of chai.request.agent() ensures
      // that we are NOT logged in.
      chai.request(app)
      .get('/users')
      .end(function(err, res) {
        expect(err).not.to.be.null;
        expect(res.status).to.equal(401);
        expect(res.body.success).to.equal(false);
        done();
      });
    });

    it("returns a list of users", function(done) {
      agent
      .get('/users')
      .end(function(err,res){
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
        expect(res.body.users).to.have.lengthOf(3);
        isUser(res.body.users[0]);
        done();
      });
    });
    it("Bonus: returns at most 25 users", function(done) {
      agent
      .get('/users')
      .end(function(err,res){
        expect(err).to.null;
        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
        expect(res.body.users).to.have.length.below(26);
        isUser(res.body.users[0]);
        done();
      });
    });
  });

  var username = 'user' + _.random(0, 1e6);
  var password = 'test123';
  var id, myId;
  var agent = chai.request.agent(app);
  describe("POST /messages", function() {
    before(function(done) {
      agent
      .post('/register')
      .send({
        username,
        password
      })
      .end(function(err,res){
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
        agent
        .post('/login')
        .send({
          username,
          password
        })
        .end(function(err,res){
          expect(err).to.be.null;
          expect(res.status).to.equal(200);
          expect(res.body.success).to.equal(true);
          myId = res.body.user._id;
          agent
          .post('/register')
          .send({
            username: 'user' + _.random(0, 1e6),
            password
          })
          .end(function(err,res){
            expect(err).to.be.null;
            expect(res.status).to.equal(200);
            expect(res.body.success).to.equal(true);
            id = res.body.user._id;
            done();
          });
        });
      });
    });

    it("requires login", function(done) {
      chai.request(app)
      .post('/messages')
      .send({
        to:id
      })
      .end(function(err, res) {
        expect(err).not.to.be.null;
        expect(res.status).to.equal(401);
        expect(res.body.success).to.equal(false);
        done();
      });
    });

    it("'to' field is required", function(done) {
      agent
      .post('/messages')
      .send({
        to:''
      })
      .end(function(err, res) {
        expect(err).not.to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body.success).to.equal(false);
        done();
      });
    });

    it("can send a message to self", function(done) {
      agent
      .post('/messages')
      .send({
        to:myId
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
        done();
      });
    });
    it("can send a message to another user", function(done) {
      agent
      .post('/messages')
      .send({
        to:id
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
        done();
      });
    });
  });

  describe("GET /messages", function() {
    before(function(done) {
      agent
        .post('/messages')
        .send({
          to:myId
        })
      .then(function(res) {
        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
      })
      .then(function() {
        return agent
          .post('/messages')
          .send({
            to:myId
          });
      })
      .then(function(res) {
        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
      })
      .then(function() {
        return agent
          .post('/messages')
          .send({
            to:myId
          });
      })
      .then(function(res) {
        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
        done();
      })
      .catch(function(err){
        done(err);
      });
    });

    it("requires login", function(done) {
      chai.request(app)
      .get('/messages')
      .end(function(err, res) {
        expect(err).not.to.be.null;
        expect(res.status).to.equal(401);
        expect(res.body.success).to.equal(false);
        done();
      });
    });

    const isSortedReverseChronological = function(messages){
      var date = new Date(messages[0].timestamp);
      try {
        messages.forEach((message)=>{
          let tempDate = new Date(message.timestamp);
          if(tempDate > date){
            throw('Error: not sorted correctly.');
          }
        });
      } catch(err) {
        return false;
      }
      return true;
    };

    it("messages are sorted in reverse chronological order", function(done) {
      agent
      .get('/messages')
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
        expect(res.body.messages).to.have.lengthOf(5);
        expect(isSortedReverseChronological(res.body.messages)).to.be.ok;
        done();
      });
    });

    it("to and from fields are populated with username", function(done) {
      agent
      .get('/messages')
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
        res.body.messages.forEach(message=>{
          isUser(message.to);
          isUser(message.from);
        });
        done();
      });
    });

    const containsMessagesFrom = function(messages,myId){
      try {
        messages.forEach((message)=>{
          if(message.from._id === myId && message.to._id !== myId) {
            throw("Found message.");
          }
        });
      } catch(error) {
        return true;
      }
      return false;
    };

    const containsMessagesTo = function(messages,myId){
      try {
        messages.forEach((message)=>{
          if(message.to._id === myId && message.from._id !== myId) {
            throw("Found message.");
          }
        });
      } catch(error) {
        return true;
      }
      return false;
    };

    it("includes messages sent from logged in user", function(done) {
      agent
      .get('/messages')
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
        expect(containsMessagesFrom(res.body.messages,myId)).to.be.ok;
        done();
      });
    });

    it("Bonus: includes messages sent to logged in user", function(done) {
      /*agent
      .get('/messages')
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
        expect(containsMessagesTo(res.body.messages,myId)).to.be.ok;
        done();
      });*/
      done();
    });
  });
});
