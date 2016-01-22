angular.module('monthReport', [
    'ui.router',
    'ngAnimate',
    'listSites',
    'apiFactory'
])

    .constant('_', window._)


    .controller('monthReportCtrl', ['$scope', '$stateParams', '$http', '$log', '$state', 'dataFactory', '$filter', function ($scope, $stateParams, $http, $log, $state, dataFactory, $filter) {

        var SP = $stateParams.siteResult;
        var month = moment().format('YYYY-MM') 
        if ($stateParams.month){
            month = $stateParams.month;
        }
        $scope.month = moment(month).format('MMMM YYYY');
        var chartDate = [];
        var sumChartDate = [];
        
        $scope.convertDateMonth = function (date) {
            return $filter('date')(date, 'yyyy-MM')
        }
        
        var highChartsData = {
            name: "Export",
            data: [],
            yAxis: 0
        };
        
        var highChartsPredictData = {
            name: "Predicted",
            data: [],
            color: '#FBA11B',
            yAxis: 0
        };
        
        var highChartsSumData = {
            name: "Sum",
            data: [],
            color: '#4CAF50',
            yAxis: 0
        };

        getMonthGeneration(SP, month);
        if (month == "") {
            month = "2015-12";
        }
        function getMonthGeneration(SP, month) {
            dataFactory.getMonthGeneration(SP, month)
                .success(function (res) {
                    angular.forEach(res, function (res) {
                        highChartsData.data.push(res.generation);
                        chartDate.push(moment(res.date).format("MMM Do"));
                    })
                });
        }
        
        // siteMonthSumGeneration(SP);
        // function siteMonthSumGeneration(SP) {
        //     dataFactory.siteMonthSumGeneration(SP)
        //         .success(function (res) {
        //             $scope.sumTest = res;
        //             var groupedByDateData = _.groupBy(res, function(date) {
        //                 return date.date.substring(0,7);
        //                 });
        //             var aggregateByDate = _.map(groupedByDateData, function(generationObject, month) {
        //                 return {
        //                     month: month,
        //                     generation: _.reduce(generationObject, function(m,x) {
        //                         return m + x.sum;
        //                     }, 0)
        //                 };
        //             });
        //             angular.forEach(aggregateByDate, function (aggregateByDate) {
        //                 highChartsSumData.data.push(aggregateByDate.generation);
        //                 sumChartDate.push(moment(aggregateByDate.month).format("MMM YY"));
        //             })
        //         });
        // }
        
        siteMonthIncidents(SP);
        function siteMonthIncidents(SP) {
            dataFactory.siteMonthIncidents(SP)
                .success(function (res) {
                    $scope.closedMonthIncidents = $filter('filter')(res, {status:"Closed"});
                    $scope.openMonthIncidents = $filter('filter')(res, {status:"Open"});
                });
        }
        
        siteMonthSumGeneration(SP);
        function siteMonthSumGeneration(SP) {
            dataFactory.siteMonthSumGeneration(SP)
                .success(function (res) {
                    $scope.sumTest = res;
                    angular.forEach(res, function (res) {
                        highChartsSumData.data.push(res.sum);
                        highChartsPredictData.data.push(res.predicted);
                        sumChartDate.push(moment(res.date).format("MMM YY"));
                    })
                });
        }
        
        //  Chart for export generation
        $scope.chartMonthGeneration = {
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
                text: 'Daily Sum'
            },
            xAxis: {categories: chartDate,
                title: {
                    text: "Day of the month"
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Generation (kWh)'
                }
            },
            series: [],
            loading: false
        };
        
         //  Chart for export generation
        $scope.chartMonthSumGeneration = {
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
                text: 'Monthly Sum'
            },
            xAxis: {categories: sumChartDate,
                title: {
                    text: "Month / Year"
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Generation (kWh)'
                }
            },
            series: [],
            loading: false
        };

        getMonthReport(SP);
        function getMonthReport(SP) {
            dataFactory.getMonthReport(SP)
                .success(function (res) {
                    $scope.monthReport = res[0];
                });
        }



        $scope.chartMonthGeneration.series.push(highChartsData);
        $scope.chartMonthSumGeneration.series.push(highChartsPredictData);
        $scope.chartMonthSumGeneration.series.push(highChartsSumData);
        
        $scope.highChartsPredictData = highChartsPredictData;

    }]);
