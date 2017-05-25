import { getNewWageTimestamp, getLastWageTimestamp } from './helpers';
import userRole from '../helpers/userRole';

export default class Dialog {
  constructor($mdEditDialog, $mdToast) {
    this.$mdEditDialog = $mdEditDialog;
    this.$mdToast = $mdToast;
    this.editDialog = null;
    this.userRole = userRole;
  }

  get activeGroups() {
    return Object.keys(this.settings.groups).filter(key => this.settings.groups[key]).length;
  }

  isSubgroup(group) {
    return !!~group.indexOf(':');
  }

  getCurrentWage(group) {
    const wages = this.settings.wages;
    return wages
      && wages[group]
      && wages[group][getLastWageTimestamp(wages, group)];
  }

  editWage(event, group) {
    if (!this.localSettings.isEditEnabled) {
      this.$mdToast.showSimple('Changes disabled (can be enabled in settings).');
      return;
    }

    event.stopPropagation(); // in case autoselect is enabled
    this.$mdEditDialog.small({
      modelValue: this.getCurrentWage(group),
      placeholder: 'Set wage',
      save: (input) => {
        const wages = this.settings.wages || {};
        const timestamp = getNewWageTimestamp(parseInt(getLastWageTimestamp(wages, group), 10));
        const newWage = this.isValidNumber(input.$modelValue) ? Number(input.$modelValue) : null;

        wages[group] = wages[group] || {};
        wages[group][timestamp] = newWage;
        this.settings.wages = wages;
      },
      targetEvent: event,
      title: 'Set wage',
      validators: {
        'md-maxlength': 30,
      },
    }).then(dialog => { this.editDialog = dialog; });
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
    if (this.editDialog) {
      this.editDialog.dismiss();
    }
    this.$mdDialog.hide();
  }
}
Dialog.$inject = ['$mdEditDialog', '$mdToast'];
