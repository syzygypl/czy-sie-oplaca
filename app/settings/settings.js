import module from '../module';
import template from './settings.pug';
import dialogTemplate from './dialog.pug';

class Settings {
  constructor($mdDialog) {
    this.$mdDialog = $mdDialog;
  }

  open($event) {
    const $mdDialog = this.$mdDialog;
    const settings = this.settings;
    const cloneSettings = Object.assign({}, this.settings);
    cloneSettings.groups = Object.assign({}, this.settings.groups);

    $mdDialog.show({
      targetEvent: $event,
      template: dialogTemplate,
      controller: class Dialog {
        get activeGroups() {
          return Object.keys(this.settings.groups).filter(key => this.settings.groups[key]).length;
        }

        save() {
          Object.assign(settings, this.settings);
          settings.$save();
          this.close();
        }

        close() {
          $mdDialog.hide();
        }
      },
      controllerAs: '$ctrl',
      bindToController: true,
      locals: {
        settings: cloneSettings,
        localSettings: this.localSettings,
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
