import module from '../module';

const formatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  minimumFractionDigits: 0,
});

module.filter('csoCurrency', () => (item) => formatter.format(item));
