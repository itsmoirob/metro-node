angular.module('apiFactory', [])
.factory('dataFactory', ['$http', function($http){
  var urlBase = ('./api/');
  var dataFactory = {};

  dataFactory.getPickUp = function(){ //GET all of the basic info for front page
    return $http.get(urlBase + 'pickUp');
  };

  dataFactory.getSiteSummary = function (id) {
    return $http.get(urlBase + 'displaySite/site/' + id);
  };

  dataFactory.getSiteInverterGeneration = function (id) {
    return $http.get(urlBase + 'displaySite/generation/' + id);
  };

  dataFactory.getSiteExportGeneration = function (id) {
    return $http.get(urlBase + 'displaySite/export/' + id);
  };

  dataFactory.getEPC = function (id) {
    return $http.get(urlBase + 'displaySite/epc/' + id);
  };

  dataFactory.getAdmin = function (id) {
    return $http.get(urlBase + 'displaySite/admin/' + id);
  };

  dataFactory.getSitePyro = function (id) {
    return $http.get(urlBase + 'displaySite/pyro/' + id);
  };

  dataFactory.getMKReport = function (id) {
    return $http.get(urlBase + 'displaySite/report/' + id);
  };

  dataFactory.allSiteDaily = function (id) {
    return $http.get(urlBase + 'displaySite/allSiteDaily');
  };

  dataFactory.allSiteDailyMWp = function (id) {
    return $http.get(urlBase + 'displaySite/allSiteDailyMWp');
  };

  dataFactory.getChartPyro = function (id) {
    return $http.get(urlBase + 'displaySite/pyroMean/' + id);
  };

  dataFactory.getIncidentReport = function () {
    return $http.get(urlBase + 'reports/incidents');
  };

  dataFactory.getIncidentReportAll = function () {
    return $http.get(urlBase + 'reports/incidentsAll');
  };

  dataFactory.getIncidentReportSite = function (id) {
    return $http.get(urlBase + 'reports/incidentsSite/' + id);
  };

  dataFactory.getIncidentReportLog = function (id) {
    return $http.get(urlBase + 'reports/incidentLog/' + id);
  };

  dataFactory.getIncidentReportLogComment = function (id) {
    return $http.get(urlBase + 'reports/incidentLogComments/' + id);
  };

  dataFactory.getAllReports = function () {
    return $http.get(urlBase + 'displaySite/allReport/');
  };

  dataFactory.getSelectReports = function (year, month, day, numberOfDays) {
    return $http.get(urlBase + 'displaySite/reportSelect/' + year + '/' + month + '/' + day + '/' + numberOfDays + '/');
  };

  dataFactory.getIncidentSiteName = function () {
    return $http.get(urlBase + 'incidents/incidentSiteName/');
  };

  dataFactory.getIncidentCategory = function () {
    return $http.get(urlBase + 'incidents/incidentCategory/');
  };

  return dataFactory;
}])

;
