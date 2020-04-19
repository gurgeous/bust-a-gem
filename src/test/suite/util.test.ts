import * as assert from 'assert';
import * as util from '../../util';
import * as testHelpers from '../testHelpers';

suite('Util', () => {
  test('exec', async () => {
    // success
    const stdout = await util.exec('echo hello', {});
    assert.equal(stdout, 'hello\n');

    // failure
    testHelpers.assertThrowsAsync(async () => {
      await util.exec('this_command_does_not_exist', {});
    }, /./);
  });
});
