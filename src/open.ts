import * as vscode from 'vscode';
import { Gem } from './gem';

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
  const gems = await Gem.list();
  const items = gems.map(gem => {
    return { label: gem.label, description: '', dir: gem.dir };
  });

  // show quick picks, then open that folder
  const options = { placeHolder: 'Select a gem to open' };
  const selection = await vscode.window.showQuickPick(items, options);
  if (!selection) {
    return;
  }
  const uri = vscode.Uri.file(selection.dir);
  vscode.commands.executeCommand('vscode.openFolder', uri, true);
};
