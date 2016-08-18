angular.module('displayInverter', [
	'ui.router',
	'listSites',
	'apiFactory'
])

	.controller('InverterCtrl', ['$scope', '$stateParams', '$http', '$log', '$state', 'dataFactory', function ($scope, $stateParams, $http, $log, $state, dataFactory) {

		var SP = $stateParams.siteResult;
		$scope.site = SP;

	}]);