import module from '../module';
import template from './settings.pug';
import dialogTemplate from './dialog.pug';
import Dialog from './dialog';

class Settings {
  constructor($mdDialog) {
    this.$mdDialog = $mdDialog;
  }

  open($event) {
    const $mdDialog = this.$mdDialog;
    const settings = this.settings;
    const cloneSettings = Object.assign({}, this.settings);
    cloneSettings.groups = Object.assign({}, this.settings.groups);
    cloneSettings.wages = Object.assign({}, this.settings.wages);

    $mdDialog.show({
      targetEvent: $event,
      template: dialogTemplate,
      controller: Dialog,
      controllerAs: '$ctrl',
      bindToController: true,
      locals: {
        settings: cloneSettings,
        originalSettings: settings,
        localSettings: this.localSettings,
        $mdDialog,
      },
    });
  }
}
Settings.$inject = ['$mdDialog'];

module.component('settings', {
  template,
  controller: Settings,
  bindings: {
    settings: '<',
    localSettings: '<',
  },
});
