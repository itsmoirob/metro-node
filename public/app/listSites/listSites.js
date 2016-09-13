var myApp = angular.module('listSites', [
	'ui.router',
	'ngAnimate',
	'apiFactory'
],
	function config($httpProvider) {
		$httpProvider.interceptors.push('AuthInterceptor');
	})

myApp.constant('API_URL', 'http://localhost:3000')

myApp.controller('ListCtrl', ['$scope', '$stateParams', '$http', '$log', 'dataFactory', 'UserFactory', function ($scope, $stateParams, $http, $log, dataFactory, UserFactory) {

	getIntroSites();
	function getIntroSites() {
		dataFactory.getPickUp()
			.success(function (res) {
				$scope.introSites = res;
			});
	}

	var SP = $stateParams.siteResult;
	$scope.SP = SP;

	$scope.isActive = function (route) {
		return route === $location.path();
	}

}])
	;
