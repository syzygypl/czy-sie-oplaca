#!/usr/bin/env node
require('dotenv').config({ silent: true });

const TIMESTAMP = new Date().getTime();

function migrate(_data) {
  const data = Object.assign({}, _data);

  const newData = Object.keys(data.versions).reduce((res, versionID) => {
    const version = data.versions[versionID];
    const worklog = version.timespent;
    version.groupsData = version.groupsData || {};
    version.groupsData.hours = version.estimate;

    delete version.timespent;
    delete version.estimate;
    delete version.totalTimespent;
    delete version.totalEstimate;

    const versions = Object.assign({}, res.versions, { [version.id]: version });
    const worklogs = Object.assign({}, res.worklogs, { [version.id]: { [TIMESTAMP]: worklog }});

    return {
      versions,
      worklogs,
    }
  }, {
    worklogs: {},
    versions: {},
  });

  data.versions = newData.versions;
  data.worklogs = newData.worklogs;

  return data;
}

var fs = require('fs');
fs.readFile("./dbsnapshot.json", 'utf8', function(err, _data) {
  if(err) {
    return console.log(err);
  }
  const data = JSON.parse(_data);

  const newData = migrate(data);

  fs.writeFile("./migrateddb.json", JSON.stringify(newData), (err) => console.log(err));

});
