import * as vscode from 'vscode';
import BustAGem from './bustAGem';
import Gem from './gem';

//
// Open Gem entry point. This is a try/catch wrapper around open0.
//

export const open = async () => {
  try {
    await open0();
  } catch (error) {
    console.error(error);
    vscode.window.showErrorMessage(`Bust-A-Gem: ${error.message}`);
  }
};

const open0 = async () => {
  // load gems, turn into QuickPickItems
  const bustAGem = BustAGem.singleton();
  const gems = await Gem.list(bustAGem.rootPath);
  const items = gems.map(gem => {
    return { label: gem.label, description: '', dir: gem.dir };
  });

  // show quick picks, then open that folder
  const options = { placeHolder: 'Select a gem to open' };
  vscode.window.showQuickPick(items, options).then(selection => {
    if (!selection) {
      return;
    }
    const uri = vscode.Uri.file(selection.dir);
    vscode.commands.executeCommand('vscode.openFolder', uri, true);
  });
};
