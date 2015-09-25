angular.module('displayExport', [
  'ui.router',
  'listSites',
  'apiFactory'
])

.controller('ExportCtrl', ['$scope', '$stateParams', '$http', '$log', '$state','dataFactory', function($scope,$stateParams,$http,$log,$state,dataFactory){

  var SP = $stateParams.siteResult;
  var highChartsData = {
    name: "Export",
    data : [],
    yAxis: 0
  };
  var highChartsPyro = {
    name: "Pyro mean",
    data: [],
    yAxis: 1
  };

  getChartExportGeneration(SP);
  function getChartExportGeneration(SP){
    dataFactory.getSiteExportGeneration(SP)
    .success(function(res){
      angular.forEach(res, function(res) {
        highChartsData.data.push([res.timeU,res.generation]);
      });
    });
  }
  getChartMeanPyro(SP);
  function getChartMeanPyro(SP){
    dataFactory.getChartPyro(SP)
    .success(function(res){
      angular.forEach(res, function(res) {
        highChartsPyro.data.push([res.timeU,res.avgPyro]);
      });
    });
  }
  $scope.result = highChartsPyro;

  //  Chart for export generation
  $scope.chartExport = {
    options: {
      chart: {
        zoomType: 'x'
      },
      rangeSelector: {
        allButtonsEnabled: true,
        enabled: true
      },
      navigator: {
        enabled: true
      }
    },
    yAxis: [{
               title: {
                   text: 'Generation'
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

  $scope.chartExport.series.push(highChartsData);
  $scope.chartExport.series.push(highChartsPyro);

}]);
