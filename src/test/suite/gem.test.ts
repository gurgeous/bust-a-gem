import * as assert from 'assert';
import * as sinon from 'sinon';
import { Gem } from '../../gem';
import * as util from '../../util';
import * as testHelpers from '../testHelpers';

suite('Gem', () => {
  test('lists gems', async () => {
    testHelpers.stubGemList(sinon);

    const gems = await Gem.list();
    assert.equal(gems.length, 3);

    const gem = gems[0];
    assert.equal(gem.dir, '/gems/2.5.0/gems/awesome_print-1.8.0');
    assert.equal(gem.label, 'awesome_print-1.8.0');
  });

  test('fails on invalid gem lists', async () => {
    const stub = sinon.stub(util, 'exec');

    stub.resolves('');
    testHelpers.assertThrowsAsync(async () => {
      await Gem.list();
    }, /gem.list/);

    stub.resolves('bogus');
    testHelpers.assertThrowsAsync(async () => {
      await Gem.list();
    }, /gem.list/);
  });
});
