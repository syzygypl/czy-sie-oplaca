import Firebase from 'firebase';
const firebase = new Firebase(process.env.FIREBASE_URL);
firebase.authWithCustomToken(process.env.FIREBASE_SECRET);

import module from '../module';
import template from './app.pug';
import './app.scss';

const subgroups = ['juniors', 'regulars', 'seniors'];

//helpers
const sortAsc = (arr) => arr.sort((a, b) => a - b);

class App {
  constructor($http, $firebaseArray, $firebaseObject, $mdEditDialog, $mdToast, $scope) {
    this.$mdEditDialog = $mdEditDialog;
    this.$mdToast = $mdToast;
    this.$scope = $scope;

    this.settings = $firebaseObject(firebase.child('settings'));
    this.localSettings = {
      hideReleased: true,
      hideArchived: true,
      hideNotEstimated: true,
      isEditEnabled: false,
    };

    this.orderBy = 'releaseDate';
    this.limit = 100;
    this.page = 1;

    this.data = $firebaseArray(firebase.child('versions'));
    this.worklogs = $firebaseObject(firebase.child('worklogs'));
    this.promise = Promise.all([this.data.$loaded(), this.worklogs.$loaded()]);

    this.promise.then(() => this.reload());
    this.resetPagination = this.resetPagination.bind(this);
    this.toastPromise = null;
  }

  get versions() {
    return this.data.filter(v => !(this.localSettings.hideArchived && v.archived
      || this.localSettings.hideReleased && v.released)
      && (!this.localSettings.hideNotEstimated || v.isEstimated));
  }

  get groups() {
    if (this.settings.groups) {
      return Object
       .keys(this.settings.groups)
       .filter(key => this.settings.groups[key]);
    }

    return [];
  }

  toast(msg) {
    if (!this.toastPromise) {
      this.toastPromise = this.$mdToast.showSimple(msg);
      this.toastPromise.then(()=>{this.toastPromise = null});
    } else {
      this.toastPromise.then(() => {
        this.toast(msg);
      })
    }
  }

  reload(version) {
    const data = version ? [version] : this.data;
    data.forEach(v => {
      v.isOverDeadline = v.releaseDate ? new Date(v.releaseDate).getTime() < Date.now() : false;
      v.isEstimated = false;

      if (v.groupsData) {
        v.isEstimated = true;
        this.calculateTimespentCosts(v);
        this.calculateBudgetLeft(v);
        this.calculateTotalGroupData(v);
      }
    });
  }

  findProperWage(group, timestamp) {
    const wages = this.settings.wages && this.settings.wages[group];
    if (!wages) {
     console.warn("wage not set for", group);
     return false;
    }

    const wageID = sortAsc(Object.keys(wages)).reduce((result, current) => {
      console.log(timestamp, current);
      return parseInt(timestamp, 10) > parseInt(current, 10) ? current : result;
    });

    return wages[wageID];
  }

  calculateTimespentCosts(v) {
    v.total_timespent = 0;
    const worklogs = this.worklogs[v.id];
    const worklogsIDs = sortAsc(Object.keys(worklogs));

    v.timespent = worklogs[worklogsIDs[worklogsIDs.length - 1]];

    this.groups.forEach(group => {
      const yay = worklogsIDs.reduce((result, worklogID) => {
        const worklog = worklogs[worklogID];
        const worklogDifference = Object.keys(worklog).reduce((result2, groupID) => {
          return Object.assign({}, result2, {
            [groupID]: worklog[groupID] - (result.lastWorklog[groupID] || 0)
          })
        }, {})
        v.total_timespent += worklogDifference[group] || 0;

        // calculate time costs
        const totalTimespent = worklogDifference[group];

        if (this.settings.groups[group + ':' + subgroups[0]] !== undefined) {
          result = subgroups.reduce((result, subgroupName) => {
            const wage = this.findProperWage(group + ':' + subgroupName, worklogID);
            if (!wage) {
              return result;
            }
            const subgroupTimespent = (worklogDifference[group + ':' + subgroupName] || 0);
            return {
              cost: result.cost + (wage || 0) * subgroupTimespent,
              totalTime: result.totalTime + subgroupTimespent
            }
          }, result);
        }

        const remainingTime = totalTimespent - result.totalTime;
        if (remainingTime > 0) {
          const wage = this.findProperWage(group, worklogID);
          console.log(wage);
          if (!wage) {
            this.toast(`${v.name} | ${group} | omitted cost calculations (${remainingTime} hours)`);
          }

          result = {
            cost: result.cost + (wage || 0) * remainingTime,
            totalTime: result.totalTime
          }
        }
          result.lastWorklog = worklog;
          return result;
      }, {
        cost: 0,
        totalTime: 0,
        lastWorklog: {},
      });


      v.groupsData.timespentCosts = v.groupsData.timespentCosts || {};
      v.groupsData.timespentCosts[group] = yay.cost;
      console.log(group, ":", yay, worklogs, v);

    });
  }

  calculateBudgetLeft(v) {
    v.groupsData.budgetLeft = v.groupsData.budgetLeft || {};
    v.groupsData.budget = v.groupsData.budget || {};
    v.groupsData.budgetLeft = v.groupsData.budgetLeft || {};
    v.groupsData.timespentCosts = v.groupsData.timespentCosts || {};
    v.groupsData.costsEXT = v.groupsData.costsEXT || {};
    this.groups.forEach(group => {
      v.groupsData.budgetLeft[group] =
        (v.groupsData.budget[group] || 0)
        - (v.groupsData.timespentCosts[group] || 0)
        - (v.groupsData.costsEXT[group] || 0);
    });
  }

  calculateTotalGroupData (v) {
    // Calculate total values of each group data
    Object.keys(v.groupsData).forEach(dataSet => {
      v[`total_${dataSet}`] = Object.values(v.groupsData[dataSet]).reduce((result, data) => result + data, 0);
    });
  }

  resetPagination() {
    this.page = 1;
  }

  isValidNumber(value) {
    return !isNaN(parseFloat(value)) && Number(value) >= 0;
  }
}
App.$inject = ['$http', '$firebaseArray', '$firebaseObject', '$mdEditDialog', '$mdToast', '$scope'];

module.component('app', {
  template,
  controller: App,
});
