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

    $mdDialog.show({
      targetEvent: $event,
      template: dialogTemplate,
      controller: class Dialog {
        get activeGroups() {
          return Object.keys(this.groups).filter(key => this.groups[key]).length;
        }

        save() {
          settings.groups = this.groups;
          settings.$save();
          this.close();
        }

        close() {
          $mdDialog.hide();
        }
      },
      controllerAs: '$ctrl',
      bindToController: true,
      locals: { groups: Object.assign({}, settings.groups) },
    });
  }
}
Settings.$inject = ['$mdDialog'];

module.component('settings', {
  template,
  controller: Settings,
  bindings: {
    settings: '<',
  },
});
