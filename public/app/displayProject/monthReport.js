angular.module('monthReport', [
	'ui.router',
	'ngAnimate',
	'listSites',
	'apiFactory'
])

	.constant('_', window._)


	.controller('monthReportCtrl', ['$scope', '$stateParams', '$http', '$log', '$state', 'dataFactory', '$filter', function ($scope, $stateParams, $http, $log, $state, dataFactory, $filter) {

		var SP = $stateParams.siteResult;
		var month = moment().format('YYYY-MM');
		var titleMonth = moment().format('MMMM');
		if ($stateParams.month) {
			month = $stateParams.month;
			titleMonth = moment($stateParams.month, 'YYYY-MM').format('MMMM');
		}
		$scope.month = moment(month).format('MMMM YYYY');
		var chartDate = [];
		var sumChartDate = [];

		$scope.convertDateMonth = function (date) {
			return $filter('date')(date, 'yyyy-MM');
		};

		var monthGenerationActual = {
			name: "Actual export",
			data: [],
			color: '#FBA11B',
			yAxis: 0
		};

		var monthEsolActual = {
			name: "Actual irradiation",
			data: [],
			// color: '#FBA11B',
			type: "line",
			yAxis: 1
		};

		var monthGenerationPredict = {
			name: "Predicted export",
			type: 'line',
			dashStyle: 'shortdot',
			data: [],
			yAxis: 0
		};

		var monthEsolPredict = {
			name: "Predicted irradiation",
			type: 'line',
			dashStyle: 'longdash',
			data: [],
			yAxis: 1
		};

		var highChartsPredictData = {
			name: "Predicted",
			data: [],
			color: '#4CAF50',
			yAxis: 0
		};

		var highChartsSumData = {
			name: "Actual",
			data: [],
			color: '#FBA11B',
			yAxis: 0
		};

		var highChartsSumActualPR = {
			name: "Actual PR",
			data: [],
			color: '#FBA11B',
			yAxis: 0
		};

		var highChartSumPvsystPR = {
			name: "PVSYST PR",
			data: [],
			// color: '#FBA11B',
			yAxis: 0
		};

		var highChartSumGuaranteePR = {
			name: "Guarantee PR",
			data: [],
			// color: '#FBA11B',
			yAxis: 0
		};

		getMonthGeneration(SP, month);
		if (month === "") {
			month = "2015-12";
		}
		function getMonthGeneration(SP, month) {
			dataFactory.getMonthGeneration(SP, month)
				.success(function (res) {
					angular.forEach(res, function (res) {
						monthGenerationActual.data.push(res.generation);
						monthEsolActual.data.push(res.esol);
						monthGenerationPredict.data.push(res.predictGen);
						monthEsolPredict.data.push(res.predictEsol);
						chartDate.push(moment(res.date).format("Do"));
					});
				});
		}

		siteMonthIncidents(SP, month);
		function siteMonthIncidents(SP, month) {
			dataFactory.siteMonthIncidents(SP, month)
				.success(function (res) {
					$scope.monthIncidents = res;
				});
		}

		siteMonthSumGeneration(SP, month);
		function siteMonthSumGeneration(SP, month) {
			dataFactory.siteMonthSumGeneration(SP, month)
				.success(function (res) {
					angular.forEach(res, function (res) {
						highChartsSumData.data.push(res.sum);
						highChartsPredictData.data.push(res.predicted);
						sumChartDate.push(moment(res.date).format("MMM YY"));
					});
				});
		}

		siteMonthSumPR(SP, month);
		function siteMonthSumPR(SP, month) {
			dataFactory.siteMonthSumPR(SP, month)
				.success(function (res) {
					angular.forEach(res, function (res) {
						highChartsSumActualPR.data.push(res.prActual);
						highChartSumPvsystPR.data.push(res.prPvsyst);
						highChartSumGuaranteePR.data.push(res.prGuarantee);
					});
				});
		}

		//  Chart for export generation
		$scope.chartMonthGeneration = {
			credits: {
				enabled: false
			},
			options: {
				chart: {
					type: 'column'
				},
				tooltip: {
					headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
					pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
					'<td style="padding:0"><b>{point.y:.2f}</b></td></tr>',
					footerFormat: '</table>',
					valueSuffix: ' kWH',
					shared: true,
					useHTML: true
				},
			},
			title: {
				text: titleMonth
			},
			xAxis: {
				categories: chartDate,
				title: {
					text: null
				}
			},
			yAxis: [{
				title: {
					text: 'Export kWh'
				},
				opposite: false,
				lineWidth: 2,
				min: 0
			}, {
					title: {
						text: 'Irradiation kWh/m2'
					},
					opposite: true,
					min: 0
				}],
			legend: {
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'middle',
				borderWidth: 0
			},
			series: [],
			loading: false
		};

		//  Chart for export generation
		$scope.chartMonthSumGeneration = {
			credits: {
				enabled: false
			},
			options: {
				chart: {
					type: 'column'
				},
				tooltip: {
					headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
					pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
					'<td style="padding:0"><b>{point.y:.2f}</b></td></tr>',
					footerFormat: '</table>',
					valueSuffix: ' kWH',
					shared: true,
					useHTML: true
				},
			},
			title: {
				text: null
			},
			xAxis: {
				categories: sumChartDate,
				title: {
					text: null
				}
			},
			yAxis: {
				min: 0,
				title: {
					text: 'Export kWh'
				}
			},
			series: [],
			loading: false
		};

		$scope.chartMonthPR = {
			credits: {
				enabled: false
			},
			options: {
				chart: {
					type: 'line'
				},
				tooltip: {
					headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
					pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
					'<td style="padding:0"><b>{point.y:.2f}</b></td></tr>',
					footerFormat: '</table>',
					valueSuffix: ' kWH',
					shared: true,
					useHTML: true
				},
			},
			title: {
				text: null
			},
			xAxis: {
				categories: sumChartDate,
				title: {
					text: null
				}
			},
			yAxis: [{
				title: {
					text: 'PR %'
				},
				opposite: false,
				lineWidth: 2,
				min: 50
			}],
			legend: {
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'middle',
				borderWidth: 0
			},
			series: [],
			loading: false
		};

		getMonthReport(SP, month);
		function getMonthReport(SP, month) {
			dataFactory.getMonthReport(SP, month)
				.success(function (res) {
					$scope.monthReport = res[0];
				});
		}



		$scope.chartMonthGeneration.series.push(monthGenerationActual);
		$scope.chartMonthGeneration.series.push(monthEsolActual);
		$scope.chartMonthGeneration.series.push(monthGenerationPredict);
		$scope.chartMonthGeneration.series.push(monthEsolPredict);
		$scope.chartMonthSumGeneration.series.push(highChartsPredictData);
		$scope.chartMonthSumGeneration.series.push(highChartsSumData);
		$scope.chartMonthPR.series.push(highChartsSumActualPR);
		$scope.chartMonthPR.series.push(highChartSumPvsystPR);
		$scope.chartMonthPR.series.push(highChartSumGuaranteePR);

		$scope.highChartsPredictData = highChartsPredictData;


	}]);
