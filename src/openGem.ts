import { gemList } from './gemList';
import * as path from 'path';
import * as vscode from 'vscode';

const openGem = () => {
  gemList().then(
    (dirs: string[]) => {
      const labelToDirectory: { [key: string]: string } = {};

      // turn list of dirs into QuickPickItems
      const items: vscode.QuickPickItem[] = dirs.map(dir => {
        const label = path.basename(dir);
        labelToDirectory[label] = dir;
        return { label, description: '' };
      });
      const options = {
        placeHolder: 'Select a gem to open:',
      };
      vscode.window.showQuickPick(items, options).then(selection => {
        if (!selection) {
          return;
        }
        const dir = labelToDirectory[selection.label];
        const uri = vscode.Uri.file(dir);
        vscode.commands.executeCommand('vscode.openFolder', uri);
      });
    },
    (error: Error) => {
      vscode.window.showErrorMessage(`Bust-A-Gem: ${error.message}`);
    }
  );
};
export default openGem;
