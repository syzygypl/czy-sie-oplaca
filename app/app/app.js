import Firebase from 'firebase';
const firebase = new Firebase(process.env.FIREBASE_URL);
firebase.authWithCustomToken(process.env.FIREBASE_SECRET);

import module from '../module';
import template from './app.pug';
import './app.scss';

class App {
  constructor($http, $firebaseArray, $firebaseObject, $mdEditDialog) {
    this.$mdEditDialog = $mdEditDialog;

    this.settings = $firebaseObject(firebase.child('settings'));
    this.orderBy = 'releaseDate';
    this.jiraHost = process.env.JIRA_HOST;
    this.limit = 50;
    this.page = 1;

    this.data = $firebaseArray(firebase.child('versions'));
    this.promise = this.data.$loaded();

    this.data.$loaded().then(() => this.reload());
    this.resetPagination = this.resetPagination.bind(this);
  }

  get versions() {
    return this.data.filter(v => !(this.settings.hideArchived && v.archived
      || this.settings.hideReleased && v.released));
  }

  get groups() {
    if (this.settings.groups) {
      return Object
       .keys(this.settings.groups)
       .filter(key => this.settings.groups[key]);
    }

    return [];
  }

  reload(version) {
    const data = version ? [version] : this.data;

    data.forEach(v => {
      v.isOverDeadline = v.releaseDate ? new Date(v.releaseDate).getTime() < Date.now() : false;

      v.totalTimespent = v.totalEstimate = v.budget = 0;

      this.groups.forEach(group => {
        if (v.timespent && v.timespent[group]) {
          v.totalTimespent += v.timespent[group] || 0;
        }

        if (v.estimate && v.estimate[group]) {
          v.totalEstimate += v.estimate[group] || 0;
        }
      });

      if (v.totalEstimate) {
        v.budget = Math.round((v.totalTimespent / v.totalEstimate) * 100);
      }
    });
  }

  resetPagination() {
    this.page = 1;
  }

  editEstimate($event, version, group) {
    event.stopPropagation(); // in case autoselect is enabled

    this.$mdEditDialog.small({
      modelValue: (version.estimate && version.estimate[group]) || '',
      placeholder: 'Add estimation',
      save: (input) => {
        version.estimate = version.estimate || {};
        version.estimate[group] = Number(input.$modelValue) || 0;

        this.reload(version);
        this.data.$save(version);
      },
      targetEvent: event,
      title: 'Add estimation',
      validators: {
        'md-maxlength': 30,
      },
    });
  }
}
App.$inject = ['$http', '$firebaseArray', '$firebaseObject', '$mdEditDialog'];

module.component('app', {
  template,
  controller: App,
});
