angular.module('displayReportsIncidents', [
    'ui.router',
    'ngAnimate',
    'listSites',
    'apiFactory'
])

    .constant('_', window._)


    .controller('ReportIncidentsCtrl', ['$scope', '$stateParams', '$http', '$log', '$state', 'dataFactory', '$filter', function ($scope, $stateParams, $http, $log, $state, dataFactory, $filter) {

        var SP = $stateParams.siteResult;
        var startDate = $stateParams.startDate;
        var endDate = $stateParams.endDate;

        $scope.chosenStartDate = $stateParams.startDate;
        $scope.chosenEndDate = $stateParams.endDate;


        getIncidentReportAll();
        function getIncidentReportAll() {
            dataFactory.getIncidentReportAll()
                .success(function (res) {
                    $scope.incidentReportAll = res;
                });
        }

        getIncidentReportSite(SP);
        function getIncidentReportSite(SP) {
            dataFactory.getIncidentReportSite(SP)
                .success(function (res) {
                    $scope.incidentReportSite = res;
                });
        }

        getOpenIncidentSite(SP);
        function getOpenIncidentSite(SP) {
            dataFactory.getOpenIncidentSite(SP)
                .success(function (res) {
                    $scope.openIncidentSite = res;
                });
        }

        getSiteSummary(SP); //gets summary array of site
        function getSiteSummary(SP) {
            dataFactory.getSiteSummary(SP)
                .success(function (res) {
                    $scope.currentDisplaySite = res;
                });
        }

        var arr;
        getAllReports(); //gets summary array of site
        function getAllReports() {
            dataFactory.getAllReports()
                .success(function (res) {

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

        getSelectReports(startDate, endDate); //gets summary array of site
        function getSelectReports(startDate, endDate) {
            dataFactory.getSelectReports(startDate, endDate)
                .success(function (res) {
                    var newObj = _.reduce(res[0], function (accumulator, value, key) {
                        var group = key.substring(0, 4);
                        var property = key.substring(5);
                        if (!accumulator[group]) accumulator[group] = {};
                        if (!accumulator[group].site) accumulator[group].site = group;
                        accumulator[group][property] = value;
                        return accumulator;
                    }, {});
                    $scope.selectReports = newObj;
                });
        }

        $scope.convertDate = function (date) {
            return $filter('date')(date, 'yyyy-MM-dd')
        }

        getIncidentSiteName(SP); //gets summary array of site
        function getIncidentSiteName(SP) {
            dataFactory.getIncidentSiteName(SP)
                .success(function (res) {
                    $scope.incidentSiteName = res;
                });
        }

        getIncidentCategory(SP); //gets summary array of site
        function getIncidentCategory(SP) {
            dataFactory.getIncidentCategory(SP)
                .success(function (res) {
                    $scope.incidentCategory = res;
                });
        }


    }]);
