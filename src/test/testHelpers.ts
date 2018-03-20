import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

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
