angular.module('routes', [
	'ui.router',
	'ngAnimate'
])

	.config(function ($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('parent', {
				url: '',
				abstract: true
			})
			.state('parent.listSites', { //list sites at the side of the bar on the fron page
				url: '',
				views: {
					'display@': {
						controller: 'SiteCtrl',
						templateUrl: 'pages/select.tmpl.html'
					},
					'altDisplay@': {
						controller: 'EveleyCtrl',
						templateUrl: 'pages/displayEveley.tmpl.html'
					},
					'other@': {
						controller: 'ListCtrl',
						templateUrl: 'pages/selectList.tmpl.html'

					}
				}
			})
			.state('parent.displaySummaryProject', { //list the main body of the 'summary' page
				url: '/site/summary?siteResult',
				views: {
					'display@': {
						controller: 'DisplayCtrl',
						templateUrl: 'pages/displaySite.tmpl.html'
					},
					'other@': {
						controller: 'ListCtrl',
						templateUrl: 'pages/displaySiteList.tmpl.html'
					}
				}
			})
			.state('parent.displayGenerationProject', { //list the main body of the 'generation' page
				url: '/site/generation?siteResult',
				views: {
					'display@': {
						controller: 'ExportCtrl',
						templateUrl: 'pages/displaySiteGeneration.tmpl.html'
					},
					'other@': {
						controller: 'ListCtrl',
						templateUrl: 'pages/displaySiteList.tmpl.html'
					}
				}
			})
			.state('parent.displayInstallProject', { //list the main body of the 'finance' page
				url: '/site/install?siteResult',
				views: {
					'display@': {
						controller: 'DisplayCtrl',
						templateUrl: 'pages/displaySiteInstall.tmpl.html'
					},
					'other@': {
						controller: 'ListCtrl',
						templateUrl: 'pages/displaySiteList.tmpl.html'
					}
				}
			})
			.state('parent.displayFinanceProject', { //list the main body of the 'finance' page
				url: '/site/finance?siteResult',
				views: {
					'display@': {
						controller: 'DisplayCtrl',
						templateUrl: 'pages/displaySiteFinance.tmpl.html'
					},
					'other@': {
						controller: 'ListCtrl',
						templateUrl: 'pages/displaySiteList.tmpl.html'
					}
				}
			})
			.state('parent.displayAdminProject', { //list the main body of the 'admin' page
				url: '/site/admin?siteResult',
				views: {
					'display@': {
						controller: 'DisplayCtrl',
						templateUrl: 'pages/displaySiteAdmin.tmpl.html'
					},
					'other@': {
						controller: 'ListCtrl',
						templateUrl: 'pages/displaySiteList.tmpl.html'
					}
				}
			})
			.state('parent.displayMKReport', { //list the main body of the 'admin' page
				url: '/site/report?siteResult',
				views: {
					'display@': {
						controller: 'DisplayCtrl',
						templateUrl: 'pages/displaySiteMKReport.tmpl.html'
					},
					'other@': {
						controller: 'ListCtrl',
						templateUrl: 'pages/displaySiteList.tmpl.html'
					}
				}
			})
			.state('parent.reportsAll', { //list the main body of the 'admin' page
				url: '/reportsAll?startDate&endDate',
				views: {
					'display@': {
						controller: 'ReportCtrl',
						templateUrl: 'pages/reportsAll.tmpl.html'
					},
					'other@': {
						controller: 'ListCtrl',
						templateUrl: 'pages/selectList.tmpl.html'
					}
				}
			})
			.state('parent.monthReportPage', { //list the main body of the 'admin' page
				url: '/site/monthReport?siteResult&month',
				views: {
					'display@': {
						controller: 'monthReportCtrl',
						templateUrl: 'pages/monthlyReportPage.tmpl.html'
					},
					'other@': {
						controller: 'ListCtrl',
						templateUrl: 'pages/displaySiteList.tmpl.html'
					}
				}
			})
			.state('parent.monthReportPortfolio', { //list the main body of the 'admin' page
				url: '/portfolio/monthReport?month',
				views: {
					'display@': {
						controller: 'PortfolioReportCtrl',
						templateUrl: 'pages/reportPortfolio.tmpl.html'
					},
					'other@': {
						controller: 'ListCtrl',
						templateUrl: 'pages/selectList.tmpl.html'
					}
				}
			})
			.state('parent.yearReportPortfolio', { //list the main body of the 'admin' page
				url: '/portfolio/yearReport',
				views: {
					'display@': {
						controller: 'PortfolioReportCtrl',
						templateUrl: 'pages/reportPortfolioYear.tmpl.html'
					},
					'other@': {
						controller: 'ListCtrl',
						templateUrl: 'pages/selectList.tmpl.html'
					}
				}
			})
			.state('parent.displayEveleyDB', { //list the main body of the 'summary' page
				url: '/welcomeToEveley',
				views: {
					'altDisplay@': {
						controller: 'EveleyCtrl',
						templateUrl: 'pages/displayEveley.tmpl.html'
					},
					'other@': {
						// controller: 'ListCtrl',
						// templateUrl: 'pages/displaySiteList.tmpl.html'
					}
				}
			})
			;
		// $urlRouterProvider.otherwise('/index'); //take to front page
	})
	;
