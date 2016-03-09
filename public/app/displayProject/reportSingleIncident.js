angular.module('displaySingleReportsIncident', [
	'ui.router',
	'listSites',
	'apiFactory'
])

	.constant('_', window._)


	.controller('ReportSingleIncidentCtrl', ['$scope', '$stateParams', '$http', '$log', '$state', 'dataFactory', '$filter', function($scope, $stateParams, $http, $log, $state, dataFactory, $filter) {

		var SP = $stateParams.incidentId;
		$scope.param = SP;

		getIncidentCategory(SP); //gets summary array of site
		function getIncidentCategory(SP) {
			dataFactory.getIncidentCategory(SP)
				.success(function(res) {
					$scope.incidentCategory = res;
				});
		}

		$scope.editIncident = false;
		$scope.setEditIncident = function() {
			$scope.editIncident = !$scope.editIncident;
		}



		getIncidentReportLog(SP);
		function getIncidentReportLog(SP) {
			dataFactory.getIncidentReportLog(SP)
				.success(function(res) {
					$scope.incidentReportLog = res[0];
					if (res[0].reported_by_company === "Primrose") {
						$scope.reported_by_company = 1;
					} else if (res[0].reported_by_company === "EPC") {
						$scope.reported_by_company = 2;
					} else {
						$scope.reported_by_company = 3;
					}

					if (res[0].planned === "Unplanned") {
						$scope.planned = 2;
					} else if (res[0].planned === "Planned") {
						$scope.planned = 1;
					} else {
						$scope.planned = 0;
					}

					if (res[0].loss_of_generation === "No") {
						$scope.loss_of_generation = 0;
					} else {
						$scope.loss_of_generation = 1;
					}

					if (res[0].status === "Open") {
						$scope.status = 1;
					} else {
						$scope.status = 0;
					}

					$scope.category = $filter('filter')($scope.incidentCategory, { value: res[0].category })[0].id;

					$scope.editStartDate = new Date(
						($filter('date')(res[0].start_time, 'yyyy')),
						($filter('date')(res[0].start_time, 'MM')),
						($filter('date')(res[0].start_time, 'dd'))
					);
					$scope.editStartTime = new Date(
						($filter('date')(res[0].start_time, 'yyyy')),
						($filter('date')(res[0].start_time, 'MM')),
						($filter('date')(res[0].start_time, 'dd')),
						($filter('date')(res[0].start_time, 'HH')),
						($filter('date')(res[0].start_time, 'mm'))
					);
					if (res[0].end_time) {
						$scope.editEndDate = new Date(
							($filter('date')(res[0].end_time, 'yyyy')),
							($filter('date')(res[0].end_time, 'MM')),
							($filter('date')(res[0].end_time, 'dd'))
						);
						$scope.editEndTime = new Date(
							($filter('date')(res[0].end_time, 'yyyy')),
							($filter('date')(res[0].end_time, 'MM')),
							($filter('date')(res[0].end_time, 'dd')),
							($filter('date')(res[0].end_time, 'HH')),
							($filter('date')(res[0].end_time, 'mm'))
						);
					}

				});
		}

		getIncidentReportLogComment(SP);
		function getIncidentReportLogComment(SP) {
			dataFactory.getIncidentReportLogComment(SP)
				.success(function(res) {
					$scope.incidentReportLogComment = res;
				});
		}



	}]);
