export default class Dialog {
  constructor($mdEditDialog, $mdToast) {
    this.$mdEditDialog = $mdEditDialog;
    this.$mdToast = $mdToast;
    this.editDialog = null;
  }
  get activeGroups() {
    return Object.keys(this.settings.groups).filter(key => this.settings.groups[key]);
  }

  editGroupData(event, group, dataName) {
    if (!this.localSettings.isEditEnabled) {
      this.$mdToast.showSimple('Changes disabled (can be enabled in settings).');
      return;
    }

    event.stopPropagation(); // in case autoselect is enabled
    const version = this.version;
    this.$mdEditDialog.small({
      modelValue:
      version.groupsData
      && version.groupsData[dataName]
      && version.groupsData[dataName][group],
      placeholder: `Set ${dataName}`,
      save: (input) => {
        version.groupsData = version.groupsData || {};
        version.groupsData = version.groupsData || {};
        version.groupsData[dataName] = version.groupsData[dataName] || {};
        version.groupsData[dataName][group] =
          this.isValidNumber(input.$modelValue) ? Number(input.$modelValue) : null;

        // this.reload(version);
        this.appCtrl.reload(version);
        this.data.$save(version);
      },
      targetEvent: event,
      title: `Set ${dataName}`,
      validators: {
        'md-maxlength': 30,
      },
    }).then(dialog => { this.editDialog = dialog; });
  }

  close() {
    if (this.editDialog) {
      this.editDialog.dismiss();
    }
    this.dialog.hide();
  }

  isValidNumber(value) {
    return !isNaN(parseFloat(value)) && Number(value) >= 0;
  }
}

Dialog.$inject = ['$mdEditDialog', '$mdToast'];
