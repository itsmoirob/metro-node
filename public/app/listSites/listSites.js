angular.module('listSites', [
  'ui.router',
  'ngAnimate',
  'apiFactory'
],
function config($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
})

.constant('API_URL', 'http://localhost:3000')

.controller('MainCtrl', ['$scope', '$stateParams', '$http', '$log', 'dataFactory', 'UserFactory', function($scope,$stateParams,$http,$log,dataFactory,UserFactory){


  getIntroSites();
  function getIntroSites() {
    dataFactory.getPickUp()
    .success(function(res){
      $scope.introSites = res;
    });
  }

  var allSumData = [];
  var chartDate = [];

  getAllSiteDaily();
  function getAllSiteDaily(){
    dataFactory.allSiteDaily()
    .success(function(res){

      var groupings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function(i) { return "ps" + i; });
      // loop over the keys
      groupings.forEach(function (deviceName) {
        // data is one huge array that has readings for all sensors on each day
        // Use .map on the array to transform each element of the array.
        // The function will transform the array element by selecting a reading for a single device
        var dataForOneDevice = res.map(function(item) {
          return item[deviceName];
        });

        // add a new key (the value of sensorName, e.g. "ps1") to allSumData.
        allSumData.push({name: deviceName, data:dataForOneDevice});
      });


      angular.forEach(res, function(entry) {
        chartDate.push(moment(entry.date).format("MMM Do"));
      });

    });
  }

  //  Chart for export generation
  $scope.chartSumSites = {
    options: {
      chart: {
        type: 'line'
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
        footerFormat: '</table>',
        valueSuffix: ' kWH',
        shared: true,
        useHTML: true
      },
    },
    title: {
      text: 'Monthly Sum'
    },
    xAxis: {
      categories: chartDate,
      crosshair: true
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Generation (kWh)'
      }
    },
    series: allSumData,
    loading: false
  };

  var allSumDataMWp = [];

  getAllSiteDailyMWp();
  function getAllSiteDailyMWp(){
    dataFactory.allSiteDailyMWp()
    .success(function(res){

      var groupings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function(i) { return "ps" + i; });
      // loop over the keys
      groupings.forEach(function (deviceName) {
        // data is one huge array that has readings for all sensors on each day
        // Use .map on the array to transform each element of the array.
        // The function will transform the array element by selecting a reading for a single device
        var dataForOneDevice = res.map(function(item) {
          return item[deviceName];
        });

        // add a new key (the value of sensorName, e.g. "ps1") to allSumData.
        allSumDataMWp.push({name: deviceName, data:dataForOneDevice});
      });
    });
  }

  //  Chart for export generation
  $scope.chartSumMWpSites = {
    options: {
      chart: {
        type: 'line'
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
        footerFormat: '</table>',
        valueSuffix: ' kWH',
        shared: true,
        useHTML: true
      },
    },
    title: {
      text: 'Monthly kWh/MWp'
    },
    xAxis: {
      categories: chartDate,
      crosshair: true
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Generation (kWh/MWp)'
      }
    },
    series: allSumDataMWp,
    loading: false
  };

  UserFactory.getUser().then(function success(response) {
    $scope.user = response.data;
  });

  function login(username,password) {
    UserFactory.login(username,password).then(function success(response) {
      $scope.user = response.data.user;
      // alert(response.data.token);
    }, handleError);
  }

  function logout() {
    UserFactory.logout();
    $scope.user = null;
  }

  function handleError(response) {
    alert('Error: ' + response.data);
  }

}])


.factory('UserFactory', function UserFactory($http,API_URL, AuthTokenFactory, $q) {
  'use strict';
  return {
    login: login,
    logout: logout,
    getUser: getUser
  };

  function login(username,password) {
    return $http.post(API_URL + '/login', {
      username: username,
      password: password
    }).then(function success(response) {
      AuthTokenFactory.setToken(response.data.token);
      return response;
    });
  }

  function logout() {
    AuthTokenFactory.setToken();
  }

  function getUser() {
    if (AuthTokenFactory.getToken()) {
      return $http.get(API_URL + '/me');
    } else {
      return $q.reject({ data: 'Client has no auth token'});
    }
  }
}
)

.factory('AuthTokenFactory', function AuthTokenFactory($window) {
  'use strict';
  var store = $window.localStorage;
  var key = 'auth-token';

  return {
    getToken: getToken,
    setToken: setToken
  };

  function getToken() {
    return store.getItem(key);
  }

  function setToken(token) {
    if (token) {
      store.setItem(key, token);
    } else {
      store.removeItem(key);
    }
  }
})

.factory('AuthInterceptor', function AuthInterceptor(AuthTokenFactory) {
  'use strict';
  return {
    request: addToken
  };

  function addToken(config) {
    var token = AuthTokenFactory.getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  }
})

;
