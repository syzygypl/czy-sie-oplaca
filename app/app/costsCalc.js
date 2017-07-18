import groupTranslate from '../helpers/groupTranslate';

const sortAsc = (arr) => arr.sort((a, b) => a - b);

export default class CostsCalc {
  constructor(settings, worklogs, groups, toast) {
    this.settings = settings;
    this.worklogs = worklogs;
    this.groups = groups;
    this.toast = toast;
  }

  findProperWage(group, timestamp) {
    const wages = this.settings.wages && this.settings.wages[group];
    if (!wages) {
      return false;
    }

    const wageID = sortAsc(Object.keys(wages)).reduce((result, current) => { // eslint-disable-line max-len, arrow-body-style
      return parseInt(timestamp, 10) > parseInt(current, 10) ? current : result;
    });

    return wages[wageID];
  }

  getSubgroups(rootGroupName) {
    const regexString = `${rootGroupName}:.*`;
    const regex = new RegExp(regexString, 'i');
    return Object.keys(this.settings.groups).filter(groupName => regex.test(groupName));
  }

  calculateWorklogsDifference(current, previous) {
    return Object.keys(current)
      .reduce(
        (result2, groupID) => Object.assign({}, result2, {
          [groupID]: current[groupID] - (previous[groupID] || 0),
        }),
        {}
      );
  }

  calculateGroupCosts(group, worklogID, timespent) {
    const wage = this.findProperWage(group, worklogID);
    if (!wage) {
      return {
        cost: 0,
        totalTime: 0,
      };
    }

    return {
      cost: (wage || 0) * timespent / 3600,
      totalTime: timespent,
    };
  }

  calculateSubgroupsCosts(group, worklogID, worklogDifference) {
    const subgroups = this.getSubgroups(group);

    return subgroups.reduce((result, subgroupName) => {
      const subgroupTimespent = (worklogDifference[subgroupName] || 0);
      const costs = this.calculateGroupCosts(subgroupName, worklogID, subgroupTimespent);
      return {
        cost: result.cost + costs.cost,
        totalTime: result.totalTime + costs.totalTime,
      };
    }, {
      cost: 0,
      totalTime: 0,
    });
  }

  calculateTimespentCosts(v) {
    v.total_timespent = 0;
    const worklogs = this.worklogs[v.id];
    const worklogsIDs = sortAsc(Object.keys(worklogs));

    v.timespent = worklogs[worklogsIDs[worklogsIDs.length - 1]];

    this.groups.forEach(group => {
      const groupCosts = worklogsIDs.reduce((result, worklogID) => {
        const worklog = worklogs[worklogID];
        const worklogDifference = this.calculateWorklogsDifference(worklog, result.lastWorklog);
        const totalTimespent = worklogDifference[group];

        // Calculate subgroups costs
        const subResult = this.calculateSubgroupsCosts(group, worklogID, worklogDifference);
        result = Object.assign(
          {},
          result,
          {
            cost: result.cost + subResult.cost,
            totalTime: result.totalTime + subResult.totalTime,
          }
        );

        // Calculate remaining time after subgroups have been calculated
        const remainingTime = totalTimespent - result.totalTime;
        if (remainingTime > 0) {
          const costs = this.calculateGroupCosts(group, worklogID, remainingTime);
          if (costs.totalTime === 0 && remainingTime) {
            this.toast(
              `${v.name} | ${groupTranslate(group)} | 
               omitted cost calculations (${remainingTime} hours)`
            );
          }

          result = {
            cost: result.cost + costs.cost,
            totalTime: result.totalTime + costs.totalTime,
          };
        }

        result.lastWorklog = worklog;
        v.total_timespent += worklogDifference[group] || 0;

        return result;
      }, {
        cost: 0,
        totalTime: 0,
        lastWorklog: {},
      });


      v.groupsData.timespentCosts = v.groupsData.timespentCosts || {};
      v.groupsData.timespentCosts[group] = groupCosts.cost;
    });
  }
}
