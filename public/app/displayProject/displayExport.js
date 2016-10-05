angular.module('displayExport', [
	'ui.router',
	'listSites',
	'apiFactory'
])

	.controller('ExportCtrl', ['$scope', '$stateParams', '$http', '$log', '$state', 'dataFactory', function ($scope, $stateParams, $http, $log, $state, dataFactory) {

		var SP = $stateParams.siteResult;
		// arrays storing data to be pushed to the highchart chart
		var highChartsData = {
			name: "Export",
			data: [],
			yAxis: 0
		};
		var highChartsPyro = {
			name: "Pyro mean",
			data: [],
			yAxis: 1
		};

		//  Chart for export  generation and pyro
		$scope.chartExport = {
			options: {
				chart: {
					zoomType: 'x'
				},
				rangeSelector: {
					allButtonsEnabled: false,
					enabled: false
				},
				navigator: {
					enabled: true
				}
			},
			yAxis: [{
				title: {
					text: 'Export'
				},
				opposite: false,
				lineWidth: 2,
				min: 0
			}, {
					title: {
						text: 'Pyro'
					},
					opposite: true,
					min: 0
				}],
			series: [],
			title: {
				text: 'Generation at export'
			},
			useHighStocks: true
		};

		getSiteSummary(SP); //gets summary array of site
		function getSiteSummary(SP) {
			dataFactory.getSiteSummary(SP)
				.success(function (res) {
					$scope.currentDisplaySite = res;
				});
		}

		getChartData(SP);
		function getChartData(SP) { //function to query data for chart and insert in to arrays
			dataFactory.chartData(SP)
				.success(function (res) {
					angular.forEach(res, function (res) {
						highChartsPyro.data.push([res.timeU, res.avgPyro]);
						highChartsData.data.push([res.timeU, res.generation]);
					});
				});
		}

		$scope.chartExport.series.push(highChartsData); //push data to chart
		$scope.chartExport.series.push(highChartsPyro);


	}]);
