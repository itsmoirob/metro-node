angular.module('displayProject', [
  'ui.router',
  'ngAnimate',
  'listSites',
  'uiGmapgoogle-maps',
  'highcharts-ng',
  'apiFactory'
])

.controller('DisplayCtrl', ['$scope', '$stateParams', '$http', '$log', '$state','dataFactory', function($scope,$stateParams,$http,$log,$state,dataFactory){

  var SP = $stateParams.siteResult;
  var highChartsData = {
    data : []
  };
  var pyroChartsData = {
    data : []
  };

  getSiteSummary(SP); //gets summary array of site
  function getSiteSummary(SP) {
    dataFactory.getSiteSummary(SP)
    .success(function(res){
      $scope.currentDisplaySite = res;
      $scope.map = { center: { latitude: res[0].latitude, longitude: res[0].longitude }, zoom: 16 }; //sets up gmaps
      $scope.marker = { //sets up pin for gmaps
        id: $stateParams.siteResult,
        coords: {
          latitude: res[0].latitude,
          longitude: res[0].longitude
        },
        options: { draggable: true }
      };
    });
  }

  getSiteInverterGeneration(SP); //gets inverter generation array of site
  function getSiteInverterGeneration(SP) {
    dataFactory.getSiteInverterGeneration(SP)
    .success(function(res){
      var groupByInverterNumber = _.groupBy(res, 'inverter_number'); //group it by inverter number
      var display = []; //prepare to set data up to use in highcharts-ng
      angular.forEach(groupByInverterNumber, function( row, id ) {
        var length = display.push({
          id: id,
          data: []
        });
        angular.forEach(row, function(pit) {
          display[length - 1].data.push([pit.timeU,pit.generation]);
        });
      });
      $scope.siteInverterGeneration = display;

      // Chart for inverter generation
      $scope.chartConfig = {
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
        series: display,
        title: {
          text: 'Generation at inverter'
        },
        useHighStocks: true
      };
    });
  }

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

  getEPC(SP);
  function getEPC(SP) {
    dataFactory.getEPC(SP)
    .success(function(res){
      $scope.epc = res;
    });
  }

  getAdmin(SP);
  function getAdmin(SP) {
    dataFactory.getAdmin(SP)
    .success(function(res){
      $scope.admin = res;
    });
  }

  getSitePyro(SP);
  function getSitePyro(SP){
    dataFactory.getSitePyro(SP)
    .success(function(res){
      var display = []; //prepare to set data up to use in highcharts-ng
      angular.forEach(res, function(res) {
        pyroChartsData.data.push([res.timeU,res.average]);
      });

      var sitePyro = pyroChartsData;
      $scope.sitePyro = pyroChartsData;
      //  Chart for export generation
      $scope.chartPyro = {
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
          text: 'Pyro'
        },
        useHighStocks: true
      };

      $scope.chartPyro.series.push(pyroChartsData);
    });
  }


}]);
