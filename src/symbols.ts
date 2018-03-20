import * as vscode from 'vscode';

//
// This class handles Go to Symbol. This implementation is really lame but it
// works fine.
//

const PATTERNS = [
  // class/module xyz
  /^\s*((?:class|module)\s+[A-Za-z][A-Za-z0-9_]*)/,

  // def xyz
  /^\s*(def\s+[A-Za-z][A-Za-z0-9._]*[!?]?)/,

  // attr_reader :hello, :world
  /^\s*(attr_(?:accessor|reader|writer)\s+:[A-Za-z][^#]*)/,
];

export class Symbols implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols = async (
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): Promise<vscode.SymbolInformation[]> => {
    const symbols: vscode.SymbolInformation[] = [];

    const text = document.getText();
    text.split('\n').forEach((line, index) => {
      PATTERNS.forEach(re => {
        const match = re.exec(line);
        if (match) {
          const name = match[0].replace(/\s+/g, ' ');
          const position = new vscode.Position(index, 0);
          const location = new vscode.Location(document.uri, position);
          const info = new vscode.SymbolInformation(name, vscode.SymbolKind.Function, '', location);
          symbols.push(info);
        }
      });
    });

    return symbols;
  };
}
