angular.module('displayProject', [
  'ui.router',
  'ngAnimate',
  'listSites',
  'uiGmapgoogle-maps',
  'highcharts-ng',
  'apiFactory'
])

.controller('DisplayCtrl', ['$scope', '$stateParams', '$http', '$log', '$state','dataFactory', function($scope,$stateParams,$http,$log,$state,dataFactory){

  var SP = $stateParams.siteResult;

  getSiteSummary(SP); //gets summary array of site
  function getSiteSummary(SP) {
    dataFactory.getSiteSummary(SP)
    .success(function(res){
      $scope.currentDisplaySite = res;
      $scope.map = { center: { latitude: res[0].latitude, longitude: res[0].longitude }, zoom: 16 }; //sets up gmaps
      $scope.marker = { //sets up pin for gmaps
        id: $stateParams.siteResult,
        coords: {
          latitude: res[0].latitude,
          longitude: res[0].longitude
        },
        options: { draggable: true }
      };
    });
  }

  getEPC(SP);
  function getEPC(SP) {
    dataFactory.getEPC(SP)
    .success(function(res){
      $scope.epc = res;
    });
  }

  getAdmin(SP);
  function getAdmin(SP) {
    dataFactory.getAdmin(SP)
    .success(function(res){
      $scope.admin = res;
    });
  }

  getReport(SP);
  function getReport(SP) {
    dataFactory.getMKReport(SP)
    .success(function(res){
      $scope.MKReport = res;
    });
  }
}]);
