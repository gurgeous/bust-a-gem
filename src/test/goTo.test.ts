import { GoTo } from '../goTo';
import * as assert from 'assert';
import * as path from 'path';
import * as sinon from 'sinon';
import * as testHelpers from './testHelpers';
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

    // stub exec for sandbox & ripper-tags
    exec = testHelpers.stubGemList(sandbox);
    testHelpers.stubRipperTags(sandbox, exec);

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
    await checkDefinition(/^\s+p ::Hello::World/, /^\s+class World/);
  });

  it('tries to rip', async () => {
    testHelpers.stubTagsNotExist(sandbox);

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
    const showErrorMessage = sandbox.stub(vscode.window, 'showErrorMessage');
    await goTo.guard(null, async () => {
      throw new Error('whatever');
    });
    assert(showErrorMessage.firstCall.args[0].includes('whatever'));

    // check for special install message
    await goTo.guard(null, async () => {
      throw new Error('command not found');
    });
    assert(showErrorMessage.secondCall.args[0].includes('[Installation]'));
  });

  it('dirsToRip resolves gems', async () => {
    // eat messages
    const showWarningMessage = sandbox.stub(vscode.window, 'showWarningMessage');

    let dirs;

    // short label
    dirs = await goTo.dirsToRip(['memoist']);
    assert.equal(dirs.length, 2);
    assert(dirs[1].match(/memoist/));

    // label with version
    dirs = await goTo.dirsToRip(['memoist-0.16.0']);
    assert.equal(dirs.length, 2);
    assert(dirs[1].match(/memoist/));

    // bogus names are ignored
    dirs = await goTo.dirsToRip(['bogus']);
    assert.equal(dirs.length, 1);
    assert(showWarningMessage.firstCall.args[0].includes('bogus'));
  });
});
