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

  return dataFactory;
}])

;
