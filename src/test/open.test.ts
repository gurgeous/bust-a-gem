/* global describe, it, beforeEach, afterEach */

import { open } from '../open';
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as testHelpers from './testHelpers';
import * as util from '../util';
import * as vscode from 'vscode';

describe('Open Gem', () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => (sandbox = sinon.sandbox.create()));
  afterEach(() => sandbox.restore());

  it('creates quick picks', async () => {
    const gemlist = testHelpers.readFixture('gemlist');
    sandbox.stub(util, 'exec').resolves(gemlist);

    // fake showQuickPick
    const qp = sandbox.stub(vscode.window, 'showQuickPick');

    await open();

    assert.equal(qp.callCount, 1);
    const items = <vscode.QuickPickItem[]>qp.firstCall.args[0];
    const labels = items.map(i => i.label);
    assert.deepEqual(labels, ['awesome_print-1.8.0', 'memoist-0.16.0', 'uglifier-4.1.6']);
  });
});
