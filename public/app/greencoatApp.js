const app = angular.module('greencoatApp', ['greencoatFactory']);

app.controller('greencoatCtrl', ['$scope', 'dataFactory', function ($scope, dataFactory) {
	$scope.test = 'greencoat Angular';

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