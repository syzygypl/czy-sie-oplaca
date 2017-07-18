import module from '../module';

module.filter('csoToHours', () => (hours) => (Math.round(hours / 3600 * 100) / 100));
