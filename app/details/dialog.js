import groupTranslate from '../helpers/groupTranslate';

export default class Dialog {
  constructor($mdEditDialog, $mdToast) {
    this.$mdEditDialog = $mdEditDialog;
    this.$mdToast = $mdToast;
    this.editDialog = null;
    this.orderBy = 'name';
    this.reloadTableData();
  }

  get activeGroups() {
    return Object.keys(this.settings.groups).filter(key => this.settings.groups[key]);
  }

  reloadTableData() {
    this.version.groupsData = this.version.groupsData || {};
    this.tableData = this.activeGroups.map((group) => ({
      name: groupTranslate(group),
      originalGroupName: group,
      budget: this.version.groupsData.budget && this.version.groupsData.budget[group],
      hours: this.version.groupsData.hours && this.version.groupsData.hours[group],
      timespentCosts: this.version.groupsData.timespentCosts
                      && this.version.groupsData.timespentCosts[group],
      costsEXT: this.version.groupsData.costsEXT && this.version.groupsData.costsEXT[group],
      budgetLeft: this.version.groupsData.budgetLeft && this.version.groupsData.budgetLeft[group],
      timespent: this.version.timespent && this.version.timespent[group],
    }));
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
          this.isValidNumber(input.$modelValue) ? Number(input.$modelValue) : 0;

        this.appCtrl.reload(version);
        this.data.$save(version);
        this.reloadTableData();
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
