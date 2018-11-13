import { Symbols } from '../symbols';
import * as assert from 'assert';
import * as testHelpers from './testHelpers';
import * as vscode from 'vscode';

describe('Symbols', () => {
  it('finds symbols', async () => {
    // Create fake document. Saves 100ms vs calling openDocument.
    const document = <vscode.TextDocument>{
      getText: () => testHelpers.readFixture('something.rb'),
      uri: vscode.Uri.file('/ignore'),
    };

    let symbols = new Symbols();
    const list = await symbols.provideDocumentSymbols(document, <vscode.CancellationToken>{});
    const names = list.map(i => i.name);
    assert.deepEqual(names, [
      'Hello',
      'World',
      ':a, :b',
      ':c, :d',
      ':e, :f',
      'a_real_method',
      'self.class_method',
      'gub',
      'question?',
      'exclamation!',
      'with_comment',
    ]);
  });
});
