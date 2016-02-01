angular.module('portfolioReport', [
    'ui.router',
    'ngAnimate',
    'listSites',
    'apiFactory'
])

    .constant('_', window._)


    .controller('PortfolioReportCtrl', ['$scope', '$stateParams', '$http', '$log', '$state', 'dataFactory', '$filter', function ($scope, $stateParams, $http, $log, $state, dataFactory, $filter) {

        var portfolioSiteInfo = [];
        var portfolioSiteData = [];
        var test;

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
                    var portfolio = { "name": "Portfolio", "location": "England", "tic_mwp": res[0].sumTic };
                    portfolioSiteInfo[0].push(portfolio);
                });
        }

        getPortfolioSiteData();
        function getPortfolioSiteData() {
            dataFactory.getPortfolioSiteData()
                .success(function (res) {
                    portfolioSiteData.push(res);
                    portfolioSiteData[0].push(1);
                    portfolioSiteData.push(1);
                    test = portfolioSiteData[0];
                });
        }

        $scope.portfolioSiteInfo = portfolioSiteInfo;
        $scope.portfolioSiteData = portfolioSiteData;
        $scope.test = test;
        $scope.portfolioSiteDataMonth = $filter('filter')(portfolioSiteData, { date: '2015-01' })[0];

    }]);
