angular.module('portfolioReport', [
    'ui.router',
    'ngAnimate',
    'listSites',
    'apiFactory'
])

    .constant('_', window._)


    .controller('PortfolioReportCtrl', ['$scope', '$stateParams', '$http', '$log', '$state', 'dataFactory', '$filter', function ($scope, $stateParams, $http, $log, $state, dataFactory, $filter) {

        getIntroSites();
        function getIntroSites() {
            dataFactory.getPickUp()
                .success(function (res) {
                    $scope.introSites = res;
                });
        }




    }]);
