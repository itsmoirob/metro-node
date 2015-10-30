angular.module('displayReportsIncidents', [
  'ui.router',
  'ngAnimate',
  'listSites',
  'apiFactory'
])

.constant('_', window._)


.controller('ReportIncidentsCtrl', ['$scope', '$stateParams', '$http', '$log', '$state','dataFactory', function($scope,$stateParams,$http,$log,$state,dataFactory){

  var SP = $stateParams.siteResult;


  getIncidentReportAll();
  function getIncidentReportAll() {
    dataFactory.getIncidentReportAll()
    .success(function(res){
      $scope.incidentReportAll = res;
    });
  }

  getIncidentReportSite(SP);
  function getIncidentReportSite(SP){
    dataFactory.getIncidentReportSite(SP)
    .success(function(res){
      $scope.incidentReportSite = res;
    });
  }

  getSiteSummary(SP); //gets summary array of site
  function getSiteSummary(SP) {
    dataFactory.getSiteSummary(SP)
    .success(function(res){
      $scope.currentDisplaySite = res;
    });
  }

  var arr;
  getAllReports(); //gets summary array of site
  function getAllReports() {
    dataFactory.getAllReports()
    .success(function(res){

      var newObj = _.reduce(res[0], function(accumulator, value, key) {
        var group = key.substring(0,4);
        var property = key.substring(5);

        if (!accumulator[group]) accumulator[group] = {};
        if (!accumulator[group].site) accumulator[group].site = group;
        accumulator[group][property] = value;
        return accumulator;
      }, {});

      $scope.allReports = newObj;

    });
  }

}]);
