angular.module('displaySite', [
	'ui.router',
	'ngAnimate',
	'apiFactory',
	'uiGmapgoogle-maps'
],
	function config($httpProvider) {
		$httpProvider.interceptors.push('AuthInterceptor');
	})

	.constant('API_URL', 'http://localhost:3000')

	.controller('SiteCtrl', ['$scope', '$stateParams', '$http', '$log', 'dataFactory', 'UserFactory', function ($scope, $stateParams, $http, $log, dataFactory, UserFactory) {

		getIncidentReport();
		function getIncidentReport() {
			dataFactory.getIncidentReport()
				.success(function (res) {
					$scope.incidentReport = res;
				});
		}

		var allSumData = [];
		var chartDate = [];

		var groupingSwitch = 1;

		var groupedGroupings = [{ id: 1, sites: [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
			{ id: 2, sites: [1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 16] }];

		var selectedGrouping = groupedGroupings[groupingSwitch].sites;

		getAllSiteDaily();
		function getAllSiteDaily() {
			dataFactory.allSiteDaily()
				.success(function (res) {
					var groupings = selectedGrouping.map(function (i) { return "ps" + i; });
					// loop over the keys
					groupings.forEach(function (deviceName) {
						// data is one huge array that has readings for all sensors on each day
						// Use .map on the array to transform each element of the array.
						// The function will transform the array element by selecting a reading for a single device
						var dataForOneDevice = res.map(function (item) {
							return item[deviceName];
						});
						// add a new key (the value of sensorName, e.g. "ps1") to allSumData.
						allSumData.push({ name: deviceName, data: dataForOneDevice });
					});
					angular.forEach(res, function (entry) {
						chartDate.push(moment(entry.date).format("MMM Do"));
					});
					$scope.siteLatest = res[res.length - 1];
				});
		}

		var allSumDataMWp = [];
		getAllSiteDailyMWp();
		function getAllSiteDailyMWp() {
			dataFactory.allSiteDailyMWp()
				.success(function (res) {
					var groupings = selectedGrouping.map(function (i) { return "ps" + i; });
					// loop over the keys
					groupings.forEach(function (deviceName) {
						// data is one huge array that has readings for all sensors on each day
						// Use .map on the array to transform each element of the array.
						// The function will transform the array element by selecting a reading for a single device
						var dataForOneDevice = res.map(function (item) {
							return item[deviceName];
						});
						// add a new key (the value of sensorName, e.g. "ps1") to allSumData.
						allSumDataMWp.push({ name: deviceName, data: dataForOneDevice });
					});
				});
		}

		var allDailyEsol = [];

		getAllSiteDailyEsol();
		function getAllSiteDailyEsol() {
			dataFactory.allSiteDailyEsol()
				.success(function (res) {
					var groupings = selectedGrouping.map(function (i) { return "PS" + i; });
					// loop over the keys
					groupings.forEach(function (deviceName) {
						// data is one huge array that has readings for all sensors on each day
						// Use .map on the array to transform each element of the array.
						// The function will transform the array element by selecting a reading for a single device
						var dataForOneDevice = res.map(function (item) {
							return item[deviceName];
						});
						// add a new key (the value of sensorName, e.g. "ps1") to allSumData.
						allDailyEsol.push({ name: deviceName, data: dataForOneDevice });
					});
				});
		}

		//  Chart for export generation
		$scope.chartSumSites = {
			options: {
				chart: {
					type: 'spline'
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


		//  Chart for export generation
		$scope.chartSumMWpSites = {
			options: {
				chart: {
					type: 'spline'
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

		//  Chart for export generation
		$scope.chartEsolSites = {
			options: {
				chart: {
					type: 'spline'
				},
				tooltip: {
					headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
					pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
					'<td style="padding:0"><b>{point.y:.3f}</b></td></tr>',
					footerFormat: '</table>',
					valueSuffix: ' kWH',
					shared: true,
					useHTML: true
				},
			},
			title: {
				text: 'Daily esol'
			},
			xAxis: {
				categories: chartDate,
				crosshair: true
			},
			yAxis: {
				min: 0,
				title: {
					text: 'Irradiation'
				}
			},
			series: allDailyEsol,
			loading: false
		};

		mapAllSiteCoords();
		function mapAllSiteCoords() {
			dataFactory.getAllSiteCoords()
				.success(function (res) {
					$scope.res = res;
					var latMin = Math.min.apply(null, res.map(function (item) {
						return item.latitude;
					}))
					var latMax = Math.max.apply(null, res.map(function (item) {
						return item.latitude;
					}))
					var mapLat = (latMin + latMax) / 2;
					var longMin = Math.min.apply(null, res.map(function (item) {
						return item.longitude;
					}))
					var longMax = Math.max.apply(null, res.map(function (item) {
						return item.longitude;
					}))
					var mapLong = (longMin + longMax) / 2;
					$scope.map = { center: { latitude: mapLat, longitude: mapLong }, zoom: 6 };
					$scope.markers = [];
					angular.forEach(res, function (res) {
						$scope.markers.push({
							id: res.id,
							coords: {
								latitude: res.latitude,
								longitude: res.longitude
							},
							window: {
								title: res.name
							}
						});
					});;
				});
		}

		UserFactory.getUser().then(function success(response) {
			$scope.user = response.data;
		});

		function login(username, password) {
			UserFactory.login(username, password).then(function success(response) {
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


	.factory('UserFactory', function UserFactory($http, API_URL, AuthTokenFactory, $q) {
		'use strict';
		return {
			login: login,
			logout: logout,
			getUser: getUser
		};

		function login(username, password) {
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
				return $q.reject({ data: 'Client has no auth token' });
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
