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

        var sites = [1, 2, 3, 4, 5, 11];
        var nameGrouping = [];
        $scope.month = month;

        var portfolioSiteInfo = [];
        var portfolioSiteDataMonth = [];

        var monthGenerationActual = {
            name: "Actual generation",
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
            yAxis: 0,
        };
        
        var monthGenerationPredict = {
            name: "Predicted generation",
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
            name: "Actual insolation",
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
            name: "Predicted insolation",
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
            name: "Predicted generation",
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
            name: "Actual generation",
            type: 'column',
            data: [],
            color: '#FBA11B',
            yAxis: 0
        };
        
        var yearGenerationAllPredict = {
            name: "Predicted generation",
            type: 'column',
            data: [],
            yAxis: 0
        };
        
        var monthAvailability = {
            name: "Inverter availability",
            type: 'line',
            data: [],
            yAxis: 1
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
                    var portfolio = { "name": "Portfolio", "location": "", "tic_mwp": res[0].sumTic };
                    portfolioSiteInfo[0].push(portfolio);
                });
        }

        getPortfolioSiteDataMonth(month);
        function getPortfolioSiteDataMonth(month) {
            dataFactory.getPortfolioSiteDataMonth(month)
                .success(function (res) {
                    portfolioSiteDataMonth.push(res[0]);
                    var actualGrouping = sites.map(function (i) {
                        return "aPS" + i;
                    });
                    var predictGrouping = sites.map(function (i) {
                        return "pPS" + i;
                    });
                    var aPRGrouping = sites.map(function (i) {
                        return "aPR" + i;
                    });
                    var pPRGrouping = sites.map(function (i) {
                        return "pPR" + i;
                    });
                    sites.map(function (i) {
                        nameGrouping.push("PS" + i);
                    });
                    
                    angular.forEach(actualGrouping, function (value, key) {
                        monthGenerationActual.data.push(res[0][value] / 1000);
                    });
                    
                    angular.forEach(predictGrouping, function (value, key) {
                        monthGenerationPredict.data.push(res[0][value] / 1000);
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
                    var actualGrouping = sites.map(function (i) {
                        return "aPS" + i;
                    });
                    var predictGrouping = sites.map(function (i) {
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
                    var actualGrouping = sites.map(function (i) {
                        return "ePS" + i;
                    });
                    var predictGrouping = sites.map(function (i) {
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
                    angular.forEach(res, function (res) {
                        chartDate.push(moment(res.date).format("MMM-YY"));
                        yearGenerationAllActual.data.push(res.actual / 1000);
                        yearGenerationAllPredict.data.push(res.predicted / 1000);
                    });
                });
        }
        
        getPortfolioAvailability(month);
        function getPortfolioAvailability(month) {
            dataFactory.getPortfolioAvailability(month)
                .success(function (res) {
                    var availabilityGrouping = sites.map(function (i) {
                        return 'PS' + i + '_Over0';
                    });
                    
                    angular.forEach(availabilityGrouping, function (value, key) {
                        monthAvailability.data.push(res[0][value] * 100);
                    });
                })
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
                text: 'Monthly generation - ' + titleMonth
            },
            xAxis: {categories: nameGrouping,
                title: {
                    text: null
                }
            },
            yAxis: [{
               title: {
                   text: 'Generation MWh'
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
            xAxis: {categories: nameGrouping,
                title: {
                    text: null
                }
            },
            yAxis: [{
               title: {
                   text: 'Comparison %'
               },
               opposite: false,
               lineWidth: 2,
               min: 0,
               max: 100
           },{
               title: {
                   text: 'Availability %'
               },
               opposite: true,
               lineWidth: 2,
               min: 40,
               max: 100
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
                text: 'Monthly insolation - ' + titleMonth
            },
            xAxis: {categories: nameGrouping,
                title: {
                    text: null
                }
            },
            yAxis: [{
               title: {
                   text: 'Insolation Wh/m2'
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
                text: 'Year generation - ' + titleMonth
            },
            xAxis: {categories: nameGrouping,
                title: {
                    text: null
                }
            },
            yAxis: [{
               title: {
                   text: 'Generation MWh'
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
                text: 'Year generation - ' + titleMonth
            },
            xAxis: {categories: chartDate,
                title: {
                    text: null
                }
            },
            yAxis: [{
               title: {
                   text: 'Generation MWh'
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
        
        $scope.chartMonthGeneration.series.push(monthGenerationActual);
        $scope.chartMonthGeneration.series.push(monthGenerationPredict);
        $scope.chartMonthPR.series.push(monthActualPR);
        $scope.chartMonthPR.series.push(monthPredictPR);
        $scope.chartMonthPR.series.push(monthAvailability);
        $scope.chartMonthEsol.series.push(monthActualEsol);
        $scope.chartMonthEsol.series.push(monthPredictEsol);
        $scope.chartYearGeneration.series.push(yearGenerationActual);
        $scope.chartYearGeneration.series.push(yearGenerationPredict);
        $scope.chartYearAllGeneration.series.push(yearGenerationAllActual);
        $scope.chartYearAllGeneration.series.push(yearGenerationAllPredict);
        


    }]);

