import angular from 'angular';
import 'angularfire';
import 'angular-aria';
import 'angular-animate';
import 'angular-messages';
import 'angular-material';
import 'angular-material/angular-material.css';

// Table
import mdTable from 'angular-material-data-table';
import 'angular-material-data-table/dist/md-data-table.css';

export default angular
  .module('CzySieOplaca', ['ngMaterial', mdTable, 'firebase'])
  .config(['$locationProvider', $locationProvider => {
    $locationProvider.html5Mode(true);
  }])
  .config(['$mdThemingProvider', ($mdThemingProvider) => {
    $mdThemingProvider.theme('default')
      .primaryPalette('green', { default: '400' })
      .accentPalette('orange');
  }])
  .value('$routerRootComponent', 'app');

angular.element(document).ready(() => {
  angular.bootstrap(document.body, ['CzySieOplaca']);
});
