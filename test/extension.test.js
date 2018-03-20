/* global describe it */

const assert = require('assert');
const path = require('path');
const { Etags } = require('../out/etags');

//
// Etags
//

describe('etags', () => {
  it('load and query TAGS', done => {
    const file = path.join(__dirname, 'TAGS');
    const etags = new Etags(file);
    etags.load().then(() => {
      const tags = etags.provideDefinition('memoize');
      assert(tags.length !== 0);
      assert(tags[0].uri.path.includes('memoist'));
      assert(tags[0].range.line !== 0);
      done();
    }, done);
  });

  it('throws on corrupt file', done => {
    const file = path.join(__dirname, 'index.js');
    new Etags(file).load().then(
      () => {
        done(new Error('etags loaded a corrupt file'));
      },
      () => {
        done(); // rejected, success!
      }
    );
  });
});
