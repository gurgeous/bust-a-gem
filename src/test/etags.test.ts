import { Etags } from '../etags';
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as testHelpers from './testHelpers';

describe('etags', () => {
  it('loads', async () => {
    const etags = new Etags(testHelpers.fixtureFile('TAGS'));
    await etags.load();

    const defs = etags.provideDefinition('memoize');
    assert.notEqual(defs.length, 0);

    const def = <vscode.Location>defs[0];
    assert(def.uri.path.includes('memoist'));
    assert.notEqual(def.range.start, 0);
  });

  it('fails on corrupt file', async () => {
    testHelpers.assertThrowsAsync(async () => {
      await new Etags(testHelpers.fixtureFile('TAGS.invalid')).load();
    }, /parse/);
  });
});
