angular.module('displayInverter', [
	'ui.router',
	'listSites',
	'apiFactory'
])

	.controller('InverterCtrl', ['$scope', '$stateParams', '$http', '$log', '$state', 'dataFactory', function ($scope, $stateParams, $http, $log, $state, dataFactory) {

		var SP = $stateParams.siteResult; //get site from url for 
		var transformer = 1 || $stateParams.transformer; //default transformer if no transformer given
		var combineBox = 1 || $stateParams.combineBox; //default combineBox if not give in URL for query
		$scope.site = parseInt(SP);

		if (SP <= 4) { //this only runs the code for conergy sites as theyre the only one with multiple parameters for getting inverter information
			var groupings = [{ 'id': 1, 'combine': [10, 8, 8, 8, 8] }, { 'id': 2, 'combine': [9, 10, 8, 10, 10, 9, 8] }, { 'id': 3, 'combine': [8, 8, 10, 8] }, { 'id': 4, 'combinecb': [8, 10, 10, 10, 10, 10, 10, 10] }]; //array of objects showing how many combine 'combine' are in each site 'id'. There are 10 inverters in each combine.

			var siteInvs = groupings.filter(function (site) { return site.id == SP; })[0];
			$scope.numberOfTransformers = siteInvs.combine.length;
			$scope.numberOfCombines = siteInvs.combine[combineBox];
		}

		getInverterData(SP, transformer, combineBox);
		function getInverterData(SP, transformer, combineBox) { // function for getting data to fill table
			dataFactory.getInverterData(SP, transformer, combineBox) //call query to database
				.success(function (res) {
					$scope.inverterData = res;
				});
		}

		$scope.substringAng = function substringAng(word) { //to shrink name of inverters from query to a length that will fit comfortable in table
			if(word.length > 10) {
				return word.substr(9,6);
			} else if (word.length == 10) {
				return word.substr(9, 1);
			} else {
				return word.substr(9, 2);
			}
		};

		$scope.getTimes = function(number) { //ng-repeat only takes arrays, so this converts a number to an array to use with ng-repeat
			return new Array(number);
		};

	}]);