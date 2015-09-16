angular.module('displayExport', [
  'ui.router',
  'listSites',
  'apiFactory'
])

.controller('ExportCtrl', ['$scope', '$stateParams', '$http', '$log', '$state','dataFactory', function($scope,$stateParams,$http,$log,$state,dataFactory){

  var SP = $stateParams.siteResult;
  var highChartsData = {
    data : []
  };

  getSiteExportGeneration(SP);
  function getSiteExportGeneration(SP){
    dataFactory.getSiteExportGeneration(SP)
    .success(function(res){
      var display = []; //prepare to set data up to use in highcharts-ng
      angular.forEach(res, function(res) {
        highChartsData.data.push([res.timeU,res.generation]);
      });

      var siteExportGeneration = highChartsData;
      $scope.siteExportGeneration = highChartsData;
      //  Chart for export generation
      $scope.chartExport = {
        options: {
          chart: {
            zoomType: 'x'
          },
          rangeSelector: {
            enabled: true
          },
          navigator: {
            enabled: true
          }
        },
        series: [],
        title: {
          text: 'Generation at export'
        },
        useHighStocks: true
      };

      $scope.chartExport.series.push(highChartsData);
    });
  }

}]);
