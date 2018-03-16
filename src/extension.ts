import openGem from './openGem';
// const openGem = require('./openGem');
// const goToDefinition = require('./goToDefinition');
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('extension.openGem', openGem));
  //   context.subscriptions.push(vscode.languages.registerDefinitionProvider('ruby', goToDefinition));
}
// module.exports.activate = activate;
