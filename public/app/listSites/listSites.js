angular.module('listSites', [
  'ui.router',
  'ngAnimate',
  'apiFactory'
])

.controller('MainCtrl', ['$scope', '$stateParams', '$http', '$log', 'dataFactory', function($scope,$stateParams,$http,$log,dataFactory){

  getIntroSites();
  function getIntroSites() {
    dataFactory.getPickUp()
    .success(function(res){
      $scope.introSites = res;
    });
  }

}]);
