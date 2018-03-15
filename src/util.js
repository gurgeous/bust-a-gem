const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

//
// Look in dir and parents for filename. Returns full path when found.
//

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
module.exports.findFileUp = findFileUp;

//
// Find root dir for current project or file.
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
module.exports.rootDir = rootDir;
