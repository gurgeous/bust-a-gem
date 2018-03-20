/* global describe, it, beforeEach, afterEach */

const { Etags } = require('../out/etags');
const { Gem } = require('../out/gem');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const sinon = require('sinon');
const util = require('../out/util');

//
// sinon sandbox
//

let sandbox;
beforeEach(() => (sandbox = sinon.sandbox.create()));
afterEach(() => sandbox.restore());

//
// Etags
//

describe('etags', () => {
  it('loads and queries TAGS', done => {
    const fixture = path.join(__dirname, 'fixtures/TAGS');
    const etags = new Etags(fixture);
    etags.load().then(() => {
      const tags = etags.provideDefinition('memoize');
      assert(tags.length !== 0);
      assert(tags[0].uri.path.includes('memoist'));
      assert(tags[0].range.line !== 0);
      done();
    }, done);
  });

  it('throws on corrupt file', done => {
    const fixture = path.join(__dirname, 'fixtures/TAGS.invalid');
    new Etags(fixture).load().then(
      () => done(new Error("etags.load should've rejected, but didn't")),
      () => done() // rejected, success!
    );
  });
});

//
// Gem
//

describe('Gem', () => {
  it('Gem.list works', done => {
    const fixture = path.join(__dirname, 'fixtures/gemlist');
    const gemlist = fs.readFileSync(fixture, { encoding: 'utf8' });
    sandbox.stub(util, 'exec').resolves(gemlist);

    Gem.list().then(gems => {
      assert(gems.length === 3);
      assert.equal(gems[0].dir, '/gems/2.5.0/gems/awesome_print-1.8.0');
      assert.equal(gems[0].label, 'awesome_print-1.8.0');
      assert.equal(gems[0].labelWithoutVersion, 'awesome_print');
      done();
    }, done);
  });

  it('rejects on empty', done => {
    sandbox.stub(util, 'exec').resolves('');
    Gem.list().then(
      () => done(new Error("Gem.list should've rejected, but didn't")),
      () => done() // rejected, success!
    );
  });

  it('rejects on invalid', done => {
    sandbox.stub(util, 'exec').resolves('what?');
    Gem.list().then(
      () => done(new Error("Gem.list should've rejected, but didn't")),
      () => done() // rejected, success!
    );
  });
});
