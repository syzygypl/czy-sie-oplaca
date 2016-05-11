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
    this.orderBy = 'projectKey';

    this.data = $firebaseArray(firebase.child('versions'));
    this.promise = this.data.$loaded();

    this.data.$loaded().then(() => this.reloadTotalTimespent());
    this.settings.$watch(() => this.reloadTotalTimespent());

    this.jiraHost = process.env.JIRA_HOST;
  }

  reloadTotalTimespent() {
    this.data.forEach(version => {
      version.totalTimespent =
        this.groups.reduce((acc, group) => {
          if (version.estimate && version.estimate[group]) {
            acc = acc + version.timespent[group];
          }
          return acc;
        }, 0);
    });
  }

  totalEstimate(version) {
    return this.groups.reduce((acc, group) => {
      if (!version.estimate) {
        return acc;
      }
      return acc + (version.estimate[group] || 0);
    }, 0);
  }

  get groups() {
    if (this.settings.groups) {
      return Object
       .keys(this.settings.groups)
       .filter(key => this.settings.groups[key]);
    }

    return [];
  }

  editEstimate($event, version, group) {
    event.stopPropagation(); // in case autoselect is enabled

    this.$mdEditDialog.small({
      modelValue: (version.estimate && version.estimate[group]) || 0,
      placeholder: 'Add estimation',
      save: (input) => {
        version.estimate = version.estimate || {};
        version.estimate[group] = Number(input.$modelValue) || 0;

        this.data.$save(version);
        this.reloadTotalTimespent();
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
