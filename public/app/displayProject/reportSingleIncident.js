angular.module('displaySingleReportsIncident', [
  'ui.router',
  'listSites',
  'apiFactory'
])

.constant('_', window._)


.controller('ReportSingleIncidentCtrl', ['$scope', '$stateParams', '$http', '$log', '$state','dataFactory', function($scope,$stateParams,$http,$log,$state,dataFactory){

  var SP = $stateParams.incidentId;
  $scope.param = SP;

  // function closeStatus() {
  //   
  //   $http({
  //     method  : 'POST',
  //     url     : '/users/newComment'
  //     // data    : $scope.user, //forms user object
  //     // headers : {'Content-Type': 'application/x-www-form-urlencoded'}
  //   })
  // }
  //
  // $scope.closeStatus()

  getIncidentReportLog(SP);
  function getIncidentReportLog(SP) {
    dataFactory.getIncidentReportLog(SP)
    .success(function(res){
      $scope.incidentReportLog = res[0];
    });
  }

  getIncidentReportLogComment(SP);
  function getIncidentReportLogComment(SP) {
    dataFactory.getIncidentReportLogComment(SP)
    .success(function(res){
      $scope.incidentReportLogComment = res;
    });
  }

}]);
