angular.module('displayReportsIncidents', [
  'ui.router',
  'ngAnimate',
  'listSites',
  'apiFactory'
])

.constant('_', window._)


.controller('ReportIncidentsCtrl', ['$scope', '$stateParams', '$http', '$log', '$state','dataFactory', function($scope,$stateParams,$http,$log,$state,dataFactory){

  var SP = $stateParams.siteResult;
  var year = $stateParams.year;
  var month = $stateParams.month;
  var day = $stateParams.day;
  var numberOfDays = $stateParams.numberOfDays;

  $scope.year = $stateParams.year;
  $scope.month = $stateParams.month;
  $scope.day = $stateParams.day;
  $scope.numberOfDays = $stateParams.numberOfDays;


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

  getSelectReports(year, month, day, numberOfDays); //gets summary array of site
  function getSelectReports(year, month, day, numberOfDays) {
    dataFactory.getSelectReports(year, month, day, numberOfDays)
    .success(function(res){

      var newObj = _.reduce(res[0], function(accumulator, value, key) {
        var group = key.substring(0,4);
        var property = key.substring(5);

        if (!accumulator[group]) accumulator[group] = {};
        if (!accumulator[group].site) accumulator[group].site = group;
        accumulator[group][property] = value;
        return accumulator;
      }, {});

      $scope.selectReports = newObj;

    });
  }

  $scope.datePicked = {day: null, month: null, year: null, numberOfDays: null};

  $scope.months = [{name:"January", value:"01"},
  {name:"February", value:"02"},
  {name:"March", value:"03"},
  {name:"April", value:"04"},
  {name:"May", value:"05"},
  {name:"June", value:"06"},
  {name:"July", value:"07"},
  {name:"August", value:"08"},
  {name:"September", value:"09"},
  {name:"October", value:"10"},
  {name:"November", value:"11"},
  {name:"December", value:"12"}];

  getIncidentSiteName(SP); //gets summary array of site
  function getIncidentSiteName(SP) {
    dataFactory.getIncidentSiteName(SP)
    .success(function(res){
      $scope.incidentSiteName = res;
    });
  }

  getIncidentCategory(SP); //gets summary array of site
  function getIncidentCategory(SP) {
    dataFactory.getIncidentCategory(SP)
    .success(function(res){
      $scope.incidentCategory = res;
    });
  }


}]);
