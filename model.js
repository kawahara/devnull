var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: String
});

var ReplySchema = new Schema({
  user_id: Schema.Types.ObjectId,
  body: String,
  updated: { type: Date, default: Date.now }
});

var PostSchema = new Schema({
  user_id: Schema.Types.ObjectId,
  body: String,
  updated: { type: Date, default: Date.now },
  replies: [ ReplySchema ]
});

var User  = exports.User  = mongoose.model('User', UserSchema);
var Reply = exports.Reply = mongoose.model('Reply', ReplySchema);
var Post  = exports.Post  = mongoose.model('Post', PostSchema);

var isValidObjectId = function(str) {
  var len = str.length;
  if (len == 12 || len == 24) {
    return /^[0-9a-fA-F]+$/.test(str);
  }

  return false;
};

var response404 = function(res) {
  res.status(404);
  res.send(JSON.stringify({
    code: 404,
    message: 'not found'
  }));

  return;
};

var handleMongoDBError = function(err, res) {
  res.status(500);
  res.send(JSON.stringify({
    code: 500,
    message: 'internal server error'
  }));
  console.log(err);

  return;
};

Post.routes = {};

Post.routes.list = function(req, res) {
  Post.find()
    .skip(0)
    .limit(10)
    .select('-__v')
    .sort('-updated')
    .exec(function(err, results) {
      if (err) return handleMongoDBError(err, res);

      res.contentType('application/json');
      res.send(JSON.stringify(results));
    });
};


Post.routes.create = function(req, res) {
  var post = new Post();
  res.contentType('application/json');

  if (!req.body.body) {
    res.status(400);
    res.send(JSON.stringify({
      code: 400,
      sub_code: 1,
      message: 'body is required'
    }));
  }

  post.body = req.body.body;
  post.save(function(err) {
    if (err) return handleMongoDBError(err, res);

    Post.findById(post)
      .select('-__v')
      .exec(function(err, doc) {
      if (err) return handleMongoDBError(err, res);

      res.status(201);
      res.send(JSON.stringify(doc));
    });
  });
};

Post.routes.show = function(req, res) {
  res.contentType('application/json');
  Post.findById(req.params.id)
    .select('-__v')
    .exec(function(err, post) {
    if (err) return handleMongoDBError(err, res);

    if (!post) return response404(res);

    res.send(JSON.stringify(post));
  });
};

Post.routes.destroy = function(req, res) {
  res.contentType('application/json');

  if (!isValidObjectId(req.params.id)) {
    res.send(JSON.stringify({
      code: 400,
      sub_code: 2,
      message: 'invalid id format'
    }));
  }

  Post.findByIdAndRemove(req.params.id, function(err, post) {
    if (err) return handleMongoDBError(err, res);

    if (!post) return response404(res);

    res.status(204);
    res.send("");
  });
};

Reply.routes = {};

Reply.routes.list = function(req, res) {
  res.contentType('application/json');
  Post.findById(req.params.id, function(err, post) {
    if (err) return handleMongoDBError(err, res);

    if (!post) return response404();

    res.send(JSON.stringify(post.replies));
  });
};

Reply.routes.create = function(req, res) {
  res.contentType('application/json');
  if (!req.body.body) {
    res.status(400);
    res.send(JSON.stringify({
      code: 400,
      sub_code: 1,
      message: 'body is required'
    }));

    return;
  }

  Post.findById(req.params.postId, function(err, post) {
    if (err) return handleMongoDBError(err, res);

    if (!post) return response404(res);

    var reply = new Reply();
    reply.body = req.body.body;
    post.replies.push(reply);

    post.save(function(err) {
      if (err) return handleMongoDBError(err, res);

      res.status(201);
      res.send(JSON.stringify(reply));
    })
  });
};

Reply.routes.destroy = function(req, res) {
  res.contentType('application/json');
  Post.findOne()
    .where('replies').elemMatch({_id: req.params.id})
    .exec(function(err, post) {
      if (err) return handleMongoDBError(err, res);
      if (!post) return response404(res);

      Post.update({_id: req.params.postId}, {$pull: {replies: { _id: req.params.id}}})
        .exec(function(err) {
          if (err) return handleMongoDBError(err, res);

          res.status(204);
          res.send("");
        });
    });
};
