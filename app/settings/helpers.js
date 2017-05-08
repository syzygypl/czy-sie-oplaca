export function convertTimestampToISO(timestamp) {
  return new Date(timestamp).toISOString().substring(0, 10);
}

export function getNewWageTimestamp(currentTimestamp) {
  const timestamp = new Date().getTime();

  if (isNaN(currentTimestamp)) {
    return timestamp;
  }

  if (convertTimestampToISO(currentTimestamp) === convertTimestampToISO(timestamp)) {
    return currentTimestamp;
  }

  return timestamp;
}

export function getLastWageTimestamp(wages, group) {
  return wages
    && wages[group]
    && Object.keys(wages[group]).sort((a, b) => a - b).pop();
}

export default {
  convertTimestampToISO,
  getNewWageTimestamp,
  getLastWageTimestamp,
};
