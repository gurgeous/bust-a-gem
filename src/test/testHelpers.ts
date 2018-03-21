import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';
import * as util from '../util';

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
export const stubTagsNotExist = (sandbox: sinon.SinonSandbox) => {
  const file = fixtureFile('TAGS');
  return sandbox
    .stub(fs, 'existsSync')
    .withArgs(file)
    .returns(false);
};
