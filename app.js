var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var connectCouchDB = require('connect-couchdb')(session);

var app = express();

var store = new connectCouchDB({
	name: process.env.COUCHDB_NAME || 'archery-server-sessions',
	//username: process.env.COUCHDB_USER || 'db_user',
	//password: process.env.COUCHDB_PASS || 'db_pass',
	host: process.env.COUCHDB_HOST || 'localhost'
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser('secret'));
app.use(session({
	name: "sessionID",
	secret: process.env.session_sercret || 'secret',
  	saveUninitialized: false,
	cookie: {
		httpOnly: false
    		// bellow is a recommended option. however, it requires an https-enabled website...
    		// secure: true,
	},
	store: store
	})
);

var routes = require('./routes/index');
var personal = require('./routes/personal');
var organization = require('./routes/organization');

var app_routes = require('./routes/app_routes');
var app_personal = require('./routes/app_personal');
var app_organization = require('./routes/app_organization');

app.use('/', routes);
app.use('/personal', personal);
app.use('/organization', organization);

app.use('/app', app_routes);
app.use('/app/personal', app_personal);
app.use('/app/organization', app_organization);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//--- Error Handlers ---//

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//--- End Error Handlers ---//

module.exports = app;
