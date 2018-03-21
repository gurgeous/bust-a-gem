import * as vscode from 'vscode';

//
// This class handles Go to Symbol. This implementation is really lame but it
// works fine. We iterate line by line looking for some regular expressions.
//
// I thought it might be more efficient to search the entire document for each
// regex (instead of line by line) but this turned out to be slower. Perhaps
// because vscode takes a while to convert file offsets into Positioins.
//

const PATTERNS = [
  // class/module xyz
  /^\s*((?:class|module)\s+[A-Za-z][A-Za-z0-9_]*)/,

  // def xyz
  /^\s*(def\s+[A-Za-z][A-Za-z0-9._]*[!?]?)/,

  // attr_reader :hello, :world
  /^\s*(attr_(?:accessor|reader|writer)\s+:[A-Za-z][^#\n]*)/,
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
          const name = match[0].replace(/\s+/g, ' ').trim();
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
