import { gemList } from './gemList';
import * as path from 'path';
import * as vscode from 'vscode';

const openGem = async () => {
  try {
    openGem0();
  } catch (error) {
    vscode.window.showErrorMessage(`Bust-A-Gem: ${error.message}`);
  }
};

const openGem0 = async () => {
  // load gems
  const dirs = await gemList();

  // turn list of dirs into QuickPickItems
  const labelToDirectory = new Map<string, string>();
  const items: vscode.QuickPickItem[] = dirs.map(dir => {
    const label = path.basename(dir);
    labelToDirectory.set(label, dir);
    return { label, description: '' };
  });

  // show quick picks
  const options = {
    placeHolder: 'Select a gem to open:',
  };
  vscode.window.showQuickPick(items, options).then(selection => {
    if (!selection) {
      return;
    }
    const dir = <string>labelToDirectory.get(selection.label);
    const uri = vscode.Uri.file(dir);
    vscode.commands.executeCommand('vscode.openFolder', uri);
  });
};

export default openGem;
