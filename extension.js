const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

// Open Gem
//   support for dirs without Gemfile?

// Go to Definition
//   build tags for project
//   build tags for Gem
//   open tags file (or reload when stale)
//   complete

//
// commands
//

const openGem = () => {
  // what dir are we in?
  const root = rootDir();
  if (!root) {
    return;
  }
  // find Gemfile in root
  const gemfile = findFileUp(root, 'Gemfile');
  if (!gemfile) {
    vscode.window.showErrorMessage("Bust-A-Gem: couldn't find Gemfile in ${root}.");
    return;
  }

  // list gems in there
  const cwd = path.dirname(gemfile);
  const options = { timeout: 3000, cwd };

  cp.exec('bundle show --paths', options, (error, stdout) => {
    if (error) {
      vscode.window.showErrorMessage(`Bust-A-Gem: ${error.message}`);
      return;
    }

    // parse list of dirs into QuickPickItems
    const dirs = stdout.split('\n');
    const items = dirs.map(dir => {
      return { label: path.basename(dir), dir };
    });

    vscode.window.showQuickPick(items).then(selection => {
      if (!selection) {
        return;
      }

      const uri = vscode.Uri.file(selection.dir);
      vscode.commands.executeCommand('vscode.openFolder', uri);
    });
  });
};

//
// main entry point
//

const activate = context => {
  context.subscriptions.push(vscode.commands.registerCommand('extension.openGem', openGem));
};
exports.activate = activate;

//
// helpers
//

const rootDir = () => {
  // is a project open? use that
  if (vscode.workspace.rootPath) {
    return vscode.workspace.rootPath;
  }

  // which file is active?
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('Bust-A-Gem: you have to open a file or project first.');
    return;
  }

  return path.dirname(editor.document.fileName);
};

const findFileUp = (dir, filename) => {
  const maybe = path.join(dir, filename);
  if (fs.existsSync(maybe)) {
    return maybe;
  }

  const parent = path.dirname(dir);
  if (parent && parent !== dir) {
    return findFileUp(parent, filename);
  }

  // failure
  return null;
};
