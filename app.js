'use strict';

const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
require('dotenv').config();
var indexRouter = require('./routes/index');
const ejs = require('ejs')
const logger = require('morgan');

//console.log = function() {}

app.use(logger('dev'));

// ---------------------------------------------
// --------- Parsing the body ------------------
// ---------------------------------------------
app.use(express.urlencoded({
  limit: '500mb',
  extended: true
}));
app.use(express.json({
  limit: '500mb',
  extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------
// --------- set access permission to origin ---
// ---------------------------------------------
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});
// ---------------------------------------------
// --------- Calling Router --------------------
// ---------------------------------------------
app.use('/', indexRouter);

// ---------------------------------------------
// --------- view engine setup -----------------
// ---------------------------------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ---------------------------------------------
// --------- use application utilities ---------
// ---------------------------------------------
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());


// ---------------------------------------------
// --- catch 404 and forward to error handler --
// ---------------------------------------------
app.use(function (req, res, next) {
  next(createError(404));
});

// ---------------------------------------------
// ---------- error handler --------------------
// ---------------------------------------------
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;