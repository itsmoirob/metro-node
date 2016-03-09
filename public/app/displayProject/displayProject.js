angular.module('displayProject', [
  'ui.router',
  'ngAnimate',
  'listSites',
  'uiGmapgoogle-maps',
  'highcharts-ng',
  'apiFactory'
])

.controller('DisplayCtrl', ['$scope', '$stateParams', '$http', '$log', '$state','dataFactory', function($scope,$stateParams,$http,$log,$state,dataFactory){

  var SP = $stateParams.siteResult;

  getSiteSummary(SP); //gets summary array of site
  function getSiteSummary(SP) {
	dataFactory.getSiteSummary(SP)
	.success(function(res){
	  $scope.currentDisplaySite = res;
	  $http({
		method: 'GET',
		url: 'http://api.openweathermap.org/data/2.5/forecast/daily?&units=metric&lat='+res[0].latitude+'&lon='+res[0].longitude+'&cnt=3&APPID=ede052db245fa42874e3cc8513991c6e'
	  }).then(function(response) {
		$scope.forecast = response;
	  });
	  $scope.map = { center: { latitude: res[0].latitude, longitude: res[0].longitude }, zoom: 8 }; //sets up gmaps
	  $scope.marker = { //sets up pin for gmaps
		id: $stateParams.siteResult,
		coords: {
		  latitude: res[0].latitude,
		  longitude: res[0].longitude
		},
		options: { draggable: true }
	  };
	});
  }

  getReport(SP);
  function getReport(SP) {
	dataFactory.getMKReport(SP)
	.success(function(res){
	  $scope.MKReport = res;
	});
  }
}]);
