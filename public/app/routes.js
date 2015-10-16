angular.module('routes', [
  'ui.router',
  'ngAnimate'
])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('parent', {
        url:'',
        abstract: true
    })
    .state('parent.listSites', { //list sites at the side of the bar on the fron page
      url:'',
      views: {
        'display@': {
          controller: 'MainCtrl',
          templateUrl: 'pages/select.tmpl.html'
        },
        'other@': {
          controller: 'MainCtrl',
          templateUrl: 'pages/selectList.tmpl.html'

        }
      }
    })
    .state('parent.displaySummaryProject', { //list the main body of the 'summary' page
      url:'/site/summary/:siteResult',
      views: {
        'display@': {
          controller: 'DisplayCtrl',
          templateUrl: 'pages/displaySite.tmpl.html'
        },
        'other@': {
          controller: 'DisplayCtrl',
          templateUrl: 'pages/displaySiteList.tmpl.html'
        }
      }
    })
    .state('parent.displayGenerationProject', { //list the main body of the 'generation' page
      url:'/site/generation/:siteResult',
      views: {
        'display@': {
          controller: 'ExportCtrl',
          templateUrl: 'pages/displaySiteGeneration.tmpl.html'
        },
        'other@': {
          controller: 'DisplayCtrl',
          templateUrl: 'pages/displaySiteList.tmpl.html'
        }
      }
    })
    .state('parent.displayInstallProject', { //list the main body of the 'finance' page
      url:'/site/install/:siteResult',
      views: {
        'display@': {
          controller: 'DisplayCtrl',
          templateUrl: 'pages/displaySiteInstall.tmpl.html'
        },
        'other@': {
          controller: 'DisplayCtrl',
          templateUrl: 'pages/displaySiteList.tmpl.html'
        }
      }
    })
    .state('parent.displayFinanceProject', { //list the main body of the 'finance' page
      url:'/site/finance/:siteResult',
      views: {
        'display@': {
          controller: 'DisplayCtrl',
          templateUrl: 'pages/displaySiteFinance.tmpl.html'
        },
        'other@': {
          controller: 'DisplayCtrl',
          templateUrl: 'pages/displaySiteList.tmpl.html'
        }
      }
    })
    .state('parent.displayAdminProject', { //list the main body of the 'admin' page
      url:'/site/admin/:siteResult',
      views: {
        'display@': {
          controller: 'DisplayCtrl',
          templateUrl: 'pages/displaySiteAdmin.tmpl.html'
        },
        'other@': {
          controller: 'DisplayCtrl',
          templateUrl: 'pages/displaySiteList.tmpl.html'
        }
      }
    })
    .state('parent.displayMKReport', { //list the main body of the 'admin' page
      url:'/site/report/:siteResult',
      views: {
        'display@': {
          controller: 'DisplayCtrl',
          templateUrl: 'pages/displaySiteMKReport.tmpl.html'
        },
        'other@': {
          controller: 'DisplayCtrl',
          templateUrl: 'pages/displaySiteList.tmpl.html'
        }
      }
    })
    .state('parent.displayRawReport', { //list the main body of the 'admin' page
      url:'/site/reportRaw/:siteResult',
      views: {
        'display@': {
          controller: 'ReportTestCtrl',
          templateUrl: 'pages/displaySiteRawReport.tmpl.html'
        },
        'other@': {
          controller: 'DisplayCtrl',
          templateUrl: 'pages/displaySiteList.tmpl.html'
        }
      }
    })
    .state('parent.displayOverReport', { //list the main body of the 'admin' page
      url:'/site/reportOver/:siteResult',
      views: {
        'display@': {
          controller: 'ReportTestCtrl',
          templateUrl: 'pages/displaySiteOverReport.tmpl.html'
        },
        'other@': {
          controller: 'DisplayCtrl',
          templateUrl: 'pages/displaySiteList.tmpl.html'
        }
      }
    })
    .state('parent.displaySDReport', { //list the main body of the 'admin' page
      url:'/site/reportSD/:siteResult',
      views: {
        'display@': {
          controller: 'ReportTestCtrl',
          templateUrl: 'pages/displaySiteSDReport.tmpl.html'
        },
        'other@': {
          controller: 'DisplayCtrl',
          templateUrl: 'pages/displaySiteList.tmpl.html'
        }
      }
    })
    ;
    // $urlRouterProvider.otherwise('/index'); //take to front page
    })
;
