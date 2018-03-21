import { GoTo } from '../goTo';
import * as assert from 'assert';
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';
import * as vscode from 'vscode';

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

  it('provides definitions', async () => {
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

    await checkDefinition(/^\s+p gub/, /^\s+def gub/);
    await checkDefinition(/^\s+p Hello::World/, /^\s+class World/);
  });

  it('tries to rip', async () => {
    // make TAGS not found
    sandbox.stub(fs, 'existsSync').returns(false);

    // go
    await goTo.provideDefinition0('gub');

    // did we try to rip?
    const args = exec.firstCall.args;
    assert(args[0].startsWith('ripper-tags'));
    assert.equal(args[1].cwd, rootPath);
  });

  it('guards against reentrant', async () => {
    // this resolves after 5ms
    goTo.guard(null, () => {
      return new Promise((resolve, reject) => setTimeout(resolve, 5));
    });

    // guard shouldn't let this one run
    let neverRan = true;
    await goTo.guard(null, async () => (neverRan = false));
    assert(neverRan);
  });

  it('displays errors', async () => {
    // eat messages
    exec = sandbox.stub(vscode.window, 'showErrorMessage');
    await goTo.guard(null, async () => {
      throw new Error('whatever');
    });
    assert(exec.firstCall.args[0].includes('whatever'));

    // check for special install message
    await goTo.guard(null, async () => {
      throw new Error('command not found');
    });
    assert(exec.secondCall.args[0].includes('[Installation]'));
  });

  // dirsToRip: translation for gems (with and without versions)
  // dirsToRip: skipping of unknown gem dirs
});
