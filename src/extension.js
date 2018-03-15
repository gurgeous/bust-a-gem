const openGem = require('./openGem');
const vscode = require('vscode');

// Open Gem
//   support for dirs without Gemfile?

// Go to Definition
//   build tags for project
//   build tags for Gem
//   open tags file (or reload when stale)
//   complete

const activate = context => {
  console.log(openGem);
  context.subscriptions.push(vscode.commands.registerCommand('extension.openGem', openGem));
};
module.exports.activate = activate;
