import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { open } from '../../open';
import * as testHelpers from '../testHelpers';

suite('Open Gem', () => {
  test('creates quick picks', async () => {
    testHelpers.stubGemList(sinon, undefined);

    // fake showQuickPick
    const showQuickPick = sinon.stub(vscode.window, 'showQuickPick');

    await open();

    assert.equal(showQuickPick.callCount, 1);
    const items = <vscode.QuickPickItem[]>showQuickPick.firstCall.args[0];
    const labels = items.map((i) => i.label);
    assert.deepEqual(labels, ['awesome_print-1.8.0', 'memoist-0.16.0', 'uglifier-4.1.6-rc.2']);
  });
});
