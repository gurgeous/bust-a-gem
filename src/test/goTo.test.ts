import { GoTo } from '../goTo';
import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as sinon from 'sinon';
import * as testHelpers from './testHelpers';
import * as util from '../util';
import * as vscode from 'vscode';

// provideDefinition will rip, then answer
// provideDefinition picks up ::
// provideDefinition won't rip twice
//
// guard: don't be reentrant (running)
// guard: errors should be displayed in the window
// guard: 'command not found' translates to nice error
//
// don't whine too often

describe.only('Go To Definition', () => {
  let sandbox: sinon.SinonSandbox;
  let rootPath: string;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    // create new workspace and make vscode think we are in there
    rootPath = path.join(os.tmpdir(), 'bustagem_tests');
    fs.removeSync(rootPath);
    fs.mkdirpSync(rootPath);
    sandbox.stub(vscode.workspace, 'rootPath').returns(rootPath);

    // copy files into place
    ['Gemfile', 'something.rb'].forEach(name => {
      fs.copySync(testHelpers.fixtureFile(name), path.join(rootPath, name));
    });
    console.log('root is ' + rootPath);
  });
  afterEach(() => sandbox.restore());

  it('works', async () => {
    // open document
    const something = path.join(rootPath, 'something.rb');
    const document = await vscode.workspace.openTextDocument(something);
    // // Create fake document. Saves 100ms vs calling openDocument.
    // const document = <vscode.TextDocument>{
    //   getText: () => testHelpers.readFixture('something.rb'),
    //   uri: vscode.Uri.file('/ignore'),
    // };

    //
    const goTo = new GoTo();
    // const gub = await goTo.provideDefinition(document, new vscode.Position(2, 11));
    const gub = await goTo.provideDefinition0('Hello');
    console.log(gub);
  });
});
