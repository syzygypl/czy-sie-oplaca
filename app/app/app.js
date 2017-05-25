import Firebase from 'firebase';
const firebase = new Firebase(process.env.FIREBASE_URL);
firebase.authWithCustomToken(process.env.FIREBASE_SECRET);

import module from '../module';
import template from './app.pug';
import './app.scss';
import CostsCalc from './costsCalc';

class App {
  constructor($firebaseArray, $firebaseObject, $mdEditDialog, $mdToast, $scope) {
    this.$mdEditDialog = $mdEditDialog;
    this.$mdToast = $mdToast;
    this.$scope = $scope;

    this.settings = $firebaseObject(firebase.child('settings'));
    this.localSettings = {
      hideReleased: true,
      hideArchived: true,
      hideNotEstimated: true,
      isEditEnabled: false,
      filterArchived: false,
    };

    this.orderBy = 'projectKey';
    this.limit = 100;
    this.page = 1;

    this.data = $firebaseArray(firebase.child('versions'));
    this.worklogs = $firebaseObject(firebase.child('worklogs'));
    this.promise = Promise.all([this.data.$loaded(), this.worklogs.$loaded()]);


    this.resetPagination = this.resetPagination.bind(this);
    this.toast = this.toast.bind(this);
    this.toastPromise = null;

    this.$scope.$watch(
      '$ctrl.activeTab',
      (newValue) => {
        if (newValue === 1) {
          this.showArchive();
        } else {
          this.showCurrent();
        }
      }
    );

    this.promise.then(() => {
      this.costsCalculator = new CostsCalc(this.settings, this.worklogs, this.groups, this.toast);
      this.reload();
    });
  }

  get versions() {
    let data = this.data.filter(v => (!this.localSettings.hideNotEstimated || v.isEstimated));

    if (this.localSettings.filterArchived) {
      data = data.filter(v => v.released || v.archived);
    } else {
      data = data.filter(v => !(v.released || v.archived));
    }

    data = data.filter(v => !v.hidden);

    return data;
  }

  get groups() {
    if (this.settings.groups) {
      return Object
       .keys(this.settings.groups)
       .filter(key => this.settings.groups[key]);
    }

    return [];
  }

  showArchive() {
    this.localSettings.filterArchived = true;
  }

  showCurrent() {
    this.localSettings.filterArchived = false;
  }

  toast(msg) {
    if (!this.toastPromise) {
      this.toastPromise = this.$mdToast.showSimple(msg);
      this.toastPromise.then(() => { this.toastPromise = null; });
    } else {
      this.toastPromise.then(() => {
        this.toast(msg);
      });
    }
  }

  reload(version) {
    const data = version ? [version] : this.data;
    data.forEach(v => {
      v.isOverDeadline = v.releaseDate ? new Date(v.releaseDate).getTime() < Date.now() : false;
      v.isEstimated = false;

      if (v.groupsData) {
        v.isEstimated = true;
        this.costsCalculator.calculateTimespentCosts(v);
        this.calculateBudgetLeft(v);
        this.calculateTotalGroupData(v);
      }
    });
  }

  calculateBudgetLeft(v) {
    v.groupsData.budgetLeft = v.groupsData.budgetLeft || {};
    v.groupsData.budget = v.groupsData.budget || {};
    v.groupsData.timespentCosts = v.groupsData.timespentCosts || {};
    v.groupsData.costsEXT = v.groupsData.costsEXT || {};
    this.groups.forEach(group => {
      v.groupsData.budgetLeft[group] =
        (v.groupsData.budget[group] || 0)
        - (v.groupsData.timespentCosts[group] || 0)
        - (v.groupsData.costsEXT[group] || 0);
    });
  }

  calculateTotalGroupData(v) {
    // Calculate total values of each group data
    const groups = this.groups;

    Object.keys(v.groupsData).forEach(dataSet => {
      v[`total_${dataSet}`] = Object
        .keys(v.groupsData[dataSet])
        .reduce((result, key) => {
          if (!!~groups.indexOf(key)) {
            const data = v.groupsData[dataSet][key];
            return result + this.normalizeNumber(data);
          }
          return result;
        }, 0);
    });
  }

  normalizeNumber(number) {
    return !isNaN(parseFloat(number)) ? number : 0;
  }

  resetPagination() {
    this.page = 1;
  }

  isValidNumber(value) {
    return !isNaN(parseFloat(value)) && Number(value) >= 0;
  }
}
App.$inject = ['$firebaseArray', '$firebaseObject', '$mdEditDialog', '$mdToast', '$scope'];

module.component('app', {
  template,
  controller: App,
});
