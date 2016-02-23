angular.module('displayAllReport', [
    'ui.router',
    'ngAnimate',
    'listSites',
    'apiFactory'
])


    .controller('ReportCtrl', ['$scope', '$stateParams', '$http', '$log', '$state', 'dataFactory', '$filter', function ($scope, $stateParams, $http, $log, $state, dataFactory, $filter) {
        
        var startDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
        var endDate = moment().subtract(14, 'days').format('YYYY-MM-DD');
        var titleStartDate = moment().format('YYYY-MM-DD');
        var titleEndDate = moment().format('YYYY-MM-DD');
        if ($stateParams.startDate) {
            startDate = $stateParams.startDate;
            titleStartDate = moment($stateParams.month, 'YYYY-MM-DD').format('YYYY-MM-DD');
        }
        if ($stateParams.endDate) {
            endDate = $stateParams.endDate;
            titleEndDate = moment($stateParams.month, 'YYYY-MM-DD').format('YYYY-MM-DD');
        }
        
        $scope.startDate = startDate;
        $scope.endDate = endDate;
        
        getAllReports(startDate, endDate); //gets summary array of site
        function getAllReports(startDate, endDate) {
            dataFactory.getAllReports(startDate, endDate)
                .success(function (res) {
                    $scope.testReports = res;

                    var newObj = _.reduce(res[0], function (accumulator, value, key) {
                        var group = key.substring(0, 4);
                        var property = key.substring(5);

                        if (!accumulator[group]) accumulator[group] = {};
                        if (!accumulator[group].site) accumulator[group].site = group;
                        accumulator[group][property] = value;
                        return accumulator;
                    }, {});

                    $scope.allReports = newObj;
                });
        }
        
        $scope.convertDate = function (date) {
            return $filter('date')(date, 'yyyy-MM-dd')
        }

    }]);
