import * as assert from 'assert';
import * as vscode from 'vscode';
import { Etags } from '../../etags';
import * as testHelpers from '../testHelpers';

suite('Etags', () => {
  test('loads', async () => {
    const etags = new Etags(testHelpers.fixtureFile('TAGS'));
    await etags.load();

    const defs = etags.provideDefinition('Hello');
    assert.notEqual(defs.length, 0);

    const def = <vscode.Location>defs[0];
    assert(def.uri.path.includes('something'));
    assert.notEqual(def.range.start, 0);
  });

  test('fails on corrupt file', async () => {
    testHelpers.assertThrowsAsync(async () => {
      await new Etags(testHelpers.fixtureFile('TAGS.invalid')).load();
    }, /parse/);
  });
});
