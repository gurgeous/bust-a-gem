/* global describe, it, beforeEach, afterEach */

const { open } = require('../out/open');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const sinon = require('sinon');
const util = require('../out/util');
const vscode = require('vscode');

describe('Open Gem', () => {
  let sandbox;
  beforeEach(() => (sandbox = sinon.sandbox.create()));
  afterEach(() => sandbox.restore());

  it('works', done => {
    // util.exec() should return gemlist
    const fixture = path.join(__dirname, 'fixtures/gemlist');
    const gemlist = fs.readFileSync(fixture, { encoding: 'utf8' });
    sandbox.stub(util, 'exec').resolves(gemlist);

    // fake showQuickPick
    const qp = sandbox.stub(vscode.window, 'showQuickPick');

    open().then(() => {
      try {
        assert.equal(qp.callCount, 1);
        const items = qp.firstCall.args[0];
        const labels = items.map(i => i.label);
        assert.deepEqual(labels, ['awesome_print-1.8.0', 'memoist-0.16.0', 'uglifier-4.1.6']);
        done();
      } catch (error) {
        done(error);
      }
    }, done);
  });
});
