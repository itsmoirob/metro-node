angular.module('eveleyOwn', [
	'apiFactory'
])

	.controller('EveleyCtrl', ['$scope', 'dataFactory', function ($scope, dataFactory) {

		getReport(16);
		function getReport(SP) {
			dataFactory.getMKReport(SP)
				.success(function (res) {
					$scope.MKReport = res;
				});
		}

		$scope.reverse = true;
		$scope.order = function () {
			$scope.reverse = !$scope.reverse;
		};

	}]);
