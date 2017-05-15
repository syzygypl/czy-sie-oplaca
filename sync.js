#!/usr/bin/env node
require('dotenv').config({ silent: true });

const Firebase = require('firebase');
const ref = new Firebase(process.env.FIREBASE_URL);
ref.authWithCustomToken(process.env.FIREBASE_SECRET);

const versionsRef = ref.child('versions');
const settingsRef = ref.child('settings');
const worklogsRef = ref.child('worklogs');
const timestamp = new Date().getTime();
const exec = require('sync-exec');
const cmd = './node_modules/.bin/jira-worklog'
  + ` -H ${process.env.JIRA_HOST}`
  + ` -u ${process.env.JIRA_USERNAME}`
  + ` -p ${process.env.JIRA_PASSWORD}`;

console.log('Loading data from jira-worklog...');

const result = exec(cmd);
const data = JSON.parse(result.stdout);

console.log('Processing firebase...');

function didWorklogChange(worklog1, worklog2) {
  for (var key of Object.keys(worklog1)) {
    if (worklog1[key] !== worklog2[key]) return true;
  }

  return Object.keys(worklog1).length !== Object.keys(worklog2).length;
}

function updateWorklog(worklogRef, timespent) {
  return worklogRef.limitToLast(1).once('value')
    .then((snapshot) => {
      const worklogsArray = snapshot.val();
      const lastWorklog = worklogsArray && worklogsArray[Object.keys(worklogsArray).sort((a, b) => a - b).pop()];

      if (!worklogsArray || didWorklogChange(lastWorklog, timespent)) {
        return worklogRef.child(timestamp).set(timespent);
      } else {
        return Promise.resolve();
      }
    });
}

function updateSettings(settingsRef, refGroups) {
  return settingsRef.once('value')
    .then((snapshot) => {
      const settings = snapshot.val() || {};
      settings.groups = settings.groups || {};
      const groups = {};
      refGroups.forEach(key => {
        groups[key] = settings.groups[key] || false;
      });

      settings.groups = groups;
      return settingsRef.update(settings);
    });
}

function updateVersions(worklogsRef, versionsRef, data) {
  return Promise.all(data.map(v => {
    const timespent = v.timespent;
    const versionWorklogsRef = worklogsRef.child(v.id);
    delete v.timespent; // do not pollute version data

    return Promise.all([
      versionsRef.child(v.id).update(v),
      updateWorklog(versionWorklogsRef, timespent)
    ])
  }));
}

function performUpdate(data, settingsRef, worklogsRef, versionsRef) {
  const groups = Object.keys(data[0].timespent);
  return Promise.all([
    updateSettings(settingsRef, groups),
    updateVersions(worklogsRef, versionsRef, data)
  ]);
}

performUpdate(
  data,
  settingsRef,
  worklogsRef,
  versionsRef
).then(() => {
  console.log('Firebase updated.');
  process.exit(0);
});
