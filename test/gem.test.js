/* global describe, it, beforeEach, afterEach */

const { Gem } = require('../out/gem');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const sinon = require('sinon');
const util = require('../out/util');

describe('Gem', () => {
  let sandbox;
  beforeEach(() => (sandbox = sinon.sandbox.create()));
  afterEach(() => sandbox.restore());

  it('Gem.list', done => {
    const fixture = path.join(__dirname, 'fixtures/gemlist');
    const gemlist = fs.readFileSync(fixture, { encoding: 'utf8' });
    sandbox.stub(util, 'exec').resolves(gemlist);

    Gem.list().then(gems => {
      try {
        assert(gems.length === 3);
        assert.equal(gems[0].dir, '/gems/2.5.0/gems/awesome_print-1.8.0');
        assert.equal(gems[0].label, 'awesome_print-1.8.0');
        assert.equal(gems[0].labelWithoutVersion, 'awesome_print');
        done();
      } catch (error) {
        done(error);
      }
    }, done);
  });

  it('Gem.list fails on empty', done => {
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
