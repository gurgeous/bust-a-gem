import openGem from './openGem';
import goToDefinition from './goToDefinition';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('extension.openGem', openGem));
  context.subscriptions.push(vscode.languages.registerDefinitionProvider('ruby', goToDefinition));
}
