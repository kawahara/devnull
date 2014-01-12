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
          replies: [],
          updated: new Date()
        }];

    beforeEach(inject(function(_$httpBackend_,$rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('api/posts').
        respond(postsData);

      scope = $rootScope.$new();
      ctrl = $controller('postsCntl', {$scope: scope});
    }));

    it('should display post list', function() {
      expect(scope.posts).toEqualData([]);
      $httpBackend.flush();
      expect(scope.posts).toEqualData(postsData);
    });
  });
});
