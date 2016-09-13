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

		dataFactory.getMonthReport = function (id, month) {
			return $http.get(urlBase + 'displaySite/monthReport/' + id + '/' + month);
		};

		dataFactory.getMonthGeneration = function (id, month) {
			return $http.get(urlBase + 'displaySite/siteMonthGeneration/' + id + '/' + month);
		};

		dataFactory.siteMonthSumGeneration = function (id, month) {
			return $http.get(urlBase + 'displaySite/siteMonthSumGeneration/' + id + '/' + month);
		};

		dataFactory.siteMonthIncidents = function (id, month) {
			return $http.get(urlBase + 'displaySite/siteMonthIncidents/' + id + '/' + month);
		};
		
		dataFactory.siteMonthSumPR = function (id, month) {
			return $http.get(urlBase + 'displaySite/siteMonthSumPR/' + id + '/' + month);
		};

		dataFactory.getSiteExportGeneration = function (id) {
			return $http.get(urlBase + 'displaySite/export/' + id);
		};

		dataFactory.getMKReport = function (id) {
			return $http.get(urlBase + 'displaySite/report/' + id);
		};

		dataFactory.getSiteInstallInfo = function (id) {
			return $http.get(urlBase + 'displaySite/install/' + id);
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

		dataFactory.getAllReports = function (startDate, endDate) {
			return $http.get(urlBase + 'displaySite/allReport/' + startDate + '/' + endDate + '/');
		};

		dataFactory.getIncidentSiteName = function () {
			return $http.get(urlBase + 'incidents/incidentSiteName/');
		};

		dataFactory.getIncidentCategory = function () {
			return $http.get(urlBase + 'incidents/incidentCategory/');
		};
		
		dataFactory.getPortfolioSiteInfo = function () {
			return $http.get(urlBase + 'displaySite/portfolioSiteInfo/');
		};
		
		dataFactory.getPortfolioAllSiteMwp = function () {
			return $http.get(urlBase + 'displaySite/portfolioAllSiteMwp/');
		};
		
		dataFactory.getPortfolioSiteDataMonth = function (month) {
			return $http.get(urlBase + 'displaySite/portfolioSiteDataMonth/' + month);
		};
		
		dataFactory.getPortfolioSiteEsolMonth = function (month) {
			return $http.get(urlBase + 'displaySite/portfolioSiteEsolMonth/' + month);
		};
		
		dataFactory.getPortfolioSiteDataYear = function (month) {
			return $http.get(urlBase + 'displaySite/portfolioSiteDataYear/' + month);
		};
		
		dataFactory.getPortfolioAllDataYear = function (month) {
			return $http.get(urlBase + 'displaySite/portfolioAllDataYear/' + month);
		};
		
		dataFactory.getPortfolioAvailability = function (month) {
			return $http.get(urlBase + 'displaySite/portfolioAvailability/' + month);
		};

		dataFactory.portfolioAllSiteDataYear = function (month) {
			return $http.get(urlBase + 'displaySite/portfolioAllSiteDataYear/' + month);
		};
		
		dataFactory.getAllSiteCoords = function () {
			return $http.get(urlBase + 'displaySite/allSiteCoords');
		};
		
		dataFactory.dailyProductionReport = function(date) {
			return $http.get(urlBase + 'reports/dailyProductionReport/' + date);
		};

		dataFactory.getInverterData = function (id) {
			return $http.get(urlBase + 'reports/inverterGeneration/' + id);
		};
		
		return dataFactory;
	}])

;
