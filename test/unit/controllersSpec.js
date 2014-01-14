describe('posts controllers', function() {

  beforeEach(function() {
    this.addMatchers({
      toEqualData: function(expected) {
        return angular.equals(this.actual, expected);
      }
    });
  });

  beforeEach(module('devnullApp'));
  beforeEach(module('postsServices'));

  describe('postsCntl', function() {
    var scope, ctrl, $httpBackend;

    var postsData = [{
          body: 'test',
          _id: '123',
          replies: [{
            _id: '456',
            body: "test"
          }],
          updated: new Date()
        }];

    beforeEach(inject(function(_$httpBackend_,$rootScope, $controller) {
      $httpBackend = _$httpBackend_;

      $httpBackend.expectGET('api/posts')
        .respond(200, postsData);

      scope = $rootScope.$new();
      ctrl = $controller('postsCntl', {$scope: scope});
    }));

    it('should display post list', function() {
      expect(scope.posts).toEqualData([]);
      $httpBackend.flush();
      expect(scope.posts).toEqualData(postsData);
    });

    it('should display a new post after the submit action', function() {
      var submitData = {
        body: "Hello World."
      };

      $httpBackend.expectPOST('api/posts')
        .respond(201, "");
      scope.post = submitData;
      scope.submit();
      $httpBackend.flush();

      expect(scope.post).toEqualData(null);
      expect(scope.posts[0]).toEqualData(submitData);
    });

    it('should remove a post', function() {
      $httpBackend.flush();
      $httpBackend.expectDELETE('api/posts/123')
        .respond(204, "");

      scope.delete(scope.posts[0]);

      $httpBackend.flush();

      expect(scope.posts).toEqualData([]);
    });

    it('should display a new reply after the submit reply action', function() {
      var replyData = {
        body: "Hi, this is new reply"
      };

      $httpBackend.flush();
      $httpBackend.expectPOST('api/posts/123/reply')
        .respond(201, "");

      scope.posts[0].newreply = replyData;
      scope.reply(scope.posts[0]);
      $httpBackend.flush();

      expect(scope.posts[0].newreply).toEqualData(null);
      expect(scope.posts[0].replies[1]).toEqualData(replyData);
    });

    it('should remove a reply', function() {
      $httpBackend.flush();

      $httpBackend.expectDELETE('api/posts/123/reply/456')
        .respond(204, "");
      scope.deleteReply(scope.posts[0], scope.posts[0].replies[0]);

      $httpBackend.flush();

      expect(scope.posts[0].replies).toEqualData([]);
    });
  });
});
