var express = require("express");
var session = require('express-session');
var config = require('./config.js');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use("/client", express.static('public'));
// app.use(session({
//   secret: 'Ilovecat',
//   key: 'sessionId',
//   resave: false,
//   saveUninitialized: true
// }))

app.use('/api/proxy', function(req, res) {
  req.pipe(request(req.query.target)).pipe(res);
})

app.listen(process.env.VCAP_APP_PORT || 3000);
