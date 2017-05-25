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
    const szgGreen = $mdThemingProvider.extendPalette('green', {
      500: '66ee66',
    });
    $mdThemingProvider.definePalette('szgGreen', szgGreen);
    const szgOrange = $mdThemingProvider.extendPalette('orange', {
      500: 'FFFF45',
    });
    $mdThemingProvider.definePalette('szgOrange', szgOrange);
    $mdThemingProvider.theme('default')
      .primaryPalette('szgGreen', { default: '500' })
      .accentPalette('szgOrange', { default: '500' });
  }])
  .value('$routerRootComponent', 'app');

angular.element(document).ready(() => {
  angular.bootstrap(document.body, ['CzySieOplaca']);
});
