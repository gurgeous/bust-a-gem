import * as assert from 'assert';
import * as testHelpers from './testHelpers';
import * as util from '../util';

// turn off command logging
util.setQuiet();

describe('Util', () => {
  it('exec', async () => {
    // success
    const stdout = await util.exec('echo hello', {});
    assert.equal(stdout, 'hello\n');

    // failure
    testHelpers.assertThrowsAsync(async () => {
      await util.exec('this_command_does_not_exist', {});
    }, /./);
  });
});
