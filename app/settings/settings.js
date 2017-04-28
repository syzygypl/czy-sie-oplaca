import module from '../module';
import template from './settings.pug';
import dialogTemplate from './dialog.pug';

class Dialog {
  constructor($mdEditDialog) {
    this.$mdEditDialog = $mdEditDialog;
  }
  get activeGroups() {
    return Object.keys(this.settings.groups).filter(key => this.settings.groups[key]).length;
  }

  getCurrentWage(group) {
    return this.settings.wages
      && this.settings.wages[group]
      && this.settings.wages[group][Object.keys(this.settings.wages[group]).sort((a, b) => a - b).pop()];
  }

  getCurrentWageTimestamp(group) {
    return this.settings.wages
      && this.settings.wages[group]
      && Object.keys(this.settings.wages[group]).sort((a, b) => a - b).pop();
  }

  getNewWageTimestamp(currentTimestamp) {
    const timestamp = new Date().getTime();

    if (isNaN(currentTimestamp)) {
      return timestamp;
    }

    if (new Date(currentTimestamp).toISOString().substring(0, 10) === new Date(timestamp).toISOString().substring(0, 10)) {
      return currentTimestamp;
    }

    return timestamp;
  }

  editWage(event, group) {
    // if (!this.localSettings.isEditEnabled) {
    //   this.$mdToast.showSimple('Changes disabled (can be enabled in settings).');
    //   return;
    // }

    event.stopPropagation(); // in case autoselect is enabled
    console.log(this.settings.wages[group]);
    this.$mdEditDialog.small({
      modelValue: this.getCurrentWage(group),
      placeholder: 'Set wage',
      save: (input) => {
        this.settings.wages = this.settings.wages || {};
        this.settings.wages[group] = this.settings.wages[group] || {};
        const timestamp = this.getNewWageTimestamp(parseInt(this.getCurrentWageTimestamp(group)));
        this.settings.wages[group][timestamp] =
          this.isValidNumber(input.$modelValue) ? Number(input.$modelValue) : null;
      },
      targetEvent: event,
      title: 'Set wage',
      validators: {
        'md-maxlength': 30,
      },
    });
  }

  isValidNumber(value) {
    return !isNaN(parseFloat(value)) && Number(value) >= 0;
  }

  save() {
    Object.assign(this.originalSettings, this.settings);
    this.originalSettings.$save();
    this.close();
  }

  close() {
    this.$mdDialog.hide();
  }
}
Dialog.$inject = ['$mdEditDialog'];

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
    console.log(settings);

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
        $mdDialog: $mdDialog,
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
