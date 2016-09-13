angular.module('displayAllReport', [
	'ui.router',
	'ngAnimate',
	'listSites',
	'apiFactory'
])

	.controller('ReportCtrl', ['$scope', '$stateParams', '$http', '$log', '$state', 'dataFactory', '$filter', function ($scope, $stateParams, $http, $log, $state, dataFactory, $filter) {

		var date = $stateParams.date || ''; //get paramater date, or set to blank for API calls

		if (!$stateParams.date) { // change disaplyDate, if no date selected disaplyDate sets to yesterday 
			$scope.displayDate = moment().subtract(1, 'days').format('DD/MM/YYYY');
		} else {
			$scope.displayDate = moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY');
		}

		getDailyProductionReport(date); // call function to access date depending on parameter date, or defaults to yesteday
		function getDailyProductionReport(date) {
			dataFactory.dailyProductionReport(date)
				.success(function (res) {
					var totalDailyExport = 0;
					var totalGroupExport = 0;
					var expectedExport = 0;
					var totalDailyEsol = 0;
					var totalGroupEsol = 0;

					var newObj = _.reduce(res[0], function (accumulator, value, key) {
						var group = key.substring(0, 4);
						var property = key.substring(5);

						if (key.substring(5) === 'Day') {
							totalDailyExport = totalDailyExport + value;
						}
						if (key.substring(5) === 'Group') {
							totalGroupExport = totalGroupExport + value;
						}
						if (key.substring(5) === 'PredictDay') {
							expectedExport = expectedExport + value;
						}
						if (key.substring(5) === 'DailyEsol') {
							totalDailyEsol = totalDailyEsol + value;
						}
						if (key.substring(5) === 'GroupEsol') {
							totalGroupEsol = totalGroupEsol + value;
						}

						if (!accumulator[group]) accumulator[group] = {};
						if (!accumulator[group].site) accumulator[group].site = group;
						accumulator[group][property] = value;

						return accumulator;
					}, {});

					$scope.dailyProductionReport = newObj;
					$scope.totalDailyExport = totalDailyExport;
					$scope.totalGroupExport = totalGroupExport;
					$scope.expectedExport = expectedExport;
					$scope.totalDailyEsol = totalDailyEsol;
					$scope.totalGroupEsol = totalGroupEsol;

				});
		};

		getPickUp(); 
		function getPickUp() {
			dataFactory.getPickUp()
				.success(function (res) {
					$scope.sitesInfo = res;
					var totalMWp = 0;
					angular.forEach(res, function (res) {
						totalMWp = totalMWp + res.tic_mwp;
					});
					$scope.totalMWp = totalMWp;
				})
		};

		$scope.convertDate = function (date) { //date converter, to convert javascript date to mysql date
			return $filter('date')(date, 'yyyy-MM-dd')
		}
	}]);
