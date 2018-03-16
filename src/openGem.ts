import * as gem from './gem';
import * as vscode from 'vscode';
import * as util from './util';

const openGem = async () => {
  try {
    await openGem0();
  } catch (error) {
    vscode.window.showErrorMessage(`Bust-A-Gem: ${error.message}`);
  }
};

const openGem0 = async () => {
  const bg = util.init();

  // load gems
  const gems = await gem.list(bg.rootPath);

  // turn gems into QuickPickItems
  const map = new Map<string, gem.Gem>();
  const items: vscode.QuickPickItem[] = gems.map(gem => {
    map.set(gem.label, gem);
    return { label: gem.label, description: '' };
  });

  const options = {
    placeHolder: 'Select a gem to open:',
  };

  // show quick picks
  vscode.window.showQuickPick(items, options).then(selection => {
    if (!selection) {
      return;
    }
    const g = <gem.Gem>map.get(selection.label);
    const uri = vscode.Uri.file(g.dir);
    vscode.commands.executeCommand('vscode.openFolder', uri);
  });
};

export default openGem;
