import module from '../module';
import template from './details.pug';
import dialogTemplate from './dialog.pug';
import Dialog from './dialog';
import './details.scss';

class Settings {
  constructor($mdDialog) {
    this.$mdDialog = $mdDialog;
  }

  open($event) {
    const $mdDialog = this.$mdDialog;
    const version = this.version;
    const data = this.data;

    $mdDialog.show({
      targetEvent: $event,
      template: dialogTemplate,
      controller: Dialog,
      controllerAs: '$ctrl',
      bindToController: true,
      locals: {
        dialog: $mdDialog,
        version,
        localSettings: this.localSettings,
        settings: this.settings,
        data,
        appCtrl: this.appCtrl,
      },
    });
  }
}
Settings.$inject = ['$mdDialog'];

module.component('csoDetails', {
  template,
  controller: Settings,
  bindings: {
    version: '<',
    settings: '<',
    localSettings: '<',
    data: '<',
    appCtrl: '<',
  },
});
