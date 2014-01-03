
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var model = require('./model');
var mongoose = require('mongoose');
var swig = require('swig');

var app = express();

var db = mongoose.connect('mongodb://localhost/devnull');

// all environments
app.engine('html', swig.renderFile);

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('view cache', false);
app.set('db', db);

swig.setDefaults({ cache: false });

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// post API
app.get('/api/posts', model.Post.routes.list);
app.post('/api/posts', model.Post.routes.create);
app.get('/api/posts/:id', model.Post.routes.show);
app.delete('/api/posts/:id', model.Post.routes.destroy);

// reply API
app.get('/api/posts/:postId/reply', model.Reply.routes.list);
app.post('/api/posts/:postId/reply', model.Reply.routes.create);
app.delete('/api/posts/:postId/reply/:id', model.Reply.routes.destroy);

console.log(app.routes);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
