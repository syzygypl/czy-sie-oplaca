#!/usr/bin/env node
require('dotenv').config();

const Firebase = require('firebase');
const ref = new Firebase(process.env.FIREBASE_URL);

const versionsRef = ref.child('versions');
const settingsRef = ref.child('settings');

const exec = require('child_process').exec;
const cmd = './node_modules/.bin/jira-worklog'
  + ` -H ${process.env.JIRA_HOST}`
  + ` -u ${process.env.JIRA_USERNAME}`
  + ` -p ${process.env.JIRA_PASSWORD}`;

console.log('Loading data from jira-worklog...');

exec(cmd, (error, stdout) => {
  const data = JSON.parse(stdout);

  console.log('Processing firebase...');

  // Update
  settingsRef.once('value', (snapshot) => {
    const settings = snapshot.val() || {};
    settings.groups = settings.groups || {};
    const groups = {};

    Object.keys(data[0].timespent).forEach(key => {
      groups[key] = settings.groups[key] || false;
    });

    settings.groups = groups;
    settingsRef.update(settings);
  });

  Promise.all(data.map(v => versionsRef.child(v.id).update(v)))
    .then(() => {
      console.log('Firebase updated.');
      process.exit(0);
    });
});
