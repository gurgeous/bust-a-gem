/* global describe, it */

const { Etags } = require('../out/etags');
const assert = require('assert');
const path = require('path');

describe('etags', () => {
  it('etags.load', done => {
    const fixture = path.join(__dirname, 'fixtures/TAGS');
    const etags = new Etags(fixture);
    etags.load().then(() => {
      const tags = etags.provideDefinition('memoize');
      try {
        assert(tags.length !== 0);
        assert(tags[0].uri.path.includes('memoist'));
        assert(tags[0].range.line !== 0);
        done();
      } catch (error) {
        done(error);
      }
    }, done);
  });

  it('fails on corrupt file', done => {
    const fixture = path.join(__dirname, 'fixtures/TAGS.invalid');
    new Etags(fixture).load().then(
      () => done(new Error("etags.load should've rejected, but didn't")),
      () => done() // rejected, success!
    );
  });
});
