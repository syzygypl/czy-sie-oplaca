import module from '../module';
import template from './priceTag.pug';
import './priceTag.scss';
class PriceTag {}
module.component('csoPriceTag', {
  template,
  controller: PriceTag,
  bindings: {
    budget: '<',
  },
});
