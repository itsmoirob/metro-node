angular.module('displayInverter', [
	'ui.router',
	'listSites',
	'apiFactory'
])

	.controller('InverterCtrl', ['$scope', '$stateParams', '$http', '$log', '$state', 'dataFactory', function ($scope, $stateParams, $http, $log, $state, dataFactory) {

		var SP = $stateParams.siteResult;
		var transformer = 1 || $stateParams.transformer;
		$scope.site = SP;
		$scope.transformer = transformer;

		getInverterData(SP);
		function getInverterData(SP) {
			dataFactory.getInverterData(SP)
				.success(function (res) {
					$scope.inverterData = res;
				});
		}

		$scope.substringAng = function substringAng(word) {
			if(word.length == 10) {
				return word.substr(9,1);
			} else {
				return word.substr(9,2);
			}
		}

	}]);