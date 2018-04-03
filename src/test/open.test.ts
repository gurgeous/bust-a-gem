import { open } from '../open';
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as testHelpers from './testHelpers';
import * as vscode from 'vscode';

describe('Open Gem', () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => (sandbox = sinon.sandbox.create()));
  afterEach(() => sandbox.restore());

  it('creates quick picks', async () => {
    testHelpers.stubGemList(sandbox, undefined);

    // fake showQuickPick
    const showQuickPick = sandbox.stub(vscode.window, 'showQuickPick');

    await open();

    assert.equal(showQuickPick.callCount, 1);
    const items = <vscode.QuickPickItem[]>showQuickPick.firstCall.args[0];
    const labels = items.map(i => i.label);
    assert.deepEqual(labels, ['awesome_print-1.8.0', 'memoist-0.16.0', 'uglifier-4.1.6-rc.2']);
  });
});
