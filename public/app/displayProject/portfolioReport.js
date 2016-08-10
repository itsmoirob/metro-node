angular.module('portfolioReport', [
	'ui.router',
	'ngAnimate',
	'listSites',
	'apiFactory'
])

	.constant('_', window._)


	.controller('PortfolioReportCtrl', ['$scope', '$stateParams', '$http', '$log', '$state', 'dataFactory', '$filter', function ($scope, $stateParams, $http, $log, $state, dataFactory, $filter) {

		var chartDate = [];
		var month = moment().format('YYYY-MM');
		var titleMonth = moment().format('MMMM');
		if ($stateParams.month) {
			month = $stateParams.month;
			titleMonth = moment($stateParams.month, 'YYYY-MM').format('MMMM');
		}

		var allSites = [1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 16];
		var nameGrouping = [];
		$scope.month = month;
		var portfolioSiteInfo = [];
		var portfolioSiteDataMonth = [];
		var allSumData = [];

		var monthActualPR = {
			name: "Actual PR",
			data: [],
			color: '#FBA11B',
			dataLabels: {
				enabled: true,
				rotation: -90,
				color: '#FFFFFF',
				align: 'right',
				format: '{point.y:.1f}', // one decimal
				// y: -50, // 10 pixels down from the top
				style: {
					fontSize: '13px',
					fontFamily: 'Verdana, sans-serif'
				}
			},
			yAxis: 0
		};

		var monthPredictPR = {
			name: "Predicted PR",
			data: [],
			dataLabels: {
				enabled: true,
				rotation: -90,
				color: '#FFFFFF',
				align: 'right',
				format: '{point.y:.1f}', // one decimal
				// y: -50, // 10 pixels down from the top
				style: {
					fontSize: '13px',
					fontFamily: 'Verdana, sans-serif'
				}
			},
			yAxis: 0
		};

		var monthActualEsol = {
			name: "Actual irradiation",
			type: 'column',
			data: [],
			dataLabels: {
				enabled: true,
				rotation: -90,
				color: '#FFFFFF',
				align: 'right',
				format: '{point.y:.1f}', // one decimal
				// y: -50, // 10 pixels down from the top
				style: {
					fontSize: '13px',
					fontFamily: 'Verdana, sans-serif'
				}
			},
			color: '#FBA11B',
			yAxis: 0
		};

		var monthPredictEsol = {
			name: "Predicted irradiation",
			type: 'column',
			data: [],
			dataLabels: {
				enabled: true,
				rotation: -90,
				color: '#FFFFFF',
				align: 'right',
				format: '{point.y:.1f}', // one decimal
				// y: -50, // 10 pixels down from the top
				style: {
					fontSize: '13px',
					fontFamily: 'Verdana, sans-serif'
				}
			},
			yAxis: 0
		};

		var yearGenerationActual = {
			name: "Actual generation",
			type: 'column',
			data: [],
			dataLabels: {
				enabled: true,
				rotation: -90,
				color: '#FFFFFF',
				align: 'right',
				format: '{point.y:.1f}', // one decimal
				y: -50, // 10 pixels down from the top
				style: {
					fontSize: '13px',
					fontFamily: 'Verdana, sans-serif'
				}
			},
			color: '#FBA11B',
			yAxis: 0
		};

		var yearGenerationPredict = {
			name: "Predicted export",
			type: 'column',
			data: [],
			dataLabels: {
				enabled: true,
				rotation: -90,
				color: '#FFFFFF',
				align: 'right',
				format: '{point.y:.1f}', // one decimal
				y: -50, // 10 pixels down from the top
				style: {
					fontSize: '13px',
					fontFamily: 'Verdana, sans-serif'
				}
			},
			yAxis: 0
		};

		var yearGenerationAllActual = {
			name: "Actual export",
			type: 'column',
			data: [],
			color: '#FBA11B',
			yAxis: 0
		};

		var yearGenerationAllPredict = {
			name: "Predicted export",
			type: 'column',
			data: [],
			yAxis: 0
		};

		var cumulativeGenerationAllActual = {
			name: "Actual export",
			type: 'column',
			data: [],
			color: '#FBA11B',
			yAxis: 0
		};

		var cumulativeGenerationAllPredict = {
			name: "Predicted export",
			type: 'column',
			data: [],
			yAxis: 0
		};

		getPortfolioSiteInfo();
		function getPortfolioSiteInfo() {
			dataFactory.getPortfolioSiteInfo()
				.success(function (res) {
					portfolioSiteInfo.push(res);
				});
		}

		getPortfolioAllSiteMwp();
		function getPortfolioAllSiteMwp() {
			dataFactory.getPortfolioAllSiteMwp()
				.success(function (res) {
					var portfolio = { "id": "All", "name": "Portfolio", "location": "", "tic_mwp": res[0].sumTic };
					portfolioSiteInfo[0].push(portfolio);
				});
		}

		getPortfolioSiteDataMonth(month);
		function getPortfolioSiteDataMonth(month) {
			dataFactory.getPortfolioSiteDataMonth(month)
				.success(function (res) {
					$scope.portfolioActExpPredExpActPrPredPr = res;
					portfolioSiteDataMonth.push(res[0]);
					var actualGrouping = allSites.map(function (i) {
						return "aPS" + i;
					});
					var predictGrouping = allSites.map(function (i) {
						return "pPS" + i;
					});
					var aPRGrouping = allSites.map(function (i) {
						return "aPR" + i;
					});
					var pPRGrouping = allSites.map(function (i) {
						return "pPR" + i;
					});
					allSites.map(function (i) {
						nameGrouping.push("PS" + i);
					});

					angular.forEach(aPRGrouping, function (value, key) {
						monthActualPR.data.push(res[0][value] * 100);
					});

					angular.forEach(pPRGrouping, function (value, key) {
						monthPredictPR.data.push(res[0][value] * 100);
					});

				})
		}

		getPortfolioSiteEsolMonth(month);
		function getPortfolioSiteEsolMonth(month) {
			dataFactory.getPortfolioSiteEsolMonth(month)
				.success(function (res) {
					$scope.portfolioEsol = res;
					var actualGrouping = allSites.map(function (i) {
						return "aPS" + i;
					});
					var predictGrouping = allSites.map(function (i) {
						return "pPS" + i;
					});
					angular.forEach(actualGrouping, function (value, key) {
						monthActualEsol.data.push(res[0][value]);
					});
					angular.forEach(predictGrouping, function (value, key) {
						monthPredictEsol.data.push(res[0][value]);
					});

				});
		}

		getPortfolioSiteDataYear(month);
		function getPortfolioSiteDataYear(month) {
			dataFactory.getPortfolioSiteDataYear(month)
				.success(function (res) {
					$scope.testnow = res;
					var actualGrouping = allSites.map(function (i) {
						return "ePS" + i;
					});
					var predictGrouping = allSites.map(function (i) {
						return "pPS" + i;
					});

					angular.forEach(actualGrouping, function (value, key) {
						yearGenerationActual.data.push(res[0][value] / 1000);
					});

					angular.forEach(predictGrouping, function (value, key) {
						yearGenerationPredict.data.push(res[0][value] / 1000);
					});

				});
		}

		getPortfolioAllDataYear(month);
		function getPortfolioAllDataYear(month) {
			dataFactory.getPortfolioAllDataYear(month)
				.success(function (res) {
					$scope.getPortfolioAllDataYear = res;
					angular.forEach(res, function (res) {
						chartDate.push(moment(res.date).format("MMM-YY"));
						yearGenerationAllActual.data.push(res.actual / 1000);
						yearGenerationAllPredict.data.push(res.predicted / 1000);
					});
				});
		}

		getPortfolioAllSiteDataYear(month);
		function getPortfolioAllSiteDataYear(month) {
			dataFactory.portfolioAllSiteDataYear(month)
				.success(function (res) {

					$scope.getPortfolioAllSiteDataYear = res;


					var actualGrouping = allSites.map(function (i) {
						return "agPS" + i;
					});
					var predictGrouping = allSites.map(function (i) {
						return "pgPS" + i;
					});
					$scope.predictGrouping = predictGrouping;

					actualGrouping.forEach(function (deviceName) {

						var dataForOneDevice = res.map(function (item) {
							return item[deviceName] / 1000;
						});

						allSumData.push({ name: deviceName.substring(2, deviceName.length), data: dataForOneDevice, stack: 'Actual' });
					});

					predictGrouping.forEach(function (deviceName) {

						var dataForOneDevice = res.map(function (item) {
							return item[deviceName] / 1000;
						});

						allSumData.push({ name: deviceName.substring(2, deviceName.length), data: dataForOneDevice, stack: 'Predict', showInLegend: false });
					});


				});
		}
		$scope.allSumData = allSumData;

		getPortfolioAvailability(month);
		function getPortfolioAvailability(month) {
			dataFactory.getPortfolioAvailability(month)
				.success(function (res) {
					$scope.availabilty = res;
				})
		}

		siteMonthSumGeneration(month);
		function siteMonthSumGeneration(month) {
			dataFactory.getPortfolioAllDataYear(month)
				.success(function (res) {
					var modifiedArray = [];
					for (var index = 0; index < res.length; index++) {
						if (index === 0) {
							modifiedArray.push({
								date: res[index].date,
								actual: res[index].actual,
								predicted: res[index].predicted
							});
						} else {
							modifiedArray.push({
								date: res[index].date,
								actual: res[index].actual + modifiedArray[index - 1].actual,
								predicted: res[index].predicted + modifiedArray[index - 1].predicted
							});
						}
					}


					$scope.modifiedArray = modifiedArray;
					$scope.test1 = modifiedArray[0].date;

					angular.forEach(modifiedArray, function (modifiedArray) {
						cumulativeGenerationAllActual.data.push(modifiedArray.actual);
						cumulativeGenerationAllPredict.data.push(modifiedArray.predicted);
					})

				});
		}


		$scope.portfolioSiteInfo = portfolioSiteInfo;
		$scope.portfolioSiteDataMonth = portfolioSiteDataMonth;

		$scope.convertDateMonth = function (date) {
			return $filter('date')(date, 'yyyy-MM')
		}

		//  Chart for export generation
		$scope.chartMonthGeneration = {
			credits: {
				enabled: false
			},
			title: {
				text: 'Monthly export - ' + titleMonth
			},
			xAxis: {
				categories: chartDate,
				title: {
					text: null
				}
			},

			yAxis: {
				min: 0,
				title: {
					text: 'Export MWh'
				}
				// stackLabels: {
				// 	rotation: -90,
				// 	verticalAlign: 'top',
				// 	enabled: true,
				// 	formatter: function () {
				// 		return this.stack.substring(0, 1) + '; ' + Highcharts.numberFormat(this.total, 1, ".", ",");
				// 	},
				// 	style: {
				// 		fontWeight: 'bold',
				// 		color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
				// 	}
				// }
			},
			options: {
				chart: {
					type: 'column'
				},
				legend: {
					align: 'right',
					x: -70,
					verticalAlign: 'top',
					y: 20,
					floating: true,
					backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
					borderColor: '#CCC',
					borderWidth: 1,
					shadow: true,
					labelFormatter: function () {
						return '<div style="text-align: left; width:130px;float:left;">' + this.name + '</div>';
					}
				},
				tooltip: {
					formatter: function () {
						return '<b>' + this.x + '</b><br/>' +
							this.series.name + ': ' + Highcharts.numberFormat(this.y, 1) + '<br/>' +
							'Total: ' + Highcharts.numberFormat(this.point.stackTotal, 1);
					}
				},
				plotOptions: {
					column: {
						stacking: 'normal',
					},
					series: {
						events: {
							legendItemClick: function (event) {
								event.preventDefault();
								var name = this.name;
								$(this.chart.series).each(function (i, e) {
									if (e.name === name) {
										e.visible ? e.hide() : e.show();
									}
								})
							}
						}
					}
				}
			},

			series: allSumData
		};

		//  Chart for export generation
		$scope.chartMonthPR = {
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
				text: 'Monthly PR - ' + titleMonth
			},
			xAxis: {
				categories: nameGrouping,
				title: {
					text: null
				}
			},
			yAxis: [{
				title: {
					text: 'Performance Ratio %'
				},
				opposite: false,
				lineWidth: 2,
				min: 0,
				max: 100
			}
				//    ,{
				//        title: {
				//            text: 'Availability %'
				//        },
				//        opposite: true,
				//        lineWidth: 2,
				//        min: 40,
				//        max: 100
				//    }
			],
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
		$scope.chartMonthEsol = {
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
					valueSuffix: ' MWh',
					shared: true,
					useHTML: true
				},
			},
			title: {
				text: 'Monthly irradiation - ' + titleMonth
			},
			xAxis: {
				categories: nameGrouping,
				title: {
					text: null
				}
			},
			yAxis: [{
				title: {
					text: 'Irradiation kWh/m2'
				},
				opposite: false,
				lineWidth: 2,
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
		$scope.chartYearGeneration = {
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
					valueSuffix: ' MWh',
					shared: true,
					useHTML: true
				},
			},
			title: {
				text: 'Year export - ' + titleMonth
			},
			xAxis: {
				categories: nameGrouping,
				title: {
					text: null
				}
			},
			yAxis: [{
				title: {
					text: 'Export MWh'
				},
				opposite: false,
				lineWidth: 2,
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
		$scope.chartYearAllGeneration = {
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
				text: 'Monthly export all sites for year to ' + titleMonth
			},
			xAxis: {
				categories: chartDate,
				title: {
					text: null
				}
			},
			yAxis: [{
				title: {
					text: 'Export MWh'
				},
				opposite: false,
				lineWidth: 2,
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
		$scope.chartCumulativeAllGeneration = {
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
				text: 'Cumulative export all sites for year to ' + titleMonth
			},
			xAxis: {
				categories: chartDate,
				title: {
					text: null
				}
			},
			yAxis: [{
				title: {
					text: 'Export MWh'
				},
				opposite: false,
				lineWidth: 2,
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

		// $scope.chartMonthGeneration.series.push(allSumData);
		// $scope.chartMonthGeneration.series.push(monthGenerationPredict);
		$scope.chartMonthPR.series.push(monthActualPR);
		$scope.chartMonthPR.series.push(monthPredictPR);
		// $scope.chartMonthPR.series.push(monthAvailability);
		$scope.chartMonthEsol.series.push(monthActualEsol);
		$scope.chartMonthEsol.series.push(monthPredictEsol);
		$scope.chartYearGeneration.series.push(yearGenerationActual);
		$scope.chartYearGeneration.series.push(yearGenerationPredict);
		$scope.chartYearAllGeneration.series.push(yearGenerationAllActual);
		$scope.chartYearAllGeneration.series.push(yearGenerationAllPredict);
		$scope.chartCumulativeAllGeneration.series.push(cumulativeGenerationAllActual);
		$scope.chartCumulativeAllGeneration.series.push(cumulativeGenerationAllPredict);



	}])

	.directive('varianceValue', function ($timeout) {
		return {
			restrict: 'A',
			link: function (scope, el, attr) {
				$timeout(function () {
					$(el).toggleClass("text-red", parseFloat($(el).text()) < 0);
					$(el).toggleClass("text-green", parseFloat($(el).text()) > 0);
				}, 0);
			},
		}
	})

	;

