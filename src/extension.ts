import * as fs from 'fs';
import * as open from './open';
import * as path from 'path';
import * as vscode from 'vscode';
import Symbols from './symbols';

//
// Extension activation
//

export function activate(context: vscode.ExtensionContext) {
  // sanity checking
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
    return;
  }

  //
  // registration
  //

  let symbols = new Symbols();

  context.subscriptions.push(vscode.commands.registerCommand('extension.open', open.open));
  context.subscriptions.push(vscode.commands.registerCommand('extension.rebuild', symbols.rebuild));
  context.subscriptions.push(vscode.languages.registerDefinitionProvider('ruby', symbols));
}
