require('dotenv').config(); // Sets up dotenv as soon as our application starts
var createError = require('http-errors');
var mongoose = require('mongoose');
var express = require('express');
var logger = require('morgan');
const bodyParser = require('body-parser');
//const expressValidator = require('express-validator');

const connUri = process.env.MONGO_LOCAL_CONN_URL;
mongoose.connect(connUri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false }, function (error) {
    if (error) {
        status = 500;
        result.status = status;
        result.error = err;
        res.status(status).send(result);
    }
}); // connect to our database

var app = express();

const router = express.Router();



app.use(bodyParser.json());
//app.use(expressValidator());
app.use(bodyParser.urlencoded({
  extended: true
}));


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    next();
});




var routes = require('./routes/index.js');

app.use('/api/v1', routes(router));


app.use(logger('dev'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
