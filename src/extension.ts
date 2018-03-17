import * as goTo from './goTo';
import * as open from './open';
import * as vscode from 'vscode';

// TODO
//
// test all errors
// great error handling (ripper-tags, bad gem names, escaping, etc.)
// README
// release
//

//
// Extension activation
//

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('extension.open', open.open));
  context.subscriptions.push(vscode.commands.registerCommand('extension.rebuild', goTo.rebuild));
  context.subscriptions.push(vscode.languages.registerDefinitionProvider('ruby', goTo.goTo));
}
