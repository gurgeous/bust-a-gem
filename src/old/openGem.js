const gemList = require('./gemList');
const path = require('path');
const vscode = require('vscode');

const openGem = () => {
  gemList().then(
    dirs => {
      // turn list of dirs into QuickPickItems
      const items = dirs.map(dir => {
        return { label: path.basename(dir), dir };
      });

      const options = {
        placeHolder: 'Select a gem to open:',
      };

      vscode.window.showQuickPick(items, options).then(selection => {
        if (!selection) {
          return;
        }

        const uri = vscode.Uri.file(selection.dir);
        vscode.commands.executeCommand('vscode.openFolder', uri);
      });
    },
    error => {
      vscode.window.showErrorMessage(`Bust-A-Gem: ${error.message}`);
    }
  );
};

module.exports = openGem;
