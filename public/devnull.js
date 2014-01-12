var postsServices = angular.module('postsServices', ['ngResource']);
postsServices.factory('Post', ['$resource',
  function($resource) {
    return $resource('api/posts/:id', {}, {
      query: {method: 'GET', isArray: true},
      save: {method: 'POST'},
      remove: {method: 'DELETE'}
    });
  }
]);

postsServices.factory('Reply', ['$resource',
  function($resource) {
    return $resource('api/posts/:postId/reply/:id', {}, {
      save: {method: 'POST'},
      remove: {method: 'DELETE'}
    });
  }
]);

var devnullApp = angular.module('devnullApp', ['postsServices']);
devnullApp.controller('postsCntl', ['$scope','Post','Reply',
  function($scope, Post, Reply) {
    $scope.posts = Post.query();
    $scope.delete = function(post) {
      post.$remove({id: post._id }, function() {
        for (var i = 0; $scope.posts.length > i; i++) {
          if ($scope.posts[i]._id === post._id) {
            $scope.posts.splice(i, 1);
            break;
          }
        }
      });
    };
    $scope.submit = function() {
      var p = new Post($scope.post);
      p.$save(function(p) {
        $scope.posts.unshift(p);
        $scope.post = null;
      });
    };
    $scope.reply = function(post) {
      var r = new Reply(post.newreply);
      r.$save({postId: post._id}, function(r) {
        post.replies.push(r);
        post.newreply = null;
      });
    };

    $scope.deleteReply = function(post, reply) {
      var r = new Reply(reply);
      r.$remove({postId: post._id, id: r._id}, function() {
        for (var i = 0; post.replies.length > i; i++) {
          if (post.replies[i]._id === r._id) {
            post.replies.splice(i, 1);
            break;
          }
        }
      });
    };
  }
]);
