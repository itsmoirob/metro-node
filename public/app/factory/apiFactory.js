angular.module('apiFactory', [])
    .factory('dataFactory', ['$http', function ($http) {
        var urlBase = ('./api/');
        var dataFactory = {};

        dataFactory.getPickUp = function () { //GET all of the basic info for front page
            return $http.get(urlBase + 'pickUp');
        };

        dataFactory.getSiteSummary = function (id) {
            return $http.get(urlBase + 'displaySite/site/' + id);
        };

        dataFactory.getSiteInverterGeneration = function (id) {
            return $http.get(urlBase + 'displaySite/generation/' + id);
        };

        dataFactory.getMonthReport = function (id) {
            return $http.get(urlBase + 'displaySite/monthReport/' + id);
        };

        dataFactory.getMonthGeneration = function (id, month) {
            if (month == '') {
                month = '2015-12';
            }
            return $http.get(urlBase + 'displaySite/siteMonthGeneration/' + id + '/' + month);
        };

        dataFactory.siteMonthSumGeneration = function (id) {
            return $http.get(urlBase + 'displaySite/siteMonthSumGeneration/' + id);
        };

        dataFactory.siteMonthIncidents = function (id) {
            return $http.get(urlBase + 'displaySite/siteMonthIncidents/' + id);
        };

        dataFactory.getSiteExportGeneration = function (id) {
            return $http.get(urlBase + 'displaySite/export/' + id);
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

        dataFactory.allSiteDailyEsol = function (id) {
            return $http.get(urlBase + 'displaySite/allSiteDailyEsol');
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

        dataFactory.getOpenIncidentSite = function (id) {
            return $http.get(urlBase + 'reports/openIncidentsSite/' + id);
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

        dataFactory.getSelectReports = function (startDate, endDate) {
            return $http.get(urlBase + 'displaySite/reportSelect/' + startDate + '/' + endDate + '/');
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
