import * as assert from 'assert';
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';
import * as util from '../util';
import * as vscode from 'vscode';

//
// this hook runs before everything
//

before(() => {
  // turn off command logging
  util.setQuiet();
});

// assert.throws for async functions
export const assertThrowsAsync = async (fn: any, regExp: RegExp) => {
  let f = () => {};
  try {
    await fn();
  } catch (e) {
    f = () => {
      throw e;
    };
  } finally {
    assert.throws(f, regExp);
  }
};

// get name of fixture file
export const fixtureFile = (file: string) => {
  return path.join(__dirname, `../../src/test/fixtures/${file}`);
};

// read fixture file
export const readFixture = (file: string) => {
  return fs.readFileSync(fixtureFile(file), { encoding: 'utf8' });
};

// make TAGS not found
export const stubTagsNotExist = (sandbox: sinon.SinonSandbox, stub?: sinon.SinonStub) => {
  const file = fixtureFile('TAGS');
  const applyTo = stub || sandbox.stub(fs, 'existsSync');
  applyTo.withArgs(file).returns(false);
  return applyTo;
};

// stub out all of child_process / exec
export const stubRipperTags = (sandbox: sinon.SinonSandbox, stub?: sinon.SinonStub) => {
  const applyTo = stub || sandbox.stub(child_process, 'exec');
  applyTo.callsArgWith(2, null, 'stdout');
  return applyTo;
};

// make bundle show --paths return the contents of gemlist
export const stubGemList = (sandbox: sinon.SinonSandbox, stub?: sinon.SinonStub) => {
  const applyTo = stub || sandbox.stub(child_process, 'exec');

  // copied from Gem.list
  const rootPath = <string>vscode.workspace.rootPath;
  const cmd = <string>vscode.workspace.getConfiguration('bustagem.cmd').get('bundle');
  const options = { timeout: util.seconds(3), cwd: rootPath };

  const gemlist = readFixture('gemlist');
  applyTo.withArgs(cmd, options).callsArgWith(2, null, gemlist);
  return applyTo;
};
