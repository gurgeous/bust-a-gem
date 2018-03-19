import * as _ from 'lodash';
import * as util from './util';

//
// VS Code can call provideDefinition quite aggressively, so bail right away if
// we showed an error recently. Try not to be annoying.
//

export default class NoWhine {
  // When did we last show the 'ripper-tags not found' error?
  private errorAt = 0;

  // reset when the user rebuilds
  reset() {
    this.errorAt = 0;
  }

  // should we bail early because an error occurred recently?
  tooSoon() {
    return _.now() - this.errorAt < util.seconds(10);
  }

  // note that an install error occurred
  onError() {
    this.errorAt = _.now();
  }
}
