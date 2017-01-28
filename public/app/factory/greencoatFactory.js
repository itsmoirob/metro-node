angular.module('greencoatFactory', [])
	.factory('dataFactory', ['$http', function ($http) {
		var urlBase = ('./api/');
		var dataFactory = {};

		dataFactory.getPickUp = () => { //GET all of the basic info for front page
			return $http.get(urlBase + 'pickUp');
		};

		dataFactory.getSiteSummary = (id) => {
			return $http.get(urlBase + 'displaySite/site/' + id);
		};

		dataFactory.getMKReport = (id) => {
			return $http.get('/api/displaySite/report/' + id);
		};

		dataFactory.dailyProductionReport = (date) => {
			return $http.get('/api/reports/dailyProductionReportGC/' + date);
		};
	
		
		return dataFactory;
	}])

;
