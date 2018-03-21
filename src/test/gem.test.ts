import { Gem } from '../gem';
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as testHelpers from './testHelpers';
import * as util from '../util';

describe('Gem', () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => (sandbox = sinon.sandbox.create()));
  afterEach(() => sandbox.restore());

  it('lists gems', async () => {
    testHelpers.stubGemList(sandbox);

    const gems = await Gem.list();
    assert.equal(gems.length, 3);

    const gem = gems[0];
    assert.equal(gem.dir, '/gems/2.5.0/gems/awesome_print-1.8.0');
    assert.equal(gem.label, 'awesome_print-1.8.0');
    assert.equal(gem.labelWithoutVersion, 'awesome_print');
  });

  it('fails on invalid gem lists', async () => {
    const stub = sandbox.stub(util, 'exec');

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
