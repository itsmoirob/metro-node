const app = angular.module('greencoatApp', ['greencoatFactory']);

app.controller('greencoatCtrl', ['$scope', 'dataFactory', '$filter', function ($scope, dataFactory, $filter) {
	$scope.test = 'greencoat Angular';

	let yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	$scope.date = yesterday;

	getPickUp();
	function getPickUp() {
		dataFactory.getPickUp()
			.success(function (res) {
				$scope.sitesInfo = res.filter((site) => site.id >10);
				var totalMWp = 0;
				angular.forEach(res, function (res) {
					if(res.id>10){
						totalMWp = totalMWp + res.tic_mwp;
					}
				});
				$scope.totalMWp = totalMWp;
			});
	}

	$scope.getDailyProductionReport = (date) => {
		date = $filter('date')(date, "yyyy-MM-dd");
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
	}
	$scope.getDailyProductionReport($scope.date); // call function to access date depending on parameter date, or defaults to yesteday

}]);

app.controller('greencoatSiteCtrl', ['$scope', 'dataFactory', '$filter', function ($scope, dataFactory, $filter) {
	let siteArray = {
		'wilton': 11,
		'bedborough': 12,
		'merston': 13,
		'ashby': 14,
		'fannyHouse': 15,
		'eveley': 16
	};
	let SP = siteArray[local_data.site];
	$scope.test = chart_data.data[2];

	let sliceArr = [];
	let sliceDate = [];
	let slicePyro = [];

	getReport(SP);

	function getReport(SP) {
		dataFactory.getMKReport(SP)
			.success(function (res) {
				$scope.MKReport = res;
				for (var index = 1; index < 61; index++) {
					sliceArr.push([res[index].generation / 1000]);
					sliceDate.push($filter('date')(res[index].date, "dd MMM"));
					slicePyro.push([res[index].esol]);
				}
				sliceArr = sliceArr.reverse();
				slicePyro = slicePyro.reverse();
				sliceDate = sliceDate.reverse();
			});
	}


	$scope.reverse = true;
	$scope.order = function () {
		$scope.reverse = !$scope.reverse;
	};

	$scope.chartExport = {
		credits: {
			enabled: false
		},
		options: {
			tooltip: {
				headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
				pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
					'<td style="padding:0"><b>{point.y:.2f}</b></td></tr>',
				footerFormat: '</table>',
				valueSuffix: ' MWh',
				shared: true,
				useHTML: true
			},
		},
		title: {
			text: null
		},
		xAxis: {
			categories: sliceDate,
			title: {
				text: null
			}
		},
		yAxis: [{
			min: 0,
			title: {
				text: 'Export MWh'
			}
		}, {
			min: 0,
			title: {
				text: 'ESOL Wh2'
			},
			opposite: true
		}],
		series: [{
			name: 'Export',
			data: sliceArr,
			type: 'column'
		}, {
			name: 'ESOL',
			data: slicePyro,
			yAxis: 1,
			type: 'spline'
		}],
		loading: false
	};

}]);