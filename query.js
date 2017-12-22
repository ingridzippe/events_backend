"use strict";

var pool = require('./app.js');

pool.query('CREATE TABLE tabletest')
.then(function(result) {
})
.catch(function(err) {
});
