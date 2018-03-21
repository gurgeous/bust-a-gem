import { GoTo } from '../goTo';
import * as assert from 'assert';
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';
import * as vscode from 'vscode';

// provideDefinition picks up ::
//
// guard: don't be reentrant (running)
// guard: errors should be displayed in the window
// guard: 'command not found' translates to nice error
//
// don't whine too often

describe('Go To Definition', () => {
  let sandbox: sinon.SinonSandbox;
  let document: vscode.TextDocument;
  const rootPath = <string>vscode.workspace.rootPath;

  //
  // hooks
  //

  before(async () => {
    // open something.rb as our document
    const something = path.join(rootPath, 'something.rb');
    document = await vscode.workspace.openTextDocument(something);
  });

  let exec: sinon.SinonStub;
  let goTo: GoTo;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    // never exec
    exec = sandbox.stub(child_process, 'exec').callsArgWith(2, null, 'stdout');
    goTo = new GoTo();
  });
  afterEach(() => sandbox.restore());

  //
  // tests
  //

  const checkDefinition = async (callSite: RegExp, defSite: RegExp) => {
    const lines = document.getText().split('\n');
    const callLineIndex = lines.findIndex(i => i.match(callSite) !== null);
    const defLineIndex = lines.findIndex(i => i.match(defSite) !== null);

    // assume offset 9 at call site
    // 01234567890
    // ......p gub
    const position = new vscode.Position(callLineIndex, 9);

    const definitions = <vscode.Location[]>await goTo.provideDefinition(document, position);
    assert.equal(definitions.length, 1);
    assert.equal(definitions[0].range.start.line, defLineIndex);
  };

  it('provides definitions', async () => {
    await checkDefinition(/^\s+p gub/, /^\s+def gub/);
    await checkDefinition(/^\s+p Hello::World/, /^\s+class World/);
  });

  it('tries to rip', async () => {
    // make TAGS not found
    sandbox.stub(fs, 'existsSync').returns(false);

    // go
    await goTo.provideDefinition0('gub');

    // did we try to rip?
    assert.equal(exec.callCount, 1);
    const args = exec.firstCall.args;
    assert(args[0].startsWith('ripper-tags'));
    assert.equal(args[1].cwd, rootPath);
  });
});
