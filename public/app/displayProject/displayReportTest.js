angular.module('displayProjectTest', [
  'ui.router',
  'ngAnimate',
  'listSites',
  'apiFactory'
])


.controller('ReportTestCtrl', ['$scope', '$stateParams', '$http', '$log', '$state','dataFactory', function($scope,$stateParams,$http,$log,$state,dataFactory){

  var SP = $stateParams.siteResult;

  getReportRaw(SP);
  function getReportRaw(SP) {
    dataFactory.getReportRaw(SP)
    .success(function(res){
      $scope.reportRaw = res;
    });
  }
  getReportOver(SP);
  function getReportOver(SP) {
    dataFactory.getReportOver(SP)
    .success(function(res){
      $scope.reportOver = res;
    });
  }
  getReportSD(SP);
  function getReportSD(SP) {
    dataFactory.getReportSD(SP)
    .success(function(res){
      $scope.reportSD = res;
    });
  }


}]);
