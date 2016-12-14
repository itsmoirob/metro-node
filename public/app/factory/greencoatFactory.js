angular.module('greencoatFactory', [])
	.factory('dataFactory', ['$http', function ($http) {
		var urlBase = ('./api/');
		var dataFactory = {};

		dataFactory.getPickUp = function () { //GET all of the basic info for front page
			return $http.get(urlBase + 'pickUp');
		};

		dataFactory.getSiteSummary = function (id) {
			return $http.get(urlBase + 'displaySite/site/' + id);
		};

		dataFactory.getMKReport = function (id) {
			return $http.get('/api/displaySite/report/' + id);
		};
	
		
		return dataFactory;
	}])

;
