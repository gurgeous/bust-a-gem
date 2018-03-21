import * as fs from 'fs';
import * as open from './open';
import * as path from 'path';
import * as vscode from 'vscode';
import { GoTo } from './goTo';
import { Symbols } from './symbols';

//
// Extension activation
//

const sanity = () => {
  try {
    if (!vscode.workspace.rootPath) {
      throw new Error('you must open a directory, not a file.');
    }
    if (!fs.existsSync(path.join(vscode.workspace.rootPath, 'Gemfile'))) {
      throw new Error('only works if you have a Gemfile in your project.');
    }
  } catch (error) {
    console.error(error);
    vscode.window.showErrorMessage(`Bust-A-Gem: ${error.message}`);
    return false;
  }
  return true;
};

//
// Activation. This gets called exactly once by VS Vode.
//

export function activate(context: vscode.ExtensionContext) {
  if (!sanity()) {
    return;
  }

  let goTo = new GoTo();
  let symbols = new Symbols();

  context.subscriptions.push(vscode.commands.registerCommand('extension.open', open.open));
  context.subscriptions.push(vscode.commands.registerCommand('extension.rebuild', goTo.rebuild));
  context.subscriptions.push(vscode.languages.registerDefinitionProvider('ruby', goTo));
  context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider('ruby', symbols));
}
