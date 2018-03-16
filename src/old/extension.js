const openGem = require('./openGem');
const goToDefinition = require('./goToDefinition');
const vscode = require('vscode');

const activate = context => {
  context.subscriptions.push(vscode.commands.registerCommand('extension.openGem', openGem));
  context.subscriptions.push(vscode.languages.registerDefinitionProvider('ruby', goToDefinition));
};
module.exports.activate = activate;
